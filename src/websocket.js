const WebSocket = require('ws');
const uuid = require('uuid');

const { UrlUtils } = require('./utils');
const { WSConnectionRepository } = require('./repository');

class WSEvent {
  static CONNECTION = 'connection';
  static MESSAGE = 'message';
  static ERROR = 'error';
  static CLOSE = 'close';
}

class WSConnectionParams {
  static CHANNEL = 'channel';
  static USERNAME = 'username';
}

class WSConnectionInfo {
  
  constructor(sid, username, channel, deviceInfo, ws) {
    this.sid = sid;
    this.username = username;
    this.channel = channel;
    this.deviceInfo = deviceInfo;
    this.ws = ws;
  }
  
  toString() {
    return `sid=[${this.sid}] username=[${this.username}] channel=[${this.channel}]`;
  }

}

class WSConnection {
  
  constructor(info, ws) {
    this.info = info;
    this.ws = ws;
  }

  toString() {
    return this.info.toString();
  }
}

class WebSocketServer {
  static PATH = '/subscribe';
  static connections = {};

  constructor(server) {
    console.log(`[websocket] initializing websocket server`);
    this.repository = new WSConnectionRepository();
    this.wss = new WebSocket.Server({
      path: WebSocketServer.PATH, server
    });
    this.wss.on(WSEvent.CONNECTION, this.onConnection.bind(this));
    console.log(`[websocket] websocket server initialized`);
  }

  onError(ws, err) {
    console.error(`onError: ${err.message}`);
  }

  onClose(ws, data, sid) {
    console.error(`onClose: ${data}`);
    
    delete WebSocketServer.connections[sid];
    this.repository.destroy(sid);
  }

  onMessage(ws, data) {
    console.error(`onMessage: ${data}`);
  }

  onConnection(ws, req) {
    console.log(`[websocket] on_connection`);
    const params = UrlUtils.parseSearchParams(req.url);

    const sid = uuid.v4();
    const channel = params.get(WSConnectionParams.CHANNEL);
    const username = params.get(WSConnectionParams.USERNAME); 
    const deviceInfo = JSON.stringify({});
    
    const connectionInfo = new WSConnectionInfo(sid, username, channel, deviceInfo);
    const connection = new WSConnection(connectionInfo, ws);

    console.log(`[websocket] [on:connection] - ${connection.toString()}`);
    WebSocketServer.connections[sid] = connection;
    this.repository.store(sid, connection);

    ws.on(WSEvent.MESSAGE, (data) => this.onMessage(ws, data));
    ws.on(WSEvent.CLOSE, (data) => this.onClose(ws, data, sid));
    ws.on(WSEvent.ERROR, (error) => this.onError(ws, error));
  }

  verifyClientToken() { }

}

module.exports = {
  WebSocketServer
};
