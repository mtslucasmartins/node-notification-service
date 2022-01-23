const express = require('express');

const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { v4: uuidv4 } = require('uuid');

const { MessagePublisherController, IndexController } = require('./controllers');
const { FirebaseController } = require('./controller-firebase');


class RestApplication {

  static INSTANCE_ID =  uuidv4();

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
    
    this.app.use(express.static(__dirname + '/resources'));
  }

  #registerControllers() {
    this.messagePublisherController = new MessagePublisherController(this.app);
    this.firebaseController = new FirebaseController(this.app);
    this.indexController = new IndexController(this.app);
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