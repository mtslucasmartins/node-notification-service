"use strict";

const { RestApplication } = require('./src/application');
const { WebSocketServer } = require('./src/websocket');
const { WorkManager } = require('./src/workers');

const { RedisConnectionFactory } = require('./src/base/redis-connection');
const { DatabaseConnectionFactory } = require('./src/base/psql-connection');

class Application {

  constructor() {
    Promise.all([
      this.#initializeDatabaseConnection(),
      this.#initializeRedisConnection()
    ]).then(() => {
      this.#initializeWorkers().then(() => {
        this.#initializeServers();
      });
    });
  }

  async #initializeDatabaseConnection() {
    return DatabaseConnectionFactory.createDatabaseConnection();
  }

  async #initializeRedisConnection() {
    return RedisConnectionFactory.createRedisConnection();
  }

  async #initializeServers() {
    const application = new RestApplication();

    await application.initialize();

    this.websocket = new WebSocketServer(RestApplication.server);
  }

  async #initializeWorkers() {
    this.workManager = new WorkManager();
    this.workManager.start();
  }

}

(() => {
  const application = new Application();
})();
