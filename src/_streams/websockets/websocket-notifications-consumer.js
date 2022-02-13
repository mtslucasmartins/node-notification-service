const { EventEmitter } = require('events');

const { v4: uuidv4 } = require('uuid');
const { KafkaConnectionFactory } = require('../../base/kafka-connection');

// TODO: switch for environment variables
const KAFKA_PREFIX = process.env.KAFKA_PREFIX;

class WSNotificationConsumer extends EventEmitter {

  constructor(topic) {
    super();

    this.uid = uuidv4();
    this.topic = `${KAFKA_PREFIX}${topic}`;
    this.groupId = `${KAFKA_PREFIX}ottimizza.ws-notifications.consumer-1`;

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

module.exports = {
  WSNotificationConsumer
};
