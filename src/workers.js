const { RestApplication } = require('./application');
const { WSInstanceService, WSNotificationService } = require('./services');
const { WSNotificationConsumer } = require('./streams/websockets/websocket-notifications-consumer');

const KAFKA_TOPIC = 'ottimizza.websocket-notifications.general';

class InstancePrunerWorker {

  constructor() {
    this.instanceService = new WSInstanceService();
    this.interval = null;
  }

  async run() {
    const prune = (async () => {
      console.log(`[instance-pruner-worker] pruning instances`);
      this.instanceService.getAllKeys().then(async (instances) => {
        console.log(`[instance-pruner-worker] found instances - ${JSON.stringify(instances)}`);
        const currentTime = new Date();

        for (const instanceId of instances) {
          this.instanceService.get(instanceId).then(async (instance) => {
            console.log(`[instance-pruner-worker] checking instance - instance:[${JSON.stringify(instance)}]`);
            if (!!instance) {
              const updatedAt = new Date(instance.updatedAt);
              const difference = (currentTime - updatedAt) / 1000;
              if (difference > 25) { // TODO: make it a property
                await this.instanceService.prune(instanceId);
              }
            } else {
              await this.instanceService.prune(instanceId);
            }
          });
        }
      }).catch((error) => {
        console.log(`[instance-pruner-worker] error pruning instances`, error);
      });
    });
    this.interval = setInterval(async () => {
      prune();
    }, 25000); // TODO: make it a property
  }

}

class InstanceHealthcheckWorker {

  constructor() {
    this.instanceService = new WSInstanceService();
  }

  async run() {
    this.interval = setInterval(async () => {
      console.log(`[instance-healthcheck-worker] saving instance - instance:[${RestApplication.INSTANCE_ID}]`);
      this.instanceService.save(RestApplication.INSTANCE_ID);
    }, 10000); // TODO: make it a property
  }

}

class WSNotificationWorker {

  constructor() {
    this.instanceService = new WSInstanceService();
    this.notificationService = new WSNotificationService();
  }

  async run() {
    this.instanceService.save(RestApplication.INSTANCE_ID).then(async (instance) => {
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
