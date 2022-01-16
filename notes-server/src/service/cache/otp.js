const Cache = require("./index");

class OtpCache {
  constructor() {
    this.cache = new Cache();
  }

  /**
   * Save the otp data in cache.
   *
   * @param {string} email - email of the user
   * @param {Object[]} data
   * @param {string} field - name of the field where data will be saved.
   * @throws {Error}
   */
  saveData(email, data, field) {
    if (!email || typeof email !== "string") {
      throw new Error("Email is required and must be a string");
    }

    if (!data) {
      throw new Error("Data is required");
    }

    try {
      const key = this.getCacheKey(email);

      this.cache.hsetAsync(key, field, JSON.stringify(data));
    } catch (e) {
      throw new Error(e);
    }
  }

  /**
   * Returns the otp data of a user.
   *
   * @param {string} email - email of the user
   * @param {string} field - name of the field where data is saved
   * @return {Promise<string>|Promise<Array>|Promise<Error>}
   */
  getData(email, field) {
    if (!email || typeof email !== "string") {
      return Promise.reject("Email is required and must be a string");
    }

    try {
      const key = this.getCacheKey(email);

      return this.cache.hgetAsync(key, field);
    } catch (e) {
      return Promise.reject(e);
    }
  }

  /**
   * Returns the cache key
   *
   * @param {string} email - email of the user
   * @return {string}
   * @throws {Error}
   */
  getCacheKey(email) {
    if (!email || typeof email !== "string") {
      throw new Error("Email is required and must be a string");
    }

    email = email.toLowerCase();

    return `user:${email}`;
  }

  /**
   * Removes old token from cache.
   *
   * @param {string} email - email of the user
   * @param {number} start - starting index
   * @param {number} end - ending index
   * @return {Promise<null>|Promise<string>}
   */
  removeOldOTPs(email, start, end) {
    if (!email || typeof email !== "string") {
      return Promise.reject("Email is required and must be a string");
    }

    if (!start || typeof start !== "number") {
      return Promise.reject("Start is required and must be a number");
    }

    if (!end || typeof end !== "number") {
      return Promise.reject("End is required and must be a number");
    }

    const key = this.getCacheKey(email);

    return this.cache.ltrimAsync(key, start, end);
  }
}

exports = module.exports = OtpCache;
