const config = {
  iot: process.env.AWS_IOT,
  privateKeyPath: process.env.AWS_IOT_PRIVATE_KEY_PATH,
  certPath: process.env.AWS_IOT_CERT_PATH,
  rootCaPath: process.env.AWS_IOT_ROOT_CA_PATH,
  clientID: process.env.AWS_IOT_CLIENTID,
  host: process.env.AWS_IOT_HOST,
};

module.exports = config;
