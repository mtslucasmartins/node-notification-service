class WebSocketClient {

  constructor(uri, args) {
    this.uri = uri;

    this.channel = args.channel;
    this.username = args.username;

    if (this.channel)
      this.uri = `${uri}?channel=${channel}`;
    else if (this.username)
      this.uri = `${uri}?username=${username}`;

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

    socket.onopen = (e) => {
      const message = { type: 'open', message: 'connection stablished' };
      this.keepAlive();
    };

    socket.onmessage = (event) => {
      const message = { type: 'message', message: event.data };
    };

    socket.onclose = (event) => {
      if (event.wasClean) {
        const message = { type: 'close', message: 'connection closed', wasClean: true };
      } else {
        const message = { type: 'close', message: 'connection closed', wasClean: false };
      }
    };

    socket.onerror = (error) => {
      const message = { type: 'error', message: error.message };
    };

  }

  onopen() { }

  onclose() { }

  onmessage() { }

}