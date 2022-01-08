const { WorkManager } = require('./src/workers');
const { RestApplication } = require('./src/application');
const { WebSocketServer } = require('./src/websocket');

class Application {

  constructor() {
    this.#initializeWorkers().then(() => {
      this.#initializeServers();
    });
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