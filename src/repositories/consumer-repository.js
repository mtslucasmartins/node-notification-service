"use strict";

const { RedisConnection } = require('../base/redis-connection');

class WSConsumerRepository {

  constructor() {
    this.redisClient = RedisConnection.getInstance();
  }

  async set(key, value) {
    return this.redisClient.set(key, value);
  }

  async get(key) {
    return this.redisClient.get(key);
  }

  async del(key) {
    return this.redisClient.del(key);
  }

}

module.exports = {
  WSConsumerRepository
};
