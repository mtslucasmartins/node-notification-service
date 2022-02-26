const { createClient } = require('redis');

class RedisConnectionFactory {

  constructor() { }

  static async createRedisConnection() {
    console.log('[redis] [factory] creating a redis connection instance.');
    const redisConnection = new RedisConnection();
    await redisConnection.connect();
    RedisConnection.instance = redisConnection;
    console.log('[redis] [factory] successfully created a redis connection instance.');
  }

}

class RedisConnection {

  static instance;

  constructor() {
    this.redisUrl = process.env.REDIS_URL;
    this.redisTlsUrl = process.env.REDIS_TLS_URL;
    this.client = null;
  }

  static getInstance() {
    if (!RedisConnection.instance) {
      throw new Error('No instance of RedisConnection available!');
    }
    return RedisConnection.instance;
  }

  async connect() {
    console.log(`[redis] creating client url=[${this.redisTlsUrl}]`);
    this.client = createClient({
      url: this.redisTlsUrl,
      socket: {
        tls: true,
        rejectUnauthorized: false
      }
    });

    console.log(`[redis] binding errors...`);
    this.client.on('error', (err) => console.log('Redis Client Error', err));

    console.log(`[redis] connecting...`);
    await this.client.connect();
  }

  async set(key, value) {
    this.client.set(key, value);
  }

  async get(key) {
    return this.client.get(key);
  }

  async del(key) {
    return this.client.del(key);
  }

}

module.exports = {
  RedisConnectionFactory,
  RedisConnection
};
