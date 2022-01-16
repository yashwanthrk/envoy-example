const { param, body } = require("express-validator");
const { xssSanitizer } = require("../service/sanitizer");

export const _idValidation = body("_id").isMongoId();
export const cpmrnParamValidation = param("CPMRN")
  .not()
  .isIn(["null", "undefined"])
  .customSanitizer(xssSanitizer)
  .trim();
export const encountersParamValidation = param("encounters")
  .not()
  .isIn(["null", "undefined"])
  .customSanitizer(xssSanitizer)
  .trim();
