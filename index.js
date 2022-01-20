const { v4: uuidv4 } = require('uuid');
const { WorkManager } = require('./src/workers');
const { RestApplication } = require('./src/application');
const { WebSocketServer } = require('./src/websocket');
const { RedisConnectionFactory } = require('./src/repository');
const { __esModule } = require('uuid/dist/v1');

class Application {

  static INSTANCE_ID =  uuidv4();

  constructor() {
    this.#initializeRedisClient().then(() => {
      this.#initializeWorkers().then(() => {
        this.#initializeServers();
      });
    });
  }

  async #initializeRedisClient() {
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

module.exports = {
  Application
};
