"use strict";

const { WSInstanceRepository } = require('../../repositories');
const { WSConsumerService } = require('../../services');

class WSInstanceService {
  static CONSUMERS = ['1', '2', '3', '4'];
  static CONSUMERS_AVAILABLES_KEY = 'consumers:availables';

  static INSTANCES_KEY = 'instances';
  static ALL_INSTANCES_KEY = 'instances:all';

  constructor() {
    this.consumerService = new WSConsumerService();
    this.instanceRepository = new WSInstanceRepository();
  }

  async get(instanceId) {
    const instance = await this.instanceRepository.get(instanceId);
    return !!instance ? JSON.parse(instance) : null;
  }

  async getAllKeys() {
    try {
      const allInstances = await this.instanceRepository.get(WSInstanceService.INSTANCES_KEY);
      console.log(`[ws-instance-service] fetching instances - [${!!allInstances}] instances:['${allInstances}']`);
      if (!!allInstances) {
        return JSON.parse(allInstances);
      }
    } catch (e) {
      console.log(`[ws-instance-service] something went wrong fetching active instances!`);
    }
    return [];
  }

  async save(instanceId) {
    console.log(`[ws-instance-service] saving instance - instance:[${instanceId}]`);

    try {
      let instance = await this.get(instanceId);
      let isNewInstance = false;
      const createdAt = new Date();
      const updatedAt = new Date();

      if (instance == null) {
        // creating a brand new instance. TODO: create a redis lock.
        const consumer = await this.consumerService.getAvailableConsumer();
        instance = { consumer, instanceId, updatedAt, createdAt };
        console.log(`[ws-instance-service] creating brand new instance - details:[${JSON.stringify(instance)}]`);

        isNewInstance = true;
      } else {
        console.log(`[ws-instance-service] updating existing instance - details:[${JSON.stringify(instance)}]`);
        instance = Object.assign(instance, { updatedAt });
      }

      console.log(`[ws-instance-service] saving instance - instance:[${instanceId}]`);
      this.instanceRepository.set(instanceId, JSON.stringify(instance));

      // we also need to update the key containing all instances
      if (isNewInstance) {
        let allInstances = await this.getAllKeys(); // defaults to empty array
        allInstances.push(instanceId);
        console.log(`[ws-instance-service] adding instance to active instances array - instance:[${instanceId}] `, JSON.stringify(allInstances));
        await this.instanceRepository.set(WSInstanceService.INSTANCES_KEY, JSON.stringify(allInstances));
      }

      return instance;
    } catch (error) {
      console.log(`[ws-instance-service] something went wrong saving instance - instance:[${instanceId}]`, error);
    }

    return null;
  }

  async prune(instanceId) {
    console.log(`[ws-instance-service] pruning instance - instance:[${instanceId}]`);
    try {
      let allInstances = await this.getAllKeys(); // defaults to empty array

      await this.instanceRepository.del(instanceId);

      allInstances = allInstances.filter((e) => e != instanceId);

      await this.instanceRepository.set(WSInstanceService.INSTANCES_KEY, JSON.stringify(allInstances));
    } catch (error) {
      console.log(`[ws-instance-service] something went wrong pruning instance - instance:[${instanceId}]`, error);
    }
  }

}

module.exports = {
  WSInstanceService
};
