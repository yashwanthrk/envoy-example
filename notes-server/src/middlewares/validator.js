const R = require("ramda");
const { validationResult } = require("express-validator");
const { response } = require("../support/supportFunctions");
const { formatValidationError } = require("../support/supportFunctions");
const { logger } = require("../winston");

exports = module.exports = validator;

const errorFilterFn = (body) => {
  return (error) => {
    const param = R.test(/./, error.param)
      ? error.param.split(".")[0]
      : error.param;

    return (
      R.prop(param, body) && error.param !== "type" && error.param !== "_error"
    );
  };
};

function validator(req, res, next) {
  let errors = validationResult(req);

  if (!errors.isEmpty()) {
    errors = errors.array();
    let formattedError = formatValidationError(errors);
    let nestedErrors = [];

    if (errors && errors.length > 0 && errors[0].nestedErrors) {
      nestedErrors = formatValidationError(errors[0].nestedErrors);
    }

    formattedError = [...formattedError, ...nestedErrors];

    const filteredErrors = R.filter(errorFilterFn(req.body), formattedError);

    // Logger
    logger.error(
      `Sanity Check error: Route- ${req.url}, error- ${JSON.stringify(
        filteredErrors
      )}`
    );

    return res
      .status(422)
      .json(response("error", "Validation Error", filteredErrors));
  }

  next();
}
