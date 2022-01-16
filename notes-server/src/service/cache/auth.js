const Cache = require("./index");
class AuthCache {
  /**
   * @constructor
   */
  constructor() {
    this.cache = new Cache();
  }

  /**
   * Get the user  data.
   *
   * @async
   * @param key
   * @returns {Promise<String>|Promise<Object|null>}
   */
  get(key = null) {
    if (!key || key === "") {
      return Promise.reject("Invalid Cache Key Provided.");
    }

    return this.cache.getAsync(key);
  }

  /**
   * Set the user data in cache.
   *
   * @async
   * @param {string|null} key
   * @param data
   * @returns {Promise<"OK">|Promise<string>}
   */
  set(key = null, data) {
    if (!key || key === "") {
      return Promise.reject("Invalid Cache Key Provided.");
    }

    if (!data) {
      return Promise.reject("Data is required.");
    }

    return this.cache.setAsync(key, JSON.stringify(data));
  }

  /**
   * Deletes the user data in cache.
   *
   * @async
   * @param {string|null} key
   * @returns {Promise<"OK">|Promise<string>}
   */
  delete(key = null) {
    if (!key || key === "") {
      return Promise.reject("Invalid Cache Key Provided.");
    }

    return this.cache.deleteAsync(key);
  }

  /**
   * Generate key for the cache.
   *
   * @param {string|null} email
   * @returns string
   */
  generateKey(email = null) {
    if (!email || email === "") {
      return Promise.reject("Invalid Cache Key Provided.");
    }
    const key = `user:${email}`;
    return key;
  }
  /**
   * Generate key for the refresh token cache.
   *
   * @param {string|null} email
   * @returns string
   */
  generateRefreshTokenKey(email = null) {
    if (!email || email === "") {
      return Promise.reject("Invalid Cache Key Provided.");
    }
    return `refresh_token:${email}`;
  }

  /**
   * Sets refresh token in redis with hashed key for a field 'token'.
   * If cache is not enabled Promise is resolved with null.
   *
   * @param {string} key
   * @param {object} data
   * @returns {object}
   */
  setRefreshToken(key, data, field = "token") {
    if (!key || key === "") {
      return Promise.reject("Invalid Cache Key Provided.");
    }

    if (typeof key !== "string") {
      return Promise.reject("Key must be a string");
    }

    if (key.includes("undefined") || key.includes("null")) {
      return Promise.reject("Key cant have undefined or null in its value");
    }

    if (!data) {
      return Promise.reject("Data is required.");
    }

    return this.cache.hsetAsync(key, field, JSON.stringify(data));
  }

  /**
   * Gets refresh token in redis with hashed key for a field 'token'.
   * If cache is not enabled Promise is resolved with null.
   *
   * @param {string} key
   * @param {string} field
   * @returns {string}
   */
  getRefreshToken(key, field = "token") {
    if (!key || key === "") {
      return Promise.reject("Invalid Cache Key Provided.");
    }

    if (typeof key !== "string") {
      return Promise.reject("Key must be a string");
    }

    if (!field || field === "" || typeof field !== "string") {
      return Promise.reject("Field is required and must be string.");
    }

    return this.cache.hgetAsync(key, field);
  }

  /**
   * Sets an expiry time for any Redis key.
   * Expiry time is in milliseconds
   * If cache is not enabled Promise is resolved with null.
   *
   * @param {string} key
   * @param {string} expiryTime
   * @returns {string}
   */
  timeToLiveRedisKey(key, expiryTime) {
    if (!key || key === "") {
      return Promise.reject("Invalid Cache Key Provided.");
    }

    if (typeof key !== "string") {
      return Promise.reject("Key must be a string");
    }
    if (!expiryTime || expiryTime === "" || typeof expiryTime !== "string") {
      return Promise.reject("Field is required and must be string.");
    }

    return this.cache.keyExpire(key, expiryTime);
  }

  returnMultipleExecutionRedisCommand() {
    return this.cache.returnMulti();
  }

  /**
   * Fetch the password from the cache.
   *
   * @param {string} email - Email of the user.
   * @returns {Promise}
   */
  getPassword(email) {
    return this.cache.getAsync(`auth:${email}:password`);
  }

  /**
   * Saves user password in redis with expiry of 15 mins.
   *
   * @param {string} email - email of the user.
   * @param {string} password - password of the user.
   * @returns {Promise}
   * @async
   */
  setPassword(email, password) {
    // Not a good idea. security issue

    return this.cache.setAsync(`auth:${email}:password`, password, 900);
  }

  /**
   * Deletes the password from cache.
   *
   * @param {string} email - email of the user.
   * @returns {Promise<unknown>|Promise<never>|*}
   */
  deletePassword(email) {
    return this.cache.deleteAsync(`auth:${email}:password`);
  }

  /**
   * Set the user info data
   *
   * @async
   * @param {string} key - Cache Key
   * @param {Object} data - Data that will be cached
   * @returns {Promise<null>|Promise<string>|Promise<number>}
   */
  setUserInfo(key, data, field) {
    if (!key || key === "") {
      return Promise.reject("Invalid Cache Key Provided.");
    }

    if (typeof key !== "string") {
      return Promise.reject("Key must be a string");
    }

    if (key.includes("undefined") || key.includes("null")) {
      return Promise.reject("Key cant have undefined or null in its value");
    }

    if (!data) {
      return Promise.reject("Data is required.");
    }

    if (!field) {
      return Promise.reject("Field is required.");
    }
    return this.cache.hsetAsync(key, field, JSON.stringify(data));
  }

  /**
   * Get the command center data in command center id hash.
   *
   * @async
   * @param {string} key - Cache Key
   * @param {string|array} [fields] - name of the fields
   * @returns {object}
   */
  async getUserInfo(key, fields) {
    if (!key || key === "") {
      return Promise.reject("Invalid Cache Key Provided.");
    }

    if (typeof key !== "string") {
      return Promise.reject("Key must be a string");
    }

    if (!fields && !(fields && fields.length)) {
      return Promise.reject("Fields is required and must be array of fields.");
    }

    if (fields && fields.length == 1) {
      // get multiple hash fieldss together
      return this.cache.hgetAsync(key, fields[0]);
    } else if (fields.length == 2) {
      return this.cache.hmgetAsync(key, fields);
    }
  }

  /**
   * Delete the order field in patient hash.
   *
   * @async
   * @param {string} key - Cache Key
   * @param {string} [field=order] - name of the field
   * @returns {Promise<null>|Promise<string>|Promise<number>}
   */
  deleteUserInfo(key, field) {
    if (!key || key === "") {
      return Promise.reject("Invalid Cache Key Provided.");
    }

    if (typeof key !== "string") {
      return Promise.reject("Key must be a string");
    }

    if (!field || field === "" || typeof field !== "string") {
      return Promise.reject("Field is required and must be string.");
    }

    return this.cache.hdelAsync(key, field);
  }
}

exports = module.exports = AuthCache;
