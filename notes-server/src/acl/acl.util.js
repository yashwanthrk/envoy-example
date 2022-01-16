const { response } = require("../support/supportFunctions");

module.exports = {
  accessScope: (scope) => {
    return function (req, res, next) {
      if (!scope || !req.scopes) {
        return next();
      }
      if (req.scopes.indexOf(scope) > -1) {
        return next();
      } else {
        return res.status(403).json(response("error", "Unauthorized Access"));
      }
    };
  },
};
