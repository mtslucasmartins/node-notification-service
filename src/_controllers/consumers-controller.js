const { WSConsumerService } = require('../services');

class ConsumersController {

  OK = 200;                    // create method on BaseController
  INTERNAL_SERVER_ERROR = 500; // create method on BaseController

  constructor(app) {
    this.consumerService = new WSConsumerService();

    app.get('/api/v1/consumers', (async (request, response, next) => {
      return this.consumerService.getConsumers()
        .then((consumers) => {
          return response.status(this.OK).json(consumers);
        }).catch((error) => {
          return this.json(response, this.INTERNAL_SERVER_ERROR, { error: 'internal_server_error' });
        })
    }));

    app.post('/api/v1/consumers', (async (request, response, next) => {
      return this.consumerService.insertConsumers()
        .then((consumers) => {
          return response.status(this.OK).json(consumers);
        }).catch((error) => {
          return this.json(response, this.INTERNAL_SERVER_ERROR, { error: 'internal_server_error' });
        })
    }));

    app.get('/api/v1/consumers/availables', (async (request, response, next) => {
      return this.consumerService.getAvailableConsumers()
        .then((consumers) => {
          return response.status(this.OK).json(consumers);
        }).catch((error) => {
          return this.json(response, this.INTERNAL_SERVER_ERROR, { error: 'internal_server_error' });
        })
    }));

  }

  json(response, status, body) {
    return response.status(status).json(body);
  }

}

module.exports = {
  ConsumersController
};