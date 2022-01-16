const { param, body } = require("express-validator");
const { paramValidation } = require("./index");

const create_command_center_validator = [
  body("name").exists().isString().isLength({ min: 3, max: 50 }),
  body("address").exists().isString(),
  body("hospitalCode").exists().isString().isLength({ min: 2, max: 15 }),
  body("cityCode").exists().isString().isLength({ min: 1, max: 15 }),
  body("countryCode").exists().isString().isLength({ min: 1, max: 15 }),
  body("stateCode").exists().isString().isLength({ min: 1, max: 5000 }),
  body("isActive").exists().toBoolean(),
];

const edit_command_center_validator = [
  ...create_command_center_validator,
  ...paramValidation,
];

const get_command_center_info_validator = [...paramValidation];
const create_user_validator = [
  body("name").exists().isString().isLength({ min: 1, max: 50 }),
  body("email").exists().isEmail().isLength({ min: 1, max: 50 }),
  body("password")
    .exists()
    .isString()
    .isStrongPassword()
    .isLength({ min: 5, max: 50 }),
  body("role").exists().isString().isLength({ min: 1, max: 50 }),
  body("phone").exists().isString().isLength({ min: 10, max: 10 }),
];

const edit_user_validator = [
  body("name").exists().isString().isLength({ min: 1, max: 50 }),
  body("email").exists().isEmail().isLength({ min: 1, max: 50 }),
  body("role").exists().isString().isLength({ min: 1, max: 50 }),
  body("phone").exists().isString().isLength({ min: 10, max: 10 }),
  ...paramValidation,
];

const add_multiple_command_centers_validator = [
  body("allowedCommandCenters").exists().isArray(),
].concat(paramValidation);

const create_hospital_validator = [
  ...create_command_center_validator,
  body("commandCenterID").exists().isString(),
  body("logo").exists().notEmpty(),
];

const edit_hospital_validator = [
  ...create_command_center_validator,
  ...paramValidation,
];
const get_hospital_info_validator = [...paramValidation];
const get_unit_info_validator = [
  param("hospitalID").isLength({ min: 1, max: 25 }).isMongoId(),
  param("unitID").isLength({ min: 1, max: 25 }).isMongoId(),
];

const submit_camera_validator = [
  body("hospitalID").isLength({ min: 5, max: 25 }).isMongoId(),
  body("hospitalID").isLength({ min: 5, max: 25 }).isMongoId(),
  body("unitID").isLength({ min: 5, max: 25 }).isMongoId(),
  body("cameraName").exists().isString().isLength({ min: 2, max: 25 }),
  body("userName").exists().isString().isLength({ min: 3, max: 25 }),
  body("password").exists().isString(),
  body("channel").exists().isString(),
  body("cameraIp").exists().isString(),
];

const delete_camera_validator = [
  body("hospitalID").isLength({ min: 5, max: 25 }).isMongoId(),
  body("unitID").isLength({ min: 5, max: 25 }).isMongoId(),
  body("id").isLength({ min: 5, max: 25 }).isMongoId(),
];

const submit_bed_validator = [
  body("hospitalID").isLength({ min: 5, max: 25 }).isMongoId(),
  body("unitID").isLength({ min: 5, max: 25 }).isMongoId(),
  body("bed_no").exists().isString(),
  body("camera").exists().isString(),
];

const delete_bed_validator = [...delete_camera_validator];
const submit_doctor_validator = [
  body("hospitalID").isLength({ min: 5, max: 25 }).isMongoId(),
  body("name").exists().isString().isLength({ min: 3, max: 25 }),
];

const delete_doctor_validator = [
  body("hospitalID").isLength({ min: 5, max: 25 }).isMongoId(),
  body("id").isLength({ min: 5, max: 25 }).isMongoId(),
];
const submit_unit_validator = [
  body("name").exists().isString().isLength({ min: 1, max: 25 }),
  body("hospitalID").isLength({ min: 5, max: 25 }).isMongoId(),
];

const get_ralert_validator = [...paramValidation];

const delete_logo_validator = [
  body("hospitalID").isLength({ min: 5, max: 25 }).isMongoId(),
  body("key").isLength({ min: 5, max: 150 }),
];
module.exports = {
  create_command_center_validator,
  edit_command_center_validator,
  get_command_center_info_validator,

  create_user_validator,
  edit_user_validator,
  add_multiple_command_centers_validator,
  create_hospital_validator,
  edit_hospital_validator,
  get_hospital_info_validator,
  get_unit_info_validator,

  submit_camera_validator,
  delete_camera_validator,
  submit_bed_validator,
  delete_bed_validator,
  submit_doctor_validator,
  delete_doctor_validator,
  submit_unit_validator,

  get_ralert_validator,

  delete_logo_validator,
};
