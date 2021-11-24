const { WorkManager } = require('./src/workers');
const { RestApplication } = require('./src/application');
const { WebSocketServer } = require('./src/websocket');

// TODO: should be handled different 
const config = {
  port: process.env.PORT || 3000,
  kafka: {
    client_id: '',
    brokers: []
  }
};

class Application {

  constructor() {
    this.#initializeServers();
    this.#initializeWorkers();
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