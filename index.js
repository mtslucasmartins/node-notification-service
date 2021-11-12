const app = require('./app');
// const appWs = require('./app-ws');
const { WebSocketServer } = require('./app-ws');

const config = {
  port: process.env.PORT || 3000
};

const server = app.listen(config.port, () => {
  console.log(`app is running on port ${config.port}`);
});

const wss = new WebSocketServer(server);

setInterval(() => {
  //wss.broadcast({ n: Math.random() });

  Object.keys(WebSocketServer.connections).forEach(k => {
    console.log(k);

    const connection = WebSocketServer.connections[k];

    connection.ws.send(JSON.stringify({
      'sid': connection.info.sid,
      'username': connection.info.username,
      'channel': connection.info.channel
    }));
  });

}, 1000);
