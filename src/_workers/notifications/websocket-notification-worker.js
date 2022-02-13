"use strict";

const { RestApplication } = require('./application');
const { WSInstanceService, WSNotificationService } = require('./services');
const { WSNotificationConsumer } = require('./streams/websockets/websocket-notifications-consumer');

const KAFKA_TOPIC = 'ottimizza.websocket-notifications.general';

class WSNotificationWorker {

  constructor() {
    this.instanceService = new WSInstanceService();
    this.notificationService = new WSNotificationService();
  }

  async run() {
    const instanceId = RestApplication.INSTANCE_ID;

    this.instanceService.save(instanceId).then(async (instance) => {
      this.consumer = new WSNotificationConsumer(KAFKA_TOPIC, instance.consumer);

      await this.consumer.connect();
      await this.consumer.subscribe();

      this.consumer.on('message', ({ topic, partition, message }) => {
        const messageString = message.value.toString('utf8');
        console.log(`consuming new message - topic=[${topic}] partition=[${partition}]`, messageString);

        const notification = JSON.parse(messageString);

        this.notificationService.process(notification);
      });
    });
  }

}

module.exports = {
  WSNotificationWorker
};
