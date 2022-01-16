const { response } = require("../support/supportFunctions");
const Audit = require("../service/audit");

const audit = new Audit();

exports = module.exports = auditMiddleware;

function auditMiddleware(req, res, next) {
  const type =
    res.locals.audit && res.locals.audit.type ? res.locals.audit.type : null;

  const params =
    res.locals.audit && res.locals.audit.params
      ? res.locals.audit.params
      : res.locals.cpparams;

  audit
    .success()
    .parseRequest(req, { params, type })
    .save()
    .then()
    .catch((_) => {});

  const data = res.locals.cpdata;

  return res.json(response("success", null, null, data));
}
