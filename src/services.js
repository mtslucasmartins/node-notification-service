"use strict";

const { WSConnectionRepository } = require('./repositories');

const { WSNotificationProducer } = require('./streams');

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

module.exports = {
  WSMessagingService,
  WSNotificationService,
};
