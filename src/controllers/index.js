/**
 * 
 */
const { IndexController } = require("./index-controller.js");
const { ConsumersController } = require("./consumers-controller.js");
const { FirebaseNotificationController } = require("./fcm-notification-controller.js");
const { WebSocketNotificationController } = require("./ws-notification-controller.js");

module.exports = {
  IndexController, ConsumersController, FirebaseNotificationController, WebSocketNotificationController
};
