"use strict";

const { createClient } = require('redis');

class ConnectionStorage {

  static connections = {};

  constructor() { }

}

class WSConnectionRepository {

  constructor() { }

  findAll() {
    return Object.entries(ConnectionStorage.connections);
  }

  findBySId(sid) {
    return ConnectionStorage.connections[sid];
  }
  
  findByUsername(username) {
    return Object.entries(ConnectionStorage.connections)
                 .filter(([k, v]) => v.info.username === username);
  }
  
  findByChannel(channel) {
    return Object.entries(ConnectionStorage.connections)
                 .filter(([k, v]) => v.info.channel === channel);
  }

  store(sid, connection) {
    ConnectionStorage.connections[sid] = connection;
  }

  destroy(sid) { 
    delete ConnectionStorage.connections[sid];
  }

}

class RedisConnectionFactory {

  constructor() {}

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
  RedisConnectionFactory,
  WSConnectionRepository,
  WSInstanceRepository
};
