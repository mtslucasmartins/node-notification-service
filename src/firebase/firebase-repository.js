const { DatabaseConnection } = require('../database');

class BaseRepository {

  constructor() { }

  async query(query, args) {
    return DatabaseConnection.getConnection()
      .then((client) => {
        return client.query(query, args)
          .then((response) => {
            client.release();
            return response.rows;
          })
          .catch((error) => {
            client.release();
            throw error;
          });
      });
  }


}

class FirebaseEndpointRepository extends BaseRepository {

  constructor() { super(); }

  async findByUsernameAndApplicationId(username, applicationId) {
    const query = ``;
    const args = [];

    return this.query(query, args)
      .then((rows) => {
        console.log(rows);
      })
      .catch((error) => {
        console.log(error);
      });
  }

}

class FirebaseNotificationRepository { }

class FirebaseApplicationRepository extends BaseRepository {

  constructor() { super(); }

  async findById() {
    const query = ``;
    const args = [];

    return this.query(query, args)
      .then((rows) => {
        console.log(rows);
      })
      .catch((error) => {
        console.log(error);
      });
  }

  // saveNotificationDetails(notificationDetails) { return {}; } // TODO

  // subscribe(username, registrationId, applicationId) { return {}; } // TODO

  // unsubscribe(username, registrationId) { return {}; } // TODO

}

module.exports = {
  FirebaseApplicationRepository,
  FirebaseEndpointRepository,
  FirebaseNotificationRepository
};
