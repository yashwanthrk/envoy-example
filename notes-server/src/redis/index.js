const redis = require("redis");

class Redis {
  constructor(host, port, password) {
    this.client = null;
    try {
      this.client = redis.createClient({
        port,
        host,
        retry_strategy: (options) => {
          if (options.error && options.error.code === "ECONNREFUSED") {
            return new Error("The server refused the connection");
          }
          if (options.total_retry_time > 1000 * 60 * 60) {
            return new Error("Retry time exhausted");
          }
          if (options.attempt > 10) {
            return undefined;
          }
          // reconnect after
          return Math.min(options.attempt * 100, 3000);
        },
      });
      this.client.auth(password);
      this.client.on("connect", function () {
        console.log("Connected to redis");
      });
      this.client.on("error", function (err) {
        console.log("Something went wrong ", err);
      });
    } catch (e) {
      console.log(e);
    }
  }
}

const enableRedis = process.env.REDIS === "true";
const url = process.env.REDIS_URL;
const port = process.env.REDIS_PORT;
const password = process.env.REDIS_PASSWORD;

exports = module.exports = new Redis(url, port, password);
