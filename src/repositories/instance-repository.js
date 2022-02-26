"use strict";

const { RedisConnection } = require('../base/redis-connection');

class WSInstanceRepository {

  constructor() {
    this.redisUrl = process.env.REDIS_URL;
    this.redisTlsUrl = process.env.REDIS_TLS_URL;

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
  WSInstanceRepository
};
