const { FirebaseClient } = require('./firebase-client');
const { FirebaseApplicationRepository, FirebaseEndpointRepository } = require('./firebase-repository');

class FirebaseService {

  constructor() {
    this.firebaseClient = new FirebaseClient();
    this.firebaseApplicationRepository = new FirebaseApplicationRepository();
    this.firebaseEndpointRepository = new FirebaseEndpointRepository();
  }

  async getApplication(applicationId) { 
    return this.firebaseApplicationRepository.findById(applicationId); 
  }

  async getEndpointsByUsernameAndApplication(username, applicationId) { 
    return this.firebaseEndpointRepository.findByUsernameAndApplicationId(username, applicationId); 
  }

  saveNotificationDetails(notificationDetails) { return {}; } // TODO

  subscribe(username, registrationId, applicationId) { return {}; } // TODO

  unsubscribe(username, registrationId) { return {}; } // TODO

  pushNotification(username, applicationId, groupId, notification) {
    const notificationDetails = { username, applicationId, groupId, message };
    const application = this.getApplication(applicationId);

    this.saveNotificationDetails(notificationDetails);

    const endpoints = this.getEndpointsByUsernameAndApplication(username, applicationId);

    for (const endpoint of endpoints) {
      this.firebaseClient.push(notification, endpoint.registrationId, application.serverKey)
        .then((response) => { })
        .catch((error) => { });
    }

  }

}

module.exports = {
  FirebaseService
};