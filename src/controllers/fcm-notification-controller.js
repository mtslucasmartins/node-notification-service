const { FirebaseService } = require('../_services/notifications/firebase-notification-service');

class FirebaseNotificationController {

  OK = 200;                    // create method on BaseController
  INTERNAL_SERVER_ERROR = 500; // create method on BaseController

  constructor(app) {
    this.firebaseService = new FirebaseService();

    app.post('/api/v1/notifications/fcm', (async (request, response, next) => {
      const payload = request.body;

      const applicationId = payload.applicationId;
      const notification = payload.notification;
      const username = payload.username;
      const groupId = payload.groupId;

      this.firebaseService.pushNotification(username, applicationId, groupId, notification);

      return response.status(200).json(payload);
    }));

  }

  json(response, status, body) {
    return response.status(status).json(body);
  }

}

module.exports = {
  FirebaseNotificationController
};