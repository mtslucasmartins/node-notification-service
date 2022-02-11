const { WebSocketNotificationService } = require('../websocket/websocket-service');

class WebSocketNotificationController {

  OK = 200;                    // create method on BaseController
  INTERNAL_SERVER_ERROR = 500; // create method on BaseController

  constructor(app) {
    this.notificationService = new WebSocketNotificationService();

    app.post('/api/v1/notifications/ws', (async (request, response, next) => {
      const payload = request.body;

      this.notificationService.publish(payload);

      return response.status(200).json(payload);
    }));

  }

  json(response, status, body) {
    return response.status(status).json(body);
  }

}

module.exports = {
  WebSocketNotificationController
};
