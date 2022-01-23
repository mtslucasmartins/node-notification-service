const { response } = require('express');
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

  async pushNotification(username, applicationId, groupId, notification) {
    const notificationDetails = { username, applicationId, groupId, notification };
    const application = await this.getApplication(applicationId);

    this.saveNotificationDetails(notificationDetails);

    this.getEndpointsByUsernameAndApplication(username, applicationId)
      .then((endpoints) => {
        console.log(`found ${endpoints.length} endpoints.`);

        for (const endpoint of endpoints) {
          console.log('sending to: ' + JSON.stringify(endpoint));
          this.firebaseClient.push(notification, endpoint.registrationId, application.serverKey)
            .then((response) => { 
              if (this.fcmNotificationFailed(response) && this.isInvalidRegistrationId(response)) {
                console.log(`the registration_id is no longer valid.`, endpoint.registrationId);
              } else {
                console.log(`notification sent to registration_id`, endpoint.registrationId);
              }
            })
            .catch((error) => { console.log(`failed`, error)});
        }
      });
  }

  fcmNotificationFailed(fcmPushResponse) {
    return fcmPushResponse.data && fcmPushResponse.data.failure > 0;
  }

  isInvalidRegistrationId(fcmPushResponse) {
    const results = fcmPushResponse.data.results;
    const errors = [ 'NotRegistered', 'InvalidRegistration' ];

    return results.some((r) => errors.includes(r.error));
  }

}

module.exports = {
  FirebaseService
};