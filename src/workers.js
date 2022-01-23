const { RestApplication } = require('./application');
const { WSInstanceService } = require('./services');
const { WSNotificationConsumer } = require('./streams');
const { WebSocketNotificationService } = require('./websocket/websocket-service');

const KAFKA_TOPIC = 'ottimizza.websocket-notifications.general';

class InstancePrunerWorker {
  
  constructor() {
    this.instanceService = new WSInstanceService();
  }

  async run() {
    const prune = (() => {
      const instances = this.instanceService.getAllKeys();
      console.log(instances);

      for (const instanceId of instances) {
        const instance = this.instanceService.get(instanceId);

        console.log(instanceId);
        // check if instance.updatedAt is recent (15 seconds)
        // if it is, great - if it's not, delete that key.
      }
    });
  }

} 

class InstanceHealthcheckWorker {
  
  constructor() {
    this.instanceService = new WSInstanceService();
  }
  
  async run() {
    this.instanceService.save(RestApplication.INSTANCE_ID);
  }

} 

class WSNotificationWorker {

  constructor() {
    this.consumer = new WSNotificationConsumer(KAFKA_TOPIC);
    this.notificationService = new WebSocketNotificationService();
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
    const instanceHealthcheckWorker = new InstanceHealthcheckWorker();
    const instancePrunerWorker = new InstancePrunerWorker();
    const notificationWorker = new WSNotificationWorker();

    this.register(instanceHealthcheckWorker);
    this.register(instancePrunerWorker);
    this.register(notificationWorker);
  }

  register(worker) {
    this.workers.push(worker);
  }

  async start() {
    Promise.all(
      this.workers.map((worker) => worker.run())
    ).catch((error) => {
      console.log('error intializing workers', error);
    });
  }

}

module.exports = {
  WorkManager
};
