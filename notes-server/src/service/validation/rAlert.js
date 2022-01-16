const { param, body } = require("express-validator");
const { xssSanitizer, deepXssSanitizer } = require("../sanitizer");
const { paramValidation } = require("./index");

const get_ralert_devices_validator = [...paramValidation];
const create_ralert_device_validator = [
  body("commandCenterID").isLength({ min: 1, max: 25 }).isMongoId(),
  body("deviceId")
    .exists()
    .isString()
    .isLength({ min: 2, max: 15 })
    .customSanitizer(xssSanitizer),
  body("hospitalName")
    .exists()
    .isString()
    .isLength({ min: 2, max: 50 })
    .customSanitizer(xssSanitizer),
  body("unitName")
    .exists()
    .isString()
    .isLength({ min: 2, max: 50 })
    .customSanitizer(xssSanitizer),
  // body("hospitalLogo").exists().isString(),
  body("wifi").exists().isArray().customSanitizer(deepXssSanitizer),
  body("hospitalID").isLength({ min: 1, max: 25 }).isMongoId(),
  body("unitID").isLength({ min: 1, max: 25 }).isMongoId(),
  // body("bedNo").isLength({ min: 1, max: 25 }),
];

const update_ralert_device_validator = [
  ...paramValidation,
  ...create_ralert_device_validator,
];

const delete_ralert_device_validator = [...paramValidation];

const acknowledge_ralert_message_validator = [...paramValidation];

const get_beds_validator = [
  body("hospitalID").isLength({ min: 1, max: 25 }).isMongoId(),
  body("unitID").isLength({ min: 1, max: 25 }).isMongoId(),
];

const get_allocated_beds_validator = [...get_beds_validator];
module.exports = {
  get_ralert_devices_validator,
  create_ralert_device_validator,
  update_ralert_device_validator,
  delete_ralert_device_validator,
  //   get_ralert_messages_validator,
  acknowledge_ralert_message_validator,
  get_beds_validator,
  get_allocated_beds_validator,
};
