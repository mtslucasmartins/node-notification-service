const { RestApplication } = require('./application');
const { WSInstanceService } = require('./services');
const { WSNotificationConsumer } = require('./streams');
const { WebSocketNotificationService } = require('./websocket/websocket-service');

const KAFKA_TOPIC = 'ottimizza.websocket-notifications.general';

class InstancePrunerWorker {

  constructor() {
    this.instanceService = new WSInstanceService();
    this.interval = null;
  }

  async run() {
    const prune = (async () => {
      console.log(`[instance-pruner-worker] pruning instances`);
      this.instanceService.getAllKeys().then((instances) => {
        console.log(`[instance-pruner-worker] found instances - ${JSON.stringify(instances)}`);
        const currentTime = new Date();

        for (const instanceId of instances) {
          this.instanceService.get(instanceId).then((instance) => {
            console.log(`[instance-pruner-worker] checking instance - instance:[${JSON.stringify(instance)}]`);
            const updatedAt = new Date(instance.updatedAt);
            const difference = (currentTime - updatedAt) / 1000;
            if (difference > 15) { 
              await this.instanceService.prune(instanceId);
            }
          });
        }
      }).catch((error) => {
        console.log(`[instance-pruner-worker] error pruning instances`, error);
      });
    });
    this.interval = setInterval(() => {
      prune();
    }, 5000);
  }

}

class InstanceHealthcheckWorker {

  constructor() {
    this.instanceService = new WSInstanceService();
  }

  async run() {
    console.log(`[instance-healthcheck-worker] saving instance - instance:[${RestApplication.INSTANCE_ID}]`);
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
      const messageString = message.value.toString('utf8');
      console.log(`consuming new message - topic=[${topic}] partition=[${partition}]`, messageString);

      const notification = JSON.parse(messageString);

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

    console.log("[work-manager] registering workers");
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
