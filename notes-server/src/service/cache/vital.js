const Cache = require('./index');

class VitalCache {
  constructor() {
    this.cache = new Cache();
  }

  /**
   * Set the vital data in patient hash.
   *
   * @async
   * @param {string} key - Cache Key
   * @param {Object} data - Data that will be cached
   * @returns {Promise<null>|Promise<string>|Promise<number>}
   */
  setVitals(key, data) {
    if (!key || key === '') {
      return Promise.reject('Invalid Cache Key Provided.')
    }

    if (typeof key !== 'string') {
      return Promise.reject('Key must be a string')
    }

    if (key.includes('undefined') || key.includes('null')) {
      return Promise.reject('Key cant have undefined or null in its value')
    }

    if (!data) {
      return Promise.reject('Data is required.')
    }

    return this.cache.hsetAsync(key, 'vitals', JSON.stringify(data));
  }

  /**
   * Get the vital field in patient hash.
   *
   * @async
   * @param {string} key - Cache Key
   * @param {string} [field=vital] - name of the field. default vital
   * @returns {Promise<null>|Promise<string>|Promise<number>}
   */
  getVitals(key, field = 'vitals') {
    if (!key || key === '') {
      return Promise.reject('Invalid Cache Key Provided.')
    }

    if (typeof key !== 'string') {
      return Promise.reject('Key must be a string')
    }

    if (!field || field === '' || typeof field !== 'string') {
      return Promise.reject('Field is required and must be string.')
    }

    return this.cache.hgetAsync(key, field);
  }

  /**
   * Delete the vital field in patient hash.
   *
   * @async
   * @param {string} key - Cache Key
   * @param {string} [field=vital] - name of the field. default vital
   * @returns {Promise<null>|Promise<string>|Promise<number>}
   */
  deleteVitals(key, field = 'vitals') {
    if (!key || key === '') {
      return Promise.reject('Invalid Cache Key Provided.')
    }

    if (typeof key !== 'string') {
      return Promise.reject('Key must be a string')
    }

    if (!field || field === '' || typeof field !== 'string') {
      return Promise.reject('Field is required and must be string.')
    }

    return this.cache.hdelAsync(key, field);
  }
}

exports = module.exports = VitalCache;
