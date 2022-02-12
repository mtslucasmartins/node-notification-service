"use strict";

const { WSMessagingService } = require('../messaging/websocket-messaging-service');
const { WSNotificationProducer } = require('../../streams');

// TODO: switch for environment variables
const KAFKA_TOPIC = 'ottimizza.websocket-notifications.general';

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
  WSNotificationService
};
