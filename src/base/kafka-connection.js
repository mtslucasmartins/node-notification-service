const { Kafka } = require('kafkajs');

const KAFKA_CLIENT_ID = 'app-id';

class KafkaConnectionFactory {

  static createHerokuKafka() {
    console.log(`[heroku-connection-factory] creating kafka instance provider=[heroku]`);

    const kafkaUrl = process.env.KAFKA_URL;
    const kafkaSslTrustedCert = process.env.KAFKA_TRUSTED_CERT;
    const kafkaSslClientCertKey = process.env.KAFKA_CLIENT_CERT_KEY;
    const kafkaSslClientCert = process.env.KAFKA_CLIENT_CERT;
    
    console.log(`[heroku-connection-factory] kafka-url=[${kafkaUrl}]`);

    const kafkaBrokers = kafkaUrl.split(',').map((broker) => {
      return broker.replace('kafka+ssl://', '');
    });

    console.log(`[heroku-connection-factory] brokers=[${kafkaBrokers}]`);

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

module.exports = {
  KafkaConnectionFactory
};
