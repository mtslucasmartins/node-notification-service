// // const { response } = require('express');
// const { FirebaseClient } = require('./firebase-client');
// const { FirebaseApplicationRepository, FirebaseEndpointRepository } = require('../repositories');

// class FirebaseService {

//   constructor() {
//     this.firebaseClient = new FirebaseClient();
//     this.firebaseApplicationRepository = new FirebaseApplicationRepository();
//     this.firebaseEndpointRepository = new FirebaseEndpointRepository();
//   }

//   async getApplication(applicationId) {
//     return this.firebaseApplicationRepository.findById(applicationId);
//   }

//   async getEndpointsByUsernameAndApplication(username, applicationId) {
//     return this.firebaseEndpointRepository.findByUsernameAndApplicationId(username, applicationId);
//   }

//   saveNotificationDetails(notificationDetails) { return {}; } // TODO

//   createFCMEndpoint(username, registrationId, applicationId) { return {}; } // TODO

//   async deleteFCMEndpoint(username, applicationId, registrationId) {
//     return this.firebaseEndpointRepository.deleteByUsernameAndApplicationIdAndRegistrationId(username, applicationId, registrationId)
//   }

//   async pushNotification(username, applicationId, groupId, notification) {
//     const application = await this.getApplication(applicationId);

//     // const notificationDetails = { username, applicationId, groupId, notification };
//     // this.saveNotificationDetails(notificationDetails);

//     this.getEndpointsByUsernameAndApplication(username, applicationId).then((endpoints) => {
//       console.log(`Found ${endpoints.length} FCM Endpoints - username=[${username}] applicationId=[${applicationId}]`);

//       for (const endpoint of endpoints) {
//         const registrationId = endpoint.registrationId;
//         console.log(`Sending FCM Notification - username=[${username}] applicationId=[${applicationId}] endpoint=[${registrationId}]`);

//         this.firebaseClient.push(notification, registrationId, application.serverKey)
//           .then((response) => {
//             if (this.#fcmNotificationFailed(response) && this.#isInvalidRegistrationId(response)) {
//               console.log(`FCM Push - Failed - username=[${username}] applicationId=[${applicationId}] endpoint=[${registrationId}]`);
//               this.deleteFCMEndpoint(username, applicationId, registrationId);
//             } else {
//               console.log(`FCM Push - Success - username=[${username}] applicationId=[${applicationId}] endpoint=[${registrationId}]`);
//             }
//           })
//           .catch((error) => { 
//             console.log(`FCM Push - Unexpected - username=[${username}] applicationId=[${applicationId}] endpoint=[${registrationId}]`, error);
//           });
//       }
//     });
//   }

//   #fcmNotificationFailed(fcmPushResponse) {
//     return fcmPushResponse.data && fcmPushResponse.data.failure > 0;
//   }

//   #isInvalidRegistrationId(fcmPushResponse) {
//     const results = fcmPushResponse.data.results;
//     const errors = ['NotRegistered', 'InvalidRegistration'];

//     return results.some((r) => errors.includes(r.error));
//   }

// }

// module.exports = {
//   FirebaseService
// };