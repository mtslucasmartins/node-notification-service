const { KafkaConnectionFactory } = require('../../base/kafka-connection');

const KAFKA_PREFIX = process.env.KAFKA_PREFIX;

class WSNotificationProducer {

  constructor(topic) {
    this.topic = `${KAFKA_PREFIX}${topic}`;

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
  WSNotificationProducer
};