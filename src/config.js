
const config = {
  server: {
    port: process.env.PORT
  },
  resources: {
    postgresql: {
      url: process.env.DATABASE_URL
    },
    redis: {
      url: process.env.REDIS_URL,
      tlsUrl: process.env.REDIS_TLS_URL
    },
    kafka: {
      url: process.env.KAFKA_URL,
      prefix: process.env.KAFKA_PREFIX,
      clientCert: process.env.KAFKA_CLIENT_CERT,
      clientCertKey: process.env.KAFKA_CLIENT_CERT_KEY,
      trustedCert: process.env.KAFKA_TRUSTED_CERT
    }
  }
};

module.exports = {
  config
};
