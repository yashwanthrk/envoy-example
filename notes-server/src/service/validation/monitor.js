const { param, body } = require("express-validator");
const { xssSanitizer, deepXssSanitizer } = require("../sanitizer");
const { paramValidation } = require("./index");

const patientMonitorValidation = [
  body("deviceId").isLength({ min: 1, max: 30 }).customSanitizer(xssSanitizer),
  body("hospitalName")
    .isLength({ min: 1, max: 100 })
    .customSanitizer(xssSanitizer),
  body("unitName").isLength({ min: 1, max: 50 }).customSanitizer(xssSanitizer),
  body("hospitalID").isLength({ min: 1, max: 25 }).isMongoId(),
  body("unitID").isLength({ min: 1, max: 25 }).isMongoId(),
  body("commandCenterID").isLength({ min: 5, max: 25 }).isMongoId(),
];

module.exports = {
  patientMonitorValidation,
};
