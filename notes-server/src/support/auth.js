const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const CryptoJS = require("crypto-js");
const request = require("request-promise");
const config = require("../config");

const { logger } = require("../logger");
const AuthCache = require("../service/cache/auth");

const {
  getUserIpAddress,
  getCloudPhysicianDeviceInfo,
} = require("./supportFunctions");

const authCache = new AuthCache();
const passwordSecretKey = "CloudPhysician";
const allowedLoginAttempts = 5;

const self = (module.exports = {
  /**
   *
   * @param {string} email
   * @param {object} userInfo
   * @param {array} tokenInfo
   * @returns
   */
  setUserBasicInfoInCache: async (email, userInfo = null, tokenInfo = null) => {
    try {
      const key = authCache.generateKey(email);
      if (userInfo && tokenInfo) {
        // set both
        authCache.setUserInfo(
          key,
          self.constructUserInfo(userInfo),
          (field = "basicInfo")
        );
        authCache.setUserInfo(key, tokenInfo, (field = "tokenInfo"));
      } else if (userInfo) {
        // set only user info
        authCache.setUserInfo(
          key,
          self.constructUserInfo(userInfo),
          (field = "basicInfo")
        );
      } else if (tokenInfo) {
        // set only user info
        authCache.setUserInfo(key, tokenInfo, (field = "tokenInfo"));
      }

      return Promise.resolve({ err: null });
    } catch (e) {
      return Promise.reject(e);
    }
  },

  getUserBasicInfoInCache: async (email, ...field) => {
    try {
      if (!email) {
        throw new Error("User email is missing");
      }
      if (!(field && field.length)) {
        throw new Error("Fields must be an array of field");
      }
      const key = authCache.generateKey(email);
      return authCache.getUserInfo(key, field);
    } catch (e) {
      return Promise.reject(e);
    }
  },

  constructUserInfo: (userData) => {
    console.log(userData._id);
    return {
      name: userData.name,
      title: userData.title,
      qualification: userData.qualification,
      commandCenterID: userData.commandCenterID,
      allowedCommandCenters: userData.allowedCommandCenters,
      hospitals: userData.hospitals,
      units: userData.units,
      role: userData.role,
      userId: userData._id,
      phone: userData.phone,
      createdAt: userData.createdAt || new Date().getTime(),
      updatedAt: new Date().getTime(),
      mongoCreatedAt: userData.createdAt,
    };
  },

  constructUserTokenInfo: (req, token = null) => {
    return {
      token,
      ip: getUserIpAddress(req),
      deviceInfo: getCloudPhysicianDeviceInfo(req),
      createdAt: new Date().getTime(),
    };
  },

  /**
   * Removes blacklisted token from in memory store
   * @param {object} req
   * @return empty
   */
  removeToken: async (req) => {
    try {
      const token = req.headers.authorization.split(" ")[1];
      // synchronous operation
      let tokenInfo = await self.getUserBasicInfoInCache(
        req.userData.email,
        "tokenInfo"
      );
      tokenInfo = deleteTokenInUserInfo(token, tokenInfo);
      self.setUserBasicInfoInCache(req.userData.email, null, tokenInfo);
      return;
    } catch (e) {
      console.log("redis error", e.stack);
      return;
    }
  },

  /**
   *
   * @param {object} user
   */
  deleteEntireTokenListForUserInfoCache: async (email) => {
    try {
      self.setUserBasicInfoInCache(email, null, []);
      return;
    } catch (e) {
      console.log("redis error", e.stack);
      return;
    }
  },

  /**
   * Checks if recaptcha is successful
   * If env is not set, then success.
   * If mobile, then success.
   * Sends a request to google for checking.
   * On response if success or score is less then 0.3 then failed.
   * If score is greater then or equal to 0.3 then success.
   *
   * @param {Object} body - post object from request
   * @param {String} body.email - email of the user.
   * @param {String} body.password - password of the user.
   * @param {String} [body.app] - a check to see if request is from mobile.
   * @return {Promise<Object>} - Returns if recaptcha is successful with message
   */
  // checkRecaptcha: async (body) => {
  //   try {
  //     if (process.env.recaptcha !== "true") {
  //       return Promise.resolve({ err: null });
  //     }

  //     // Check for mobile side.
  //     if (body.app) {
  //       if (body.app === process.env.android || body.app === process.env.ios) {
  //         return Promise.resolve({ err: null });
  //       } else {
  //         return Promise.resolve({ err: "Mobile Authentication Failed" });
  //       }
  //     }

  //     const url = `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.recaptchaSecretKey}&response=${body.token}`;
  //     const response = await request.get({ url });
  //     const responseObj = JSON.parse(response);

  //     if (!responseObj.success) {
  //       return Promise.resolve({ err: "Recaptcha token validation failed" });
  //     }

  //     if (responseObj.score >= 0.3) {
  //       return Promise.resolve({ err: null });
  //     }

  //     logger.info("Detected as BOT");
  //     logger.info(`Score: ${responseObj.score}`);
  //     logger.info(`User: ${body.email}`);

  //     return Promise.resolve({ err: "Detected as BOT" });
  //   } catch (e) {
  //     return Promise.reject(e);
  //   }
  // },

  // /**
  //  * Checks if username exists.
  //  *
  //  * @param {String} username - username of the user
  //  * @return {Promise<Object>} - returns the user if found
  //  */
  // checkUsername: async (username) => {
  //   try {
  //     const user = await USER_MODEL.findOneByEmail(username, {
  //       __v: 0,
  //       createdAt: 0,
  //       updatedAt: 0,
  //     })
  //       .lean()
  //       .populate("allowedCommandCenters", "name")
  //       .populate("hospitals", "name isCommandCenter");

  //     if (!user) {
  //       return Promise.resolve({
  //         err: "Invalid Username/Password",
  //         user: null,
  //       });
  //     }

  //     return Promise.resolve({ err: null, user });
  //   } catch (e) {
  //     return Promise.reject(e);
  //   }
  // },

  // /**
  //  * Check if user is active or not.
  //  *
  //  * @param {Object} user - user object
  //  * @param {boolean} user.active - field indicating if user is active or not.
  //  * @return {Promise<Object>}
  //  */
  // checkIfActive: async (user) => {
  //   try {
  //     const active = await checkIfActive(user);

  //     if (!active) {
  //       return Promise.resolve({ err: "User blocked by admin" });
  //     }

  //     return Promise.resolve({ err: null });
  //   } catch (e) {
  //     return Promise.reject(e);
  //   }
  // },

  // /**
  //  * Check if a user is locked.
  //  *
  //  * @param {Object} user - user object
  //  * @return {Promise<Object>} - is user is not locked
  //  */
  // checkIfLocked: async (user) => {
  //   try {
  //     if (await checkIfLocked(user)) {
  //       return Promise.resolve({ err: "Locked out. Contact system admin." });
  //     }

  //     return Promise.resolve({ err: null });
  //   } catch (e) {
  //     return Promise.reject(e);
  //   }
  // },

  // /**
  //  * Check if password is correct
  //  *
  //  * @param password
  //  * @param userPassword
  //  * @return {Promise<Object>}
  //  */
  // checkPassword: async (password, userPassword) => {
  //   try {
  //     const passwordBytesData = CryptoJS.AES.decrypt(
  //       password,
  //       passwordSecretKey
  //     );
  //     const decryptedPassword = passwordBytesData.toString(CryptoJS.enc.Utf8);

  //     if (!(await bcrypt.compare(decryptedPassword, userPassword))) {
  //       return Promise.resolve({ err: "Invalid Password." });
  //     }

  //     return Promise.resolve({ err: null, password: decryptedPassword });
  //   } catch (e) {
  //     return Promise.reject(e);
  //   }
  // },

  /**
   * Creats a jwt token for login
   *
   * @param {string} email - email of the user
   * @return {string} - token created
   */
  createToken(email) {
    if (!email || typeof email !== "string") {
      throw new Error("Email is required and must be a string");
    }

    return jwt.sign({ email }, process.env.JWTKEY, { expiresIn: "14d" });
  },

  // async handleWrongPassword(user) {
  //   try {
  //     user = await USER_MODEL.updateLockout(user);

  //     if (user.lockout.isLocked) {
  //       createMessage(user.email, { notificationType: "logout" });

  //       self
  //         .deleteEntireTokenListForUserInfoCache(user.email)
  //         .then()
  //         .catch((e) => {
  //           console.log("Delete Auth Tokens In Cache Func Error ", e);
  //         });
  //     }
  //     return user;
  //   } catch (e) {
  //     throw new Error(e);
  //   }
  // },

  // /**
  //  * Handles successful login.
  //  *
  //  * @description
  //  * Creates a token from email.
  //  * Resets the lockout of user to initial values.
  //  * Save the token and auth related data in cache.
  //  * Then returns the data with user data and token in it.
  //  *
  //  * @param {Request} req - express request object
  //  * @param {string} email - email of the user.
  //  * @param {string} password - password of the user.
  //  * @return {Promise<Object>}
  //  */

  // async successfulLogin(req, email, password) {
  //   // Not a good idea to save password in Redis. Find some better way to login to wiki.
  //   // TODO: remove req object because its too big. Instead pass whatever is necessary.
  //   const token = self.createToken(email);

  //   const user = await USER_MODEL.findOneByEmail(email, {
  //     __v: 0,
  //     createdAt: 0,
  //     updatedAt: 0,
  //     password: 0,
  //     lockout: 0,
  //   })
  //     .lean()
  //     .populate("allowedCommandCenters", "name")
  //     .populate("hospitals", "_id name isCommandCenter");

  //   await USER_MODEL.resetLockout(email);

  //   // get refresh token
  //   let refresh_token = await self.get_refresh_token(email);
  //   if (!refresh_token) {
  //     // if didn't exist, please create one  with expiry time one month.
  //     // store it has hash in redis with expiry time
  //     refresh_token = jwt.sign({ email }, process.env.JWTKEY, {});
  //     // expires after one month
  //     self
  //       .store_refresh_token(email, refresh_token)
  //       .then()
  //       .catch((err) => console.log(err));
  //   }

  //   let tokenInfo = await self.getUserBasicInfoInCache(email, "tokenInfo");
  //   if (!tokenInfo) {
  //     tokenInfo = [self.constructUserTokenInfo(req, token)];
  //   } else {
  //     tokenInfo = JSON.parse(tokenInfo);
  //     tokenInfo.push(self.constructUserTokenInfo(req, token));
  //   }
  //   self.setUserBasicInfoInCache(email, user, tokenInfo);

  //   const hospitalIdList = user.hospitals.map((hosp) => hosp._id.toString());
  //   socketRoomsCache.setHashUserHospitals(
  //     `socket:user_id:${user._id}`,
  //     JSON.stringify(hospitalIdList)
  //   );

  //   let wikiJwt = null;
  //   if (
  //     !!config.wiki.apiKey &&
  //     !!config.wiki.registrationGroup &&
  //     config.wiki.enabledEnv.includes(config.server.env)
  //   ) {
  //     wikiJwt = await getWikiToken({ ...user, password });
  //   }

  //   SOCKET.tvUsersOnCall(user);

  //   await authCache.deletePassword(email);

  //   return {
  //     token: token,
  //     refreshToken: refresh_token,
  //     userInfo: {
  //       name: user.name,
  //       email: user.email,
  //       role: user.role,
  //       title: user.title,
  //       phone: user.phone,
  //       qualification: user.qualification,
  //       hospitals: user.hospitals,
  //       units: user.units,
  //       allowedRoles: user.allowedRoles,
  //       wikiJwt,
  //       allowedCommandCenters: user.allowedCommandCenters,
  //       commandCenterID: user.commandCenterID,
  //       isCommandCenterUser: isUserAlsoCommandCenter(user),
  //     },
  //   };
  // },

  store_refresh_token: async (email, refresh_token) => {
    try {
      const key = authCache.generateRefreshTokenKey(email);
      // const command1 = ["hset", key, "token", refresh_token]
      // const command2 = ["expire", key, "10000"]

      const multi = await authCache.returnMultipleExecutionRedisCommand();

      const now = new Date();
      now.setMonth(now.getMonth() + 1);
      multi.hset(key, "token", refresh_token);
      multi.expire(key, now.getTime());

      return multi.exec();

      // multi.exec(function (err, replies) {
      //     console.log(replies);
      // });
    } catch (e) {
      console.log("redis error", e.stack);
      return;
    }
  },

  get_refresh_token: async (email) => {
    const key = authCache.generateRefreshTokenKey(email);
    return await authCache.getRefreshToken(key);
  },

  passwordHashFunc: async (password, salt = 10) => {
    try {
      if (!password || (password && password.length === 0)) {
        throw new Error("Password is required and must be a string");
      }

      const hashedPassword = await bcrypt.hash(password, salt);
      return Promise.resolve({ err: null, hashedPassword });
    } catch (e) {
      return Promise.reject(e);
    }
  },

  checkPasswordStrength: async (password) => {
    try {
      if (!password || (password && password.length === 0)) {
        throw new Error("Password is required and must be a string");
      }
      let regex = /^[A-Za-z0-9 ]+$/;

      if (regex.test(password)) {
        return Promise.resolve({ err: "Password is weak" });
      }
      if (!password.match("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,})")) {
        return Promise.resolve({ err: "Password is weak" });
      }
      return Promise.resolve({ err: null });
    } catch (e) {
      return Promise.reject(e);
    }
  },

  isSysAdmin: (user) => {
    return user.role === "System Administrator" && user.commandCenterID;
  },
  /**
   * Encrypted password coming from frontend is decrypted
   *
   * @param {string} password - encrypted password
   * @return {string} - decrypted password
   */
  decryptFrontendPassword: (password) => {
    return CryptoJS.AES.decrypt(password, passwordSecretKey).toString(
      CryptoJS.enc.Utf8
    );
  },

  /**
   * Hash the password
   *
   * @param {string} password - plain text password
   * @return {Promise<string>} - hashed password
   */
  hashPassword: (password) => {
    return bcrypt.hash(password, 10);
  },

  /**
   * Number of attempts remaining for a user to login
   *
   * @param {number} attempts
   * @return number
   */
  loginAttemptsRemaining: (attempts) => allowedLoginAttempts - attempts,

  /**
   * Check if command center is active
   *
   * @param {Object} commandCenterID - commandCenterID string
   * @return {Promise<Object>} - iis command center is active
   */

  // checkIfCommandCenterActive: async (commandCenterID) => {
  //   try {
  //     const key = `cc:${commandCenterID}`;
  //     let ccData = await commandCenterCache.getCommandCenterStatus(key);

  //     // ccData = JSON.parse(ccData); // ignoring parsing and directly checking with strings

  //     return Promise.resolve({
  //       err:
  //         ccData && ccData.length && ccData[0] === "true"
  //           ? null
  //           : "Command Center is disabled, please contact Super Admin",
  //       data: ccData && ccData.length ? ccData[0] : null,
  //     });
  //   } catch (e) {
  //     return Promise.reject(e);
  //   }
  // },
  // canSuperBillingAdminBeCreatedOrEdited: (userRole) => {
  //   return userRole == "Super Administrator";
  // },
});
