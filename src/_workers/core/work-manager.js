"use strict";

const { WSNotificationWorker } = require('../notifications/websocket-notification-worker');
const { InstanceHealthcheckWorker } = require('./instance-healthcheck-worker');
const { InstancePrunerWorker } = require('./instance-pruner-worker');

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
