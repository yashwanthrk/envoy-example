const { param, body } = require("express-validator");
const { xssSanitizer, deepXssSanitizer } = require("../sanitizer");
const {
  paramValidation,
  cpmrnValidation,
  encountersValidation,
} = require("./index");

const createSbarValidator = [
  body("createDateTime").isString(),
  body("taskCreator").isString(),

  body("module")
    .exists()
    .isString()
    .isIn([
      "Vitals",
      "Orders",
      "Notes",
      "I/O",
      "MAR",
      "Labs / Scans",
      "Summary",
    ]),
  body("urgency")
    .exists()
    .isString()
    .isIn(["New Admission", "Low", "Medium", "High"]),

  body("type").isLength({ min: 1, max: 50 }),
  body("CPMRN").isLength({ min: 1, max: 25 }),
  body("encounters").isLength({ min: 1, max: 10 }),
];
const editSbarValidator = [
  body("createDateTime").isString(),
  body("taskCreator").isString(),

  body("module")
    .exists()
    .isString()
    .isIn([
      "Vitals",
      "Orders",
      "Notes",
      "I/O",
      "MAR",
      "Labs / Scans",
      "Summary",
    ]),
  body("urgency")
    .exists()
    .isString()
    .isIn(["New Admission", "Low", "Medium", "High"]),

  body("type").isLength({ min: 1, max: 50 }),
  body("id").isLength({ min: 1, max: 25 }).isMongoId(),
  ...cpmrnValidation,
  ...encountersValidation,
];

const takeActionValidator = [...editSbarValidator, body("action").isString()];

module.exports = {
  createSbarValidator,
  editSbarValidator,
  takeActionValidator,
};
