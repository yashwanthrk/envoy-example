const { param } = require("express-validator");

module.exports.paramValidation = [
  param("id").isLength({ min: 1, max: 25 }).isMongoId(),
];

module.exports.cpmrnValidation = [param("CPMRN").isLength({ min: 1, max: 25 })];

module.exports.encountersValidation = [
  param("encounters").isLength({ min: 1, max: 10 }),
];
