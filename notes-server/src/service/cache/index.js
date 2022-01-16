const { promisify } = require("util");

const redisCache = require("../../redis");
const redisClient = redisCache && redisCache.client ? redisCache.client : null;

const multi = redisClient.multi();

let getAsync,
  setAsync,
  delAsync,
  get_multiple_async,
  rpushAsync,
  lindexAsync,
  lrangeAsync,
  lremAsync,
  hgetAsync,
  hsetAsync,
  hdelAsync,
  add_set_sync,
  list_set_sync,
  del_set_sync,
  expire,
  hmgetAsync,
  ltrimAsync;

// normal set get
getAsync = promisify(redisClient.get).bind(redisClient);
setAsync = promisify(redisClient.set).bind(redisClient);
delAsync = promisify(redisClient.del).bind(redisClient);
get_multiple_async = promisify(redisClient.mget).bind(redisClient);

// sets
add_set_sync = promisify(redisClient.sadd).bind(redisClient);
list_set_sync = promisify(redisClient.smembers).bind(redisClient);
del_set_sync = promisify(redisClient.srem).bind(redisClient);

// list
rpushAsync = promisify(redisClient.rpush).bind(redisClient);
lindexAsync = promisify(redisClient.lindex).bind(redisClient);
lrangeAsync = promisify(redisClient.lrange).bind(redisClient);
lremAsync = promisify(redisClient.lrem).bind(redisClient);
ltrimAsync = promisify(redisClient.ltrim).bind(redisClient);

// hash
hgetAsync = promisify(redisClient.hget).bind(redisClient);
hsetAsync = promisify(redisClient.hset).bind(redisClient);
hdelAsync = promisify(redisClient.hdel).bind(redisClient);
// get multiple fields in hash
hmgetAsync = promisify(redisClient.hmget).bind(redisClient);

//multi
// multi = promisify(redisClient.multi).bind(redisClient);
expire = promisify(redisClient.expire).bind(redisClient);

redisClient.on("error", function (_) {
  console.log("Redis error: " + _);
});

class Cache {
  constructor(cache) {
    this.cache = cache || redisClient;
  }

  /**
   * Fetches the data from redis through given key.
   *
   * @async
   * @param {string} key Name of the key
   * @returns {Promise} returns the data in a Promise
   */
  getAsync(key) {
    if (!key || key === "") {
      return Promise.reject("Invalid Cache Key Provided.");
    }

    return getAsync(key);
  }

  /**
   * Sets the data in redis of string type.
   *
   * @async
   * @param {string} key Name of the key
   * @param data Data to save in cache
   * @param {number} [expiry] - expiry time in seconds (optional)
   * @returns {Promise} returns 'OK'
   */
  setAsync(key, data, expiry) {
    if (!key || key === "") {
      return Promise.reject("Invalid Cache Key Provided.");
    }

    if (!data) {
      return Promise.reject("Data is required.");
    }

    if (expiry && typeof expiry !== "number") {
      return Promise.reject("Expiry must be a number");
    }

    return expiry ? setAsync(key, data, "EX", expiry) : setAsync(key, data);
  }

  /**
   * Delete the data of string type.
   *
   * @async
   * @param {string} key Name of the key
   */
  deleteAsync(key) {
    if (!key || key === "") {
      return Promise.reject("Invalid Cache Key Provided.");
    }

    return delAsync(key);
  }

  addSetAsync(key, data) {
    if (!key || key === "") {
      return Promise.reject("Invalid Cache Key Provided.");
    }

    return add_set_sync(key, data);
  }

  listSetAsync(key) {
    if (!key || key === "") {
      return Promise.reject("Invalid Cache Key Provided.");
    }

    return list_set_sync(key);
  }

  delSetAsync(key, data) {
    if (!key || key === "") {
      return Promise.reject("Invalid Cache Key Provided.");
    }

    return del_set_sync(key, data);
  }

  /**
   * Fetches the data from redis for array of keys.
   *
   * @async
   * @param {Array} keys Array of keys
   * @returns {Promise} returns the data in a Promise
   */

  getMultipleAsync(keys) {
    if (!keys || !(keys && keys.length)) {
      return Promise.reject("Invalid Cache Key Provided.");
    }

    return get_multiple_async(keys);
  }

  /**
   * Returns the element present at the index from left side of list.
   *
   * @async
   * @param {string} key - Cache Key
   * @param {number} index - index for the list
   * @returns {Promise<string>|Promise<null>|Promise<'nil'>} - Returns the data if found
   */
  lindexAsync(key, index) {
    if (!key || key === "") {
      return Promise.reject("Invalid Cache Key Provided.");
    }

    if (typeof key !== "string") {
      return Promise.reject("Key must be a string");
    }

    if (typeof index !== "number") {
      return Promise.reject("Index must be a number.");
    }

    return lindexAsync(key, index);
  }

