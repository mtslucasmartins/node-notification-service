"use strict";

const { WSConsumerRepository } = require('../../repositories');

class WSConsumerService {

  KEY_CONSUMERS = 'consumers';
  KEY_CONSUMERS_AVAILABLES = 'consumers:availables';

  constructor() {
    // TODO: create an global instance of redis shared to repositories
    this.consumerRepository = new WSConsumerRepository();
  }

  async insertConsumers(consumers) {
    return this.consumerRepository.set(this.KEY_CONSUMERS, JSON.stringify(consumers))
      .then(() => {
        return this.getConsumers();
      });
  }

  async getConsumers() {
    return this.consumerRepository.get(this.KEY_CONSUMERS)
      .then((consumers) => {
        if (!!consumers)
          return JSON.parse(consumers)
        return [];
      });
  }

  async getAvailableConsumers() {
    return this.consumerRepository.get(this.KEY_CONSUMERS_AVAILABLES)
      .then((consumers) => {
        if (!!consumers)
          return JSON.parse(consumers)
        return [];
      });
  }

  async getAvailableConsumer() {
    return this.getAvailableConsumers().then((consumers) => {

    });
  }

}

module.exports = {
  WSConsumerService
};
