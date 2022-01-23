const { BaseController } = require('./controllers');
const { FirebaseService } = require('./firebase/firebase-service');

class FirebaseController extends BaseController {

  constructor(app) {
    super(app, '/api/v1/notifications/fcm');

    this.firebaseService = new FirebaseService();
  }

  post(request, response, next) {
    const payload = request.body;

    const applicationId = payload.applicationId;
    const notification = payload.notification;
    const username = payload.username;
    const groupId = payload.groupId;

    this.firebaseService.pushNotification(username, applicationId, groupId, notification);

    return response.status(200).json(payload);
  }

}

module.exports = {
  FirebaseController
};
