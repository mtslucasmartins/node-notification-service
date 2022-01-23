class WebSocketClient {

  constructor(uri, args) {
    this.socket = null;
    this.uri = uri;

    this.channel = args.channel;
    this.username = args.username;

    if (this.channel)
      this.uri = `${uri}?channel=${this.channel}`;
    else if (this.username)
      this.uri = `${uri}?username=${this.username}`;

    this.keepAliveInterval = null;
  }

  keepAlive() {
    console.log('creating keepAlive function');
    this.keepAliveInterval = setInterval(() => {
      this.socket.send('');
    }, 5000);
  }

  connect() {
    this.socket = new WebSocket(this.uri);

    this.socket.onopen = (e) => {
      const message = { type: 'open', message: 'connection stablished' };
      this.keepAlive();
    };

    this.socket.onmessage = (event) => {
      const message = { type: 'message', message: event.data };
    };

    this.socket.onclose = (event) => {
      if (event.wasClean) {
        const message = { type: 'close', message: 'connection closed', wasClean: true };
      } else {
        const message = { type: 'close', message: 'connection closed', wasClean: false };
      }
    };

    this.socket.onerror = (error) => {
      const message = { type: 'error', message: error.message };
    };

  }

  onopen() { }

  onclose() { }

  onmessage() { }

}

let btnWebsocketConnect = document.getElementById('websocket-connection-connect');

btnWebsocketConnect.addEventListener('click', (e) => {
  let wsConnectionUri = document.getElementById('websocket-connection-uri').value;
  let wsConnectionChannel = document.getElementById('websocket-connection-channel').value;
  let wsConnectionUsername = document.getElementById('websocket-connection-username').value;

  const args = { channel: wsConnectionChannel, username: wsConnectionUsername };

  const websocketClient = new WebSocketClient(wsConnectionUri, args);
  websocketClient.connect();
});
