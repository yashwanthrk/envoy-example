const config = {
    url: process.env.kafka_url,
    port: process.env.kafka_port,
    socketTopic: process.env.kafka_socket_topic,
};

module.exports = config;
