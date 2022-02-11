const { WSNotificationProducer } = require('./streams');
const { WSConnectionRepository, WSInstanceRepository, WSConsumerRepository } = require('./repository');

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

  KEY_CONSUMERS = 'consumers';
  KEY_CONSUMERS_AVAILABLES = 'consumers:availables';

  constructor() {
    // TODO: create an global instance of redis shared to repositories
    this.consumerRepository = new WSConsumerRepository();
  }

  async insertConsumers(consumers) {
    return this.consumerRepository.set(this.KEY_CONSUMERS, JSON.stringify(consumers))
      .then(() => {
        return this.getConsumers();
      });
  }

  async getConsumers() {
    return this.consumerRepository.get(this.KEY_CONSUMERS)
      .then((consumers) => {
        if (!!consumers)
          return JSON.parse(consumers)
        return [];
      });
  }

  async getAvailableConsumers() {
    return this.consumerRepository.get(this.KEY_CONSUMERS_AVAILABLES)
      .then((consumers) => {
        if (!!consumers)
          return JSON.parse(consumers)
        return [];
      });
  }

  async getAvailableConsumer() {
    return this.getAvailableConsumers().then((consumers) => {

    });
  }

}

class WSInstanceService {
  static CONSUMERS = ['1', '2', '3', '4'];
  static CONSUMERS_AVAILABLES_KEY = 'consumers:availables';

  static INSTANCES_KEY = 'instances';
  static ALL_INSTANCES_KEY = 'instances:all';

  constructor() {
    this.consumerService = new WSConsumerService();
    this.instanceRepository = new WSInstanceRepository();
  }

  async get(instanceId) {
    const instance = await this.instanceRepository.get(instanceId);
    return !!instance ? JSON.parse(instance) : null;
  }

  async getAllKeys() {
    try {
      const allInstances = await this.instanceRepository.get(WSInstanceService.INSTANCES_KEY);
      console.log(`[ws-instance-service] fetching instances - [${!!allInstances}] instances:['${allInstances}']`);
      if (!!allInstances) {
        return JSON.parse(allInstances);
      }
    } catch (e) {
      console.log(`[ws-instance-service] something went wrong fetching active instances!`);
    }
    return [];
  }

  async save(instanceId) {
    console.log(`[ws-instance-service] saving instance - instance:[${instanceId}]`);

    try {
      let instance = await this.get(instanceId);
      let isNewInstance = false;
      const createdAt = new Date();
      const updatedAt = new Date();

      if (instance == null) {
        // creating a brand new instance. TODO: create a redis lock.
        const consumer = await this.consumerService.getAvailableConsumer();
        instance = { consumer, instanceId, updatedAt, createdAt };
        console.log(`[ws-instance-service] creating brand new instance - details:[${JSON.stringify(instance)}]`);

        isNewInstance = true;
      } else {
        console.log(`[ws-instance-service] updating existing instance - details:[${JSON.stringify(instance)}]`);
        instance = Object.assign(instance, { updatedAt });
      }

      console.log(`[ws-instance-service] saving instance - instance:[${instanceId}]`);
      this.instanceRepository.set(instanceId, JSON.stringify(instance));

      // we also need to update the key containing all instances
      if (isNewInstance) {
        let allInstances = await this.getAllKeys(); // defaults to empty array
        allInstances.push(instanceId);
        console.log(`[ws-instance-service] adding instance to active instances array - instance:[${instanceId}] `, JSON.stringify(allInstances));
        await this.instanceRepository.set(WSInstanceService.INSTANCES_KEY, JSON.stringify(allInstances));
      }

      return instance;
    } catch (error) {
      console.log(`[ws-instance-service] something went wrong saving instance - instance:[${instanceId}]`, error);
    }

    return null;
  }

  async prune(instanceId) {
    console.log(`[ws-instance-service] pruning instance - instance:[${instanceId}]`);
    try {
      let allInstances = await this.getAllKeys(); // defaults to empty array

      await this.instanceRepository.del(instanceId);

      allInstances = allInstances.filter((e) => e != instanceId);

      await this.instanceRepository.set(WSInstanceService.INSTANCES_KEY, JSON.stringify(allInstances));
    } catch (error) {
      console.log(`[ws-instance-service] something went wrong pruning instance - instance:[${instanceId}]`, error);
    }
  }

}

module.exports = {
  WSMessagingService,
  WSNotificationService,
  WSConsumerService,
  WSInstanceService
};
