const express = require('express');

const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const { MessagePublisherController } = require('./controllers');


class RestApplication {

  static server;

  constructor() {
    this.app = express();

    this.config = {
      port: process.env.PORT || 3000
    };

    this.#configure();

    this.#registerControllers();
  }

  #configure() {
    // 
    this.app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));

    // 
    this.app.use(helmet());

    // 
    this.app.use(express.json({ extended: true }));

    // 
    this.app.use(morgan('dev'));
  }

  #registerControllers() {
    this.messagePublisherController = new MessagePublisherController(this.app);
  }

  async initialize() {
    RestApplication.server = this.app.listen(this.config.port, () => {
      console.log(`app is running on port ${this.config.port}`);
    });

    return RestApplication.server;
  }

}

module.exports = {
  RestApplication
};