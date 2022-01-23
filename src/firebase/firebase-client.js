const axios = require('axios');

class FirebaseClient {

  static FIREBASE_PUSH_URL = 'https://fcm.googleapis.com/fcm/send';

  constructor() { }

  /**
   * Method to send Push Notification via Google's FCM API.
   * 
   * @param {any} notification | the notification body to be sent.
   * @param {string} registrationId | an user identifier at FCM side.
   * @param {string} serverKey | an server identifier at FCM side.
   */
  push(notification, registrationId, serverKey) {
    const headers = this.#createPushHeaders(serverKey);
    const payload = this.#createPushPayload(notification, registrationId);

    const url = FirebaseClient.FIREBASE_PUSH_URL;
    const options = { headers: headers };

    return axios.post(url, payload, options)
      .then((response) => {
        console.log(response);
      })
      .catch((error) => {
        console.log(error);
      });
  }

  /**
   * Method that generates the JSON notification payload to be sent to FCM.
   * 
   * @param {any} notification | the notification body to be sent.
   * @param {string} registrationId | an user identifier at FCM side.
   * 
   * @returns the payload to be sent to FCM.
   */
  #createPushPayload(notification, registrationId) {
    return {
      'notification': notification,
      'to': registrationId
    };
  }

  /**
   * 
   * @param {string} serverKey | an server identifier at FCM side.
   * @returns the headers to be sent to Google's FCM API.
   */
  #createPushHeaders(serverKey) {
    return {
      'Content-Type': 'application/json',
      'Authorization': `key=${serverKey}`
    };
  }

}

module.exports = { FirebaseClient };