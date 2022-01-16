const { MongoClient } = require("mongodb");

const { mongoConfig } = require("../config");

class Mongo {
  constructor() {
    this.db = null;
    this.url = mongoConfig.url;

    try {
      this.client = new MongoClient(this.url, {
        useCreateIndex: true,
        useNewUrlParser: true,
        // Automatically try to reconnect when it loses connection to MongoDB; default it makes 50 or something tries with some connection timeout it makes i guess
        autoReconnect: true,
        useUnifiedTopology: true,
        poolSize: 8, // Maintain up to 8 socket connections; by default is 5
        // serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
        // socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
        // family: 4,
        // keepAlive: true
      });
    } catch (err) {
      console.log("Error on connecting to mongodb url : " + err.stack);
      process.exit(1);
    }
  }
  async init() {
    await this.client.connect();

    // this.client.connection.on("error", (err) => {
    //   // Emitted if an error occurs on a connection, like a parseError due to malformed data or a payload larger than 16MB
    //   console.log(`MongoDB errors ${err}`);
    // });

    console.log("connected to db");
    this.db = this.client.db();
  }

  getDBInstance(name) {
    console.log(this.db);
    console.log(name);
    return this.db.collection(name);
  }
}

const mongoInstance = new Mongo();

module.exports = mongoInstance;
