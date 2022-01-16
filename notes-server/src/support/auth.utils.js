// TODO - trigger updated at timestamp at redis;
//  as it resides in other hash key field, currently ignoring it

module.exports = {
  /**
   * Update data for the cache.
   *
   * @param {object} token_object
   * @param {object} redis_user_object
   * @returns object
   */
  updatedConstructedTokenObjectInUserInfo: (tokenObject, tokenInfo) => {
    // Max number of tokens allowed 30
    if (tokenInfo.length >= 30) {
      tokenInfo.shift();
    }
    tokenInfo.push(tokenObject);
    return tokenInfo;
  },

  /**
   * destroy token data for the cache.
   *
   * @param {string} token
   * @param {object} redis_user_object
   * @returns object
   */
  deleteTokenInUserInfo: (token, tokenInfo) => {
    tokenInfo = JSON.parse(tokenInfo);

    const index = tokenInfo.map((x) => x.token).indexOf(token);
    if (index > -1) {
      tokenInfo.splice(index, 1);
      // tokenInfo["updatedAt"] = new Date().getTime();
    }

    return tokenInfo;
  },

  /**
   * destroy token data and login activity for the user.
   *
   * @param {object} tokenInfo
   * @returns object
   */
  emptyAllTokensInUserInfo: (tokenInfo) => {
    tokenInfo = JSON.parse(tokenInfo);
    tokenInfo = [];
    // tokenInfo["updatedAt"] = new Date().getTime();
    return tokenInfo;
  },

  /**
   * check token  in the cache.
   *
   * @param {string} user_token
   * @param {object} redis_user_object
   * @returns boolean
   */
  checkTokenExistInUserInfo: (token, tokenInfo) => {
    tokenInfo = JSON.parse(tokenInfo);
    if (!tokenInfo) {
      return false;
    }
    const checkForToken = (t) => t.token === token;
    return tokenInfo.some(checkForToken);
  },

  updateTimeInUserInfo: (userInfo) => {
    userInfo = JSON.parse(userInfo);
    userInfo["updatedAt"] = new Date().getTime();
    return userInfo;
  },
};
