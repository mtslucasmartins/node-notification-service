const { Kafka } = require('kafkajs');
const { EventEmitter } = require('events');

const { v4: uuidv4 } = require('uuid');

// TODO: switch for environment variables
const KAFKA_CLIENT_ID = 'app-id';
const KAFKA_BROKERS = ['kafka:9092'];

class WSNotificationConsumer extends EventEmitter {

  constructor(topic) {
    super();

    this.uid = uuidv4();
    this.topic = topic;
    this.groupId = `metadata_topic_${this.uid}`;

    this.kafka = new Kafka({
      clientId: KAFKA_CLIENT_ID,
      brokers: KAFKA_BROKERS
    });

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
    this.topic = topic;

    this.kafka = new Kafka({
      clientId: KAFKA_CLIENT_ID,
      brokers: KAFKA_BROKERS
    });

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
