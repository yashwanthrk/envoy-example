class HTTP400Error extends Error {
  constructor(message, statusCode = 400) {
    if (typeof message !== "string") {
      throw new Error("Message must be a string");
    }
    if (typeof statusCode !== "number") {
      throw new Error("Status must be a number");
    }

    super(message);

    this.name = this.constructor.name;
    this.statusCode = statusCode;

    Error.captureStackTrace(this, this.constructor);
  }
}

exports = module.exports = HTTP400Error;
