/**
 * 
 */
const { IndexController } = require("./index-controller.js");
const { ConsumersController } = require("./core/consumers-controller.js");
const { FirebaseNotificationController } = require("./notifications/fcm-notification-controller.js");
const { WebSocketNotificationController } = require("./notifications/ws-notification-controller.js");

module.exports = {
  IndexController, ConsumersController, FirebaseNotificationController, WebSocketNotificationController
};
