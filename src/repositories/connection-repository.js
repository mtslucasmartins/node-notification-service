class ConnectionStorage {

  static connections = {};

  constructor() { }

}

class WSConnectionRepository {

  constructor() { }

  findAll() {
    return Object.entries(ConnectionStorage.connections);
  }

  findBySId(sid) {
    return ConnectionStorage.connections[sid];
  }

  findByUsername(username) {
    return Object.entries(ConnectionStorage.connections)
      .filter(([k, v]) => v.info.username === username);
  }

  findByChannel(channel) {
    return Object.entries(ConnectionStorage.connections)
      .filter(([k, v]) => v.info.channel === channel);
  }

  store(sid, connection) {
    ConnectionStorage.connections[sid] = connection;
  }

  destroy(sid) {
    delete ConnectionStorage.connections[sid];
  }

}

module.exports = {
  WSConnectionRepository,
};
