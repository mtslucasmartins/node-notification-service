const { WSNotificationProducer } = require('./streams');
const { WSConnectionRepository, WSInstanceRepository } = require('./repository');

// TODO: switch for environment variables
const KAFKA_TOPIC = 'ottimizza.websocket-notifications.general';

class WSMessagingService {

  constructor() {
    this.repository = new WSConnectionRepository();
  }

  broadcast(message) {
    this.repository.findAll()
      .forEach(([key, value]) => {
        // TODO: remove this line switch for 'value'
        const connection = this.repository.findBySId(key);
        connection.ws.send(JSON.stringify(message));
      });
  }

  sendMessage(message, options) {
    const channel = options.channel;
    const username = options.username;

    console.log(`sending message - channel=[${channel}] username=[${username}]`);

    if (this.notEmpty(channel)) {
      return this.#sendMessageByChannel(message, channel);
    }

    if (this.notEmpty(username)) {
      return this.#sendMessageByUsername(message, username);
    }
  }

  #sendMessageByChannel(message, channel) {
    console.log(`sending message - channel=[${channel}]`);

    console.log(this.repository.findByChannel(channel));

    this.repository.findByChannel(channel)
      .forEach(([key, value]) => {
        // TODO: remove this line switch for 'value'
        const connection = this.repository.findBySId(key);
        connection.ws.send(JSON.stringify(message));
      });
  }

  #sendMessageByUsername(message, username) {
    console.log(`sending message - username=[${username}]`);
    this.repository.findByUsername(username)
      .forEach(([key, value]) => {
        // TODO: remove this line switch for 'value'
        const connection = this.repository.findBySId(key);
        connection.ws.send(JSON.stringify(message));
      });
  }

  notEmpty(value) {
    return (typeof value !== 'undefined' || value !== null || value !== '');
  }

}

class WSNotificationService {

  constructor() {
    this.messagingService = new WSMessagingService();
    this.producer = new WSNotificationProducer(KAFKA_TOPIC);
  }

  async publish(notification) {
    await this.producer.connect();

    const channel = notification.channel;
    const username = notification.username;
    const message = notification.message;

    this.producer.send(JSON.stringify({ channel, username, message }));
  }

  process(notification) {
    const channel = notification.channel;
    const username = notification.username;
    const message = notification.message;

    console.log(`processing notification - channel=[${channel}] username=[${username}]`);
    this.messagingService.sendMessage(message, { channel, username });
  }

}

class WSConsumerService {

  ALL_CONSUMERS_KEY = 'consumers';
  AVAILABLE_CONSUMERS_KEY = 'consumers:availables';

  constructor() {
    // TODO: create an global instance of redis shared to repositories
    this.instanceRepository = new WSInstanceRepository();
    this.instanceRepository.connect();
  }

  getAvailableConsumer() {

  }

}

class WSInstanceService {

  static INSTANCES_KEY = 'instances';
  static ALL_INSTANCES_KEY = 'instances:all';

  constructor() {
    this.consumerService = new WSConsumerService();
    this.instanceRepository = new WSInstanceRepository();
    this.instanceRepository.connect();
  }

  async get(instanceId) {
    return this.instanceRepository.get(instanceId);
  }

  async getAllKeys() {
    return this.get(WSInstanceService.INSTANCES_KEY);
  }

  async save(instanceId) {
    let instance = this.get(instanceId);
    let isNewInstance = false;
    const createdAt = new Date();
    const updatedAt = new Date();

    if (instance == null) {
      // creating a brand new instance. TODO: create a redis lock.
      const consumer = this.consumerService.getAvailableConsumer();
      instance = { consumer, instanceId, updatedAt, createdAt };
      isNewInstance = true;
    } else {
      // only updates it, so the cleaning job doesn't kill it
      instance = Object.assign(instance, { updatedAt });
    }

    // saving the instance to Redis.
    this.instanceRepository.set(instanceId, instance);

    // we also need to update the key containing all instances
    if (isNewInstance) {
      const allInstances = this.instanceRepository.get(WSInstanceService.INSTANCES_KEY);
      allInstances.push(instanceId);
      this.instanceRepository.set(WSInstanceService.INSTANCES_KEY, allInstances);
    }

    return instance; 
  }

}

module.exports = {
  WSMessagingService,
  WSNotificationService,
  WSConsumerService,
  WSInstanceService
};
