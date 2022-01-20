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
    const redisConnection = new RedisConnection();
    await redisConnection.connect();
  }

}

class RedisConnection {

  static instance;

  constructor() {
    this.redisUrl = process.env.REDIS_URL;
    this.redisTlsUrl = process.env.REDIS_TLS_URL;
    this.client = null;

    if (RedisConnection.instance = null) {
      RedisConnection.instance = this;
    }
  }

  static getInstance() {
    if (!RedisConnection.instance) {
      throw new Error('No instance of RedisConnection available!');
    }
    return RedisConnection.instance;
  }

  async connect() {
    return new Promise((resolve, reject) => {
      this.client = createClient({ url: this.redisUrl });

      this.client.on('error', (err) => console.log('Redis Client Error', err));

      return this.client.connect();
    });
  }

  async set(key, value) {
    this.client.set(key, value);
  }
  
  async get(key) {
    return this.client.get(key);
  }

}

class WSInstanceRepository {

  constructor() {
    this.redisUrl = process.env.REDIS_URL;
    this.redisTlsUrl = process.env.REDIS_TLS_URL;
    
    this.redisClient = RedisConnection.getInstance();
  }

  async set(key, value) {
    this.redisClient.set(key, value);
  }
  
  async get(key) {
    return this.redisClient.get(key);
  }

}

module.exports = {
  RedisConnectionFactory,
  WSConnectionRepository,
  WSInstanceRepository
};
