"use strict";

const { RestApplication } = require('../../application');
const { WSInstanceService } = require('../../services');

// TODO: create class to load from config, and create static accessers
const WORKERS_HEALTHCHECK_INTERVAL_MS = 'workers.healthcheck.interval.ms';

const properties = {
  'workers.healthcheck.interval.ms': 10000
};

class InstanceHealthcheckWorker {

  constructor() {
    this.instanceService = new WSInstanceService();
    // TODO: use properties class
    this.healthcheckIntervalMs = properties[WORKERS_HEALTHCHECK_INTERVAL_MS];
  }

  async run() {
    this.interval = setInterval(async () => {
      const instanceId = RestApplication.INSTANCE_ID;
      console.log(`[instance-healthcheck-worker] saving instance - instance:[${instanceId}]`);
      this.instanceService.save(instanceId);
    }, this.healthcheckIntervalMs); // TODO: make it a property
  }

}

module.exports = {
  InstanceHealthcheckWorker
};
