const { WSNotificationService } = require('./services');
const { WSNotificationConsumer } = require('./streams');

const KAFKA_TOPIC = 'ottimizza.websocket-notifications.general';

class WSNotificationWorker {

  constructor() {
    this.consumer = new WSNotificationConsumer(KAFKA_TOPIC);
    this.notificationService = new WSNotificationService();
  }

  async run() {
    await this.consumer.connect();
    await this.consumer.subscribe();

    this.consumer.on('message', ({ topic, partition, message }) => {
      console.log(`consuming new message - topic=[${topic}] partition=[${partition}]`);

      const notification = JSON.parse(message.value.toString('utf8'));

      this.notificationService.process(notification);
    });
  }

}

class WorkManager {

  workers = new Array();

  constructor() {
    const notificationWorker = new WSNotificationWorker();

    this.register(notificationWorker);
  }

  register(worker) {
    this.workers.push(worker);
  }

  async start() {
    Promise.all(
      this.workers.map((worker) => worker.run())
    );
  }

}

module.exports = {
  WorkManager
};
