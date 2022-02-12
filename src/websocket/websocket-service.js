const { WSConnectionRepository } = require('../repositories');
const { WSNotificationProducer } = require('../streams');
const { WSMessagingService } = require('../services');

const KAFKA_TOPIC = 'ottimizza.websocket-notifications.general';

class WebSocketNotificationService {

  constructor() {
    this.messagingService = new WSMessagingService();
    this.producer = new WSNotificationProducer(KAFKA_TOPIC);
    this.repository = new WSConnectionRepository();
  }

  async publish(payload) {
    await this.producer.connect();

    const channel = payload.channel;
    const username = payload.username;
    const notification = payload.notification;

    this.producer.send(JSON.stringify({ channel, username, notification }));
  }

  process(payload) {
    const channel = payload.channel;
    const username = payload.username;
    const message = payload.notification;

    console.log(`processing notification - channel=[${channel}] username=[${username}]`);

    if (this.notEmpty(channel)) {
      return this.#sendMessageByChannel(message, channel);
    }

    if (this.notEmpty(username)) {
      return this.#sendMessageByUsername(message, username);
    }
  }

  #sendMessageByChannel(message, channel) {
    console.log(`sending message - channel=[${channel}]`, message);

    this.repository.findByChannel(channel)
      .forEach(([key, value]) => {
        // TODO: remove this line switch for 'value'
        const connection = this.repository.findBySId(key);
        connection.ws.send(JSON.stringify(message));
      });
  }

  #sendMessageByUsername(message, username) {
    console.log(`sending message - username=[${username}]`, message);
    this.repository.findByUsername(username)
      .forEach(([key, value]) => {
        // TODO: remove this line switch for 'value'
        const connection = this.repository.findBySId(key);
        connection.ws.send(JSON.stringify(message));
      });
  }

  notEmpty(value) {
    return (typeof value !== 'undefined' && value !== null && value !== '');
  }

}

module.exports = {
  WebSocketNotificationService
};
