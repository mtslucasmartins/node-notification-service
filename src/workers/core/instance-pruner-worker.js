"use strict";

const { WSInstanceService } = require('../../services');

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

module.exports = {
  InstancePrunerWorker
};
