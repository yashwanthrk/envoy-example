const awsIotConfig = require("./awsIot");
const mongoConfig = require("./mongo");
const msg91Config = require("./msg91");
const newRelicConfig = require("./newRelic");
const otpConfig = require("./otp");
const redisConfig = require("./redis");
const s3Config = require("./s3");
const serverConfig = require("./server");

module.exports = {
  awsIotConfig,
  mongoConfig,
  msg91Config,
  newRelicConfig,
  otpConfig,
  redisConfig,
  s3Config,
  serverConfig,
};
