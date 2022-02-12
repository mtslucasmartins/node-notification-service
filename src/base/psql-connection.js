const { Pool } = require('pg');

class DatabaseConnectionFactory {

  constructor() { }

  static async createDatabaseConnection() {
    console.log('[database] [factory] creating a database connection instance.');
    const databaseConnection = new DatabaseConnection();
    await databaseConnection.connect();
    DatabaseConnection.instance = databaseConnection;
    console.log('[database] [factory] successfully created a database connection instance.');
  }

}

class DatabaseConnection {

  static instance;

  constructor() {
    this.databaseUrl = process.env.DATABASE_URL;
    this.pool = null;
    this.connection = null;
  }

  static getInstance() {
    if (!DatabaseConnection.instance) {
      throw new Error('No instance of DatabaseConnection available!');
    }
    return DatabaseConnection.instance;
  }

  static async getConnection() {
    return DatabaseConnection.instance.connect();
  }

  async connect() {
    if (this.pool)
      return this.pool.connect();

    console.log(`[database] creating pool url=[${this.databaseUrl}]`);
    this.pool = new Pool({
      connectionString: this.databaseUrl, ssl: {
        rejectUnauthorized: false
      }
    });

    console.log(`[database] connecting to pool...`);
    return this.pool.connect();
  }

}

module.exports = {
  DatabaseConnection,
  DatabaseConnectionFactory
};