  /**
   * Push the data at the end of the list.
   *
   * @async
   * @param {string} key - Cache Key
   * @param {string} data - Data that will be cached
   * @returns {Promise<null>|Promise<string>|Promise<number>} - Returns the size of list after pushing.
   */
  rpushAsync(key, data) {
    if (!key || key === "") {
      return Promise.reject("Invalid Cache Key Provided.");
    }

    if (typeof key !== "string") {
      return Promise.reject("Key must be a string");
    }

    if (typeof data !== "string") {
      return Promise.reject("Data is required and must be string.");
    }

    return rpushAsync(key, data);
  }

  lrangeAsync(key, max) {
    if (!key || key === "") {
      return Promise.reject("Invalid Cache Key Provided.");
    }

    if (typeof key !== "string") {
      return Promise.reject("Key must be a string");
    }
    // return latest 25 elements
    return lrangeAsync(key, -25, -1);
  }

  lremAsync(key, val) {
    if (!key || key === "") {
      return Promise.reject("Invalid Cache Key Provided.");
    }

    if (typeof key !== "string") {
      return Promise.reject("Key must be a string");
    }

    return lremAsync(key, 1, val);
  }

  /**
   * Left trim the list from start to end.
   * Elements present in the range are preserved and rest are removed.
   *
   * @param {string} key - name of the key
   * @param {number} start - starting index
   * @param {number} end - ending index
   * @return {Promise<null>|Promise<string>}
   */
  ltrimAsync(key, start, end) {
    if (!key || key === "") {
      return Promise.reject("Invalid Cache Key Provided.");
    }

    if (typeof key !== "string") {
      return Promise.reject("Key must be a string");
    }

    if (typeof start !== "number" || typeof end !== "number") {
      return Promise.resolve("Start and end is required and must be number");
    }

    return ltrimAsync(key, start, end);
  }

  /**
   * Set the field in the given key.
   *
   * @async
   * @param {string} key - Cache Key
   * @param {string} field - name of the field
   * @param {string} data - Data that will be cached
   * @returns {Promise<null>|Promise<string>|Promise<number>}
   */
  hsetAsync(key, field, data) {
    if (!key || key === "") {
      return Promise.reject("Invalid Cache Key Provided.");
    }

    if (typeof key !== "string") {
      return Promise.reject("Key must be a string");
    }

    if (
      data === "" ||
      (typeof data !== "string" && typeof data !== "boolean")
    ) {
      return Promise.reject("Data is required and must be string or boolean");
    }

    if (!field || field === "" || typeof field !== "string") {
      return Promise.reject("Field is required and must be string.");
    }

    return hsetAsync(key, field, data);
  }

  /**
   * Returns the data present at the field in the key.
   *
   * @async
   * @param {string} key - Cache Key
   * @param {string} field - name of the field
   * @returns {Promise<null>|Promise<string>|Promise<number>}
   */
  hgetAsync(key, field) {
    if (!key || key === "") {
      return Promise.reject("Invalid Cache Key Provided.");
    }

    if (typeof key !== "string") {
      return Promise.reject("Key must be a string");
    }

    if (!field || field === "" || typeof field !== "string") {
      return Promise.reject("Field is required and must be string.");
    }

    return hgetAsync(key, field);
  }

  /**
   * Returns the data present at the field in the key.
   *
   * @async
   * @param {string} key - Cache Key
   * @param {array} field - name of the field
   * @returns {Promise<null>|Promise<string>|Promise<number>}
   */
  hmgetAsync(key, fields) {
    if (!key || key === "") {
      return Promise.reject("Invalid Cache Key Provided.");
    }

    if (typeof key !== "string") {
      return Promise.reject("Key must be a string");
    }

    if (!fields && !(fields && fields.length)) {
      return Promise.reject("Field is required and must be array of field.");
    }

    return hmgetAsync(key, fields);
  }

  /**
   * Deletes the data present at the field in the key.
   *
   * @async
   * @param {string} key - Cache Key
   * @param {string} field - name of the field
   * @returns {Promise<null>|Promise<string>|Promise<number>}
   */
  hdelAsync(key, field) {
    if (!key || key === "") {
      return Promise.reject("Invalid Cache Key Provided.");
    }

    if (typeof key !== "string") {
      return Promise.reject("Key must be a string");
    }

    if (!field || field === "" || typeof field !== "string") {
      return Promise.reject("Field is required and must be string.");
    }

    return hdelAsync(key, field);
  }

  returnMulti() {
    return multi;
  }

  keyExpire(key, ttl) {
    return expire(key, ttl);
  }
}

exports = module.exports = Cache;
