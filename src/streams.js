const { Kafka } = require('kafkajs');
const { EventEmitter } = require('events');

const { v4: uuidv4 } = require('uuid');

// TODO: switch for environment variables
const KAFKA_CLIENT_ID = 'app-id';
const KAFKA_BROKERS = ['kafka:9092'];
const KAFKA_PREFIX = process.env.KAFKA_PREFIX;

class KafkaConnectionFactory {

  static createHerokuKafka() {
    console.log(`[kafka][factory][heroku]: creating kafka instance provider=[heroku]`);

    const kafkaUrl = process.env.KAFKA_URL;
    const kafkaSslTrustedCert = process.env.KAFKA_TRUSTED_CERT;
    const kafkaSslClientCertKey = process.env.KAFKA_CLIENT_CERT_KEY;
    const kafkaSslClientCert = process.env.KAFKA_CLIENT_CERT;
    
    console.log(`[kafka][factory][heroku]: kafka-url=[${kafkaUrl}]`);

    const kafkaBrokers = kafkaUrl.split(',').map((broker) => {
      return broker.replace('kafka+ssl://', '');
    });

    console.log(`[kafka][factory][heroku]: brokers=[${kafkaBrokers}]`);

    return new Kafka({
      clientId: KAFKA_CLIENT_ID,
      brokers: kafkaBrokers,
      ssl: {
        rejectUnauthorized: false,
        ca: [ kafkaSslTrustedCert ],
        key: kafkaSslClientCertKey,
        cert: kafkaSslClientCert
      }
    });
  }

}

class WSNotificationConsumer extends EventEmitter {

  constructor(topic) {
    super();

    this.uid = uuidv4();
    this.topic = `${KAFKA_PREFIX}topic`;
    this.groupId = `${KAFKA_PREFIX}metadata_topic_${this.uid}`;

    this.kafka = KafkaConnectionFactory.createHerokuKafka();

    this.consumer = this.kafka.consumer({
      groupId: this.groupId
    });
  }

  async connect() {
    await this.consumer.connect();
  }

  async subscribe() {
    await this.consumer.subscribe({ topic: this.topic });

    await this.consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        this.emit('message', { topic, partition, message });
      },
    });
  }

}

class WSNotificationProducer {

  constructor(topic) {
    this.topic = `${KAFKA_PREFIX}topic`;

    this.kafka = KafkaConnectionFactory.createHerokuKafka();

    this.producer = this.kafka.producer();
  }

  async connect() {
    await this.producer.connect();
  }

  async send(message) {
    await this.producer.send({
      topic: this.topic,
      messages: [
        { value: message },
      ],
    });
  }

}

module.exports = {
  WSNotificationConsumer,
  WSNotificationProducer
};
