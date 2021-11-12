const WebSocket = require('ws');
const uuid = require('uuid');

const { UrlUtils } = require('./src/utils')


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
}

class WSConnection {
  constructor(info, ws) {
    this.info = info;
    this.ws = ws;
  }
}

class WSConnectionRepository {

  static connections = {};

  constructor() { }

  find() { }

  store() { }

  destroy() { }

}

class WebSocketServer {
  static PATH = '/subscribe';
  static connections = {};

  constructor(server) {
    this.wss = new WebSocket.Server({
      path: WebSocketServer.PATH, server
    });
    this.wss.on(WSEvent.CONNECTION, this.onConnection.bind(this));
  }

  onError(ws, err) {
    console.error(`onError: ${err.message}`);
  }

  onClose(ws, data, sid) {
    console.error(`onClose: ${data}`);
    
    delete WebSocketServer.connections[sid];
  }

  onMessage(ws, data) {
    console.error(`onMessage: ${data}`);
  }

  onConnection(ws, req) {
    const params = UrlUtils.parseSearchParams(req.url);

    const sid = uuid.v4();
    const channel = params.get(WSConnectionParams.CHANNEL);
    const username = params.get(WSConnectionParams.USERNAME); 
    const deviceInfo = JSON.stringify({});
    
    const connectionInfo = new WSConnectionInfo(sid, username, channel, deviceInfo);
    const connection = new WSConnection(connectionInfo, ws);

    WebSocketServer.connections[sid] = connection;

    ws.on(WSEvent.MESSAGE, (data) => this.onMessage(ws, data));
    ws.on(WSEvent.CLOSE, (data) => this.onClose(ws, data, sid));
    ws.on(WSEvent.ERROR, (error) => this.onError(ws, error));
  }

  verifyClientToken() { }

}

function broadcast(jsonObject) {
  if (!this.clients) return;
  this.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(jsonObject));
    }
  });
}

module.exports = {
  WebSocketServer
}
