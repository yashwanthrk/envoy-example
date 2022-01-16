const jwt = require("jsonwebtoken");
const { getScopeListForRole, allowedSuperRoles } = require("../acl/index");
const AuthCache = require("../service/cache/auth");
const authCache = new AuthCache();
const {
  // checkIfCommandCenterActive,
  getUserBasicInfoInCache,
} = require("../support/auth");
const { checkTokenExistInUserInfo } = require("../support/auth.utils");

module.exports = {
  /**
   *
   * @param {*} req
   * @param {*} res
   * @param {*} next
   */
  ignorePublicRoutes: async (req, res, next) => {
    const publicRoutes = [
      "/requestAccessToken",
      "/login",
      "/auth/forgot-password",
      "/auth/otp/verify",
      "/auth/otp/resend",
    ];
    if (publicRoutes.indexOf(req.path) < 0) {
      // do something
    }
    next();
  },
  /**
   *
   * @param {*} req
   * @param {*} res
   * @param {*} next
   * @returns
   */
  validateAccessToken: async (req, res, next) => {
    try {
      const token_header = req.headers.authorization;
      if (!token_header) {
        return res.status(401).json({
          message: "Authorization header is missing",
        });
      }
      console.log("token_header: ", token_header);
      const token = token_header.split(" ")[1]; // token value after Bearer followed by 'space'

      if (!token) {
        if (!token_header) {
          return res.status(401).json({
            message: "Protected route, Bearer token is must",
          });
        }
      }

      let decoded = null;
      try {
        decoded = jwt.verify(token, process.env.JWTKEY);
      } catch (e) {
        console.log("Token verification failed");
        if (e.name === "TokenExpiredError") {
          return res.status(401).json({
            message: e.name,
          });
        }
        return res.status(401).json({
          message: "Token verification failed; Please Re-login",
          error: e,
        });
      }

      req.userData = decoded;

      let userCacheData = await getUserBasicInfoInCache(
        req.userData.email,
        "basicInfo",
        "tokenInfo"
      );

      let userInfo = userCacheData[0];
      let tokenInfo = userCacheData[1];
      if (!userInfo || !tokenInfo) {
        return res.status(401).json({
          message: "Auth failed, bad token; please Re-login",
        });
      }

      if (!checkTokenExistInUserInfo(token, userCacheData[1])) {
        return res.status(401).json({
          message: "Auth failed, bad token; please Re-login",
        });
      }

      userInfo = JSON.parse(userInfo);
      console.log("userInfo: ", userInfo);

      req.userData.userId = userInfo["userId"];
      // for admin roles like sys admin, billing admin, med admin - hospitals will be null
      req.userData.hospitals = userInfo.hospitals || null;
      req.userData.units = userInfo.units;
      req.userData.role = userInfo.role;
      req.userData.allowedRoles = userInfo.allowedRoles;
      req.userData.createdAt = userInfo.mongoCreatedAt || null;
      req.userData.name = userInfo.name || null;
      req.userData.allowedCommandCenters =
        userInfo.allowedCommandCenters || null;
      req.userData.commandCenterID = userInfo.commandCenterID || null;
      req.userData.title = userInfo.title || "";
      req.userData.qualification = userInfo.qualification || "";
      req.userData.phone = userInfo.phone || "";

      // // Command Center Status
      // if (!allowedSuperRoles.includes(userInfo.role)) {
      //   const { err: ccErr, data: ccActive } = await checkIfCommandCenterActive(
      //     userInfo["commandCenterID"]
      //   );

      //   // null is considered active in command center
      //   if (ccActive == "false") {
      //     return res.status(401).json({
      //       message: ccErr,
      //     });
      //   }
      // }

      // Scopes
      req.scopes = getScopeListForRole(req.userData.role);

      // TODO -  check blocked and inactive users in redis itself - future
      next();
    } catch (error) {
      // expired tokens, etc will be printed. No way to handle it.

      console.log(error.stack);
      return res.status(401).json({
        message: "Auth failed, bad token; please Re-login",
        error: error,
      });
    }
  },

  /**
   *
   * @param {*} req
   * @param {*} res
   * @param {*} next
   * @returns
   */
  validateRefreshToken: async (req, res, next) => {
    try {
      const refresh_token = req.query["x-refresh-token"];
      if (!refresh_token) {
        return res.status(401).json({
          message: "Refresh Token not found, Please Re-Login",
        });
      }
      let decoded = null;
      try {
        decoded = jwt.verify(refresh_token, process.env.JWTKEY);
      } catch (e) {
        console.log("Refresh token verification failed", e);
        return res.status(401).json({
          message: "Refresh Token verification failed; Please Re-login",
          error: e,
        });
      }

      req.userData = decoded;

      // check refresh token exists for the email
      const key = authCache.generateRefreshTokenKey(req.userData.email);
      const saved_refresh_token = await authCache.getRefreshToken(key);
      if (saved_refresh_token !== refresh_token) {
        return res.status(401).json({
          message: "Refresh Token not found, Please Re-Login",
        });
      }
      req.userData.refresh_token = saved_refresh_token;

      next();
    } catch (error) {
      // expired tokens, etc will be printed. No way to handle it.

      console.log(error.stack);
      return res.status(401).json({
        message: "Auth failed, bad token; please Re-login",
        error: error,
      });
    }
  },
};
