const { DatabaseConnection } = require('../database');

class BaseRepository {

  constructor() { }

  async delete(query, args) {
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

  async deleteByUsernameAndApplicationIdAndRegistrationId(username, applicationId, registrationId) {
    const query = `
      DELETE FROM push_fcm_endpoints
      WHERE username = $1
        AND application_id = $2
        AND registration_id = $3
    `;
    const args = [username, applicationId, registrationId];
    return this.query(query, args)
      .then((rows) => {
        return rows;
      })
      .catch((error) => {
        console.log(error);
      });
  }

  async findByUsernameAndApplicationId(username, applicationId) {
    const query = `
      SELECT 
        e.username,
        e.application_id as "applicationId",
        e.registration_id as "registrationId"
      FROM push_fcm_endpoints e
      WHERE e.username = $1
      AND e.application_id = $2
    `;
    const args = [username, applicationId];

    return this.query(query, args)
      .then((rows) => {
        return rows;
      })
      .catch((error) => {
        console.log(error);
      });
  }

}

class FirebaseNotificationRepository { }

class FirebaseApplicationRepository extends BaseRepository {

  constructor() { super(); }

  async findById(applicationId) {
    const query = `
      SELECT 
        a.application_id as "applicationId",
        a.server_key as "serverKey"
      FROM applications a
      WHERE a.application_id = $1
    `;
    const args = [applicationId];

    return this.query(query, args)
      .then((rows) => {
        console.log(rows);
        return rows[0];
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
