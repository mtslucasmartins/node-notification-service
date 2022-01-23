const { WSConnectionRepository } = require('../repository');
const { WSMessagingService } = require('../services');
const { WSNotificationProducer } = require('../streams');

const KAFKA_TOPIC = 'ottimizza.websocket-notifications.general';

class WebSocketNotificationService {

  constructor() { 
    this.messagingService = new WSMessagingService();
    this.producer = new WSNotificationProducer(KAFKA_TOPIC);
    this.repository = new WSConnectionRepository();
  }

  async publish(notification) {
    await this.producer.connect();

    const channel = notification.channel;
    const username = notification.username;
    const message = notification.notification;

    this.producer.send(JSON.stringify({ channel, username, message }));
  }

  process(notification) {
    const channel = notification.channel;
    const username = notification.username;
    const message = notification.notification;

    console.log(`processing notification - channel=[${channel}] username=[${username}]`);

    if (this.notEmpty(channel)) {
      return this.#sendMessageByChannel(message, channel);
    }

    if (this.notEmpty(username)) {
      return this.#sendMessageByUsername(message, username);
    }
  }

  #sendMessageByChannel(message, channel) {
    console.log(`sending message - channel=[${channel}]`);

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

module.exports = {
  WebSocketNotificationService
};
