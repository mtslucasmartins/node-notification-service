const { WebSocketNotificationService } = require('./websocket/websocket-service');
const path = require('path');

class HttpMethod {
  static GET = 'GET';
  static PUT = 'PUT';
  static POST = 'POST';
  static PATCH = 'PATCH';
  static DELETE = 'DELETE';
}

class BaseController {

  constructor(app, mapping) {
    app.all(mapping, (request, response, next) => {
      this.handler(request, response, next);
    });
  }

  json(response, status, body) {
    return response.status(status).json(body);
  }

  get(request, response, next) { return this.notAllowed(request, response, next); }
  put(request, response, next) { return this.notAllowed(request, response, next); }
  post(request, response, next) { return this.notAllowed(request, response, next); }
  patch(request, response, next) { return this.notAllowed(request, response, next); }
  delete(request, response, next) { return this.notAllowed(request, response, next); }

  unauthorized(request, response, next) { return this.json(response, 401, { error: 'unauthorized' }); }
  notFound(request, response, next) { return this.json(response, 404, { error: 'not_found' }); }
  notAllowed(request, response, next) { return this.json(response, 405, { error: 'not_allowed' }); }
  conflict(request, response, next) { return this.json(response, 409, { error: 'conflict' }); }
  tooMany(request, response, next) { return this.json(response, 429, { error: 'too_many' }); }

  serverError(request, response, next) { return this.json(response, 500, { error: 'internal_server_error' }); }

  handler(request, response, next) {
    switch (request.method) {
      case HttpMethod.GET:
        return this.get(request, response, next);
      case HttpMethod.PUT:
        return this.put(request, response, next);
      case HttpMethod.POST:
        return this.post(request, response, next);
      case HttpMethod.PATCH:
        return this.patch(request, response, next);
      case HttpMethod.DELETE:
        return this.delete(request, response, next);
      default:
        return this.notAllowed(request, response, next);
    }
  }

  execute(request, response, next) {
    return this.handler(request, response, next);
  }

}

class MessagePublisherController extends BaseController {

  constructor(app) {
    super(app, '/api/v1/notifications');

    this.notificationService = new WebSocketNotificationService(); 
  }

  post(request, response, next) {
    const payload = request.body;

    this.notificationService.publish(payload);

    return response.status(200).json(payload);
  }

}


class IndexController extends BaseController {

  constructor(app) {
    super(app, '/');
  }

  get(request, response, next) {
    response.sendFile(path.join(__dirname, '/resources/index.html'));
  }

}

module.exports = {
  BaseController,
  IndexController,
  MessagePublisherController
};
