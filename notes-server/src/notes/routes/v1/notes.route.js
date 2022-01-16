const express = require("express");
const router = express.Router();
const { validateAccessToken } = require("../../../auth/validateToken");
const notesController = require("../../controllers/v1/notes.controller");
const audit = require("../../../middlewares/audit");
const accessScope = require("../../../middlewares/accessScope");
const patientUtil = require("../../../patients/support/patient.support");

const { body, param } = require("express-validator");
const validator = require("../../../middlewares/validator");

let add_notes_validator = [
  param("CPMRN").not().isIn(["null", "undefined"]),
  param("encounters").not().isIn(["null", "undefined"]),
  body("note").exists(),
];
router.post(
  "/:CPMRN/:encounters",
  validateAccessToken,
  accessScope("create_note"),
  patientUtil.checkIfDischargeTimeElapsed,
  add_notes_validator,
  validator,
  notesController.add_notes,
  audit
);

let get_prepopulate_validator = [
  param("CPMRN").not().isIn(["null", "undefined"]),
  param("encounters").not().isIn(["null", "undefined"]),
];
router.post(
  "/prepopulate/:CPMRN/:encounters",
  validateAccessToken,
  accessScope("aira"),
  get_prepopulate_validator,
  validator,
  notesController.get_prepopulate
);

let update_notes_validator = [
  param("CPMRN").not().isIn(["null", "undefined"]),
  param("encounters").not().isIn(["null", "undefined"]),
  param("OBJID").exists().isString(),
];
router.put(
  "/:CPMRN/:encounters/:OBJID",
  validateAccessToken,
  accessScope("update_note"),
  patientUtil.checkIfDischargeTimeElapsed,
  update_notes_validator,
  validator,
  notesController.update_notes,
  audit
);

let update_draftnote_validator = [
  param("CPMRN").not().isIn(["null", "undefined"]),
  param("encounters").not().isIn(["null", "undefined"]),
];
router.put(
  "/updatedraft/:CPMRN/:encounters",
  validateAccessToken,
  update_draftnote_validator,
  validator,
  notesController.autosave_note,
  audit
);

let delete_draftnote_validator = [
  body("CPMRN").exists().isString(),
  body("encounters").exists().isInt(),
  // body('currentUser').exists(),
  body("refId").exists().isString(),
];
router.put(
  "/deletedraft",
  validateAccessToken,
  accessScope("delete_note_draft"),
  patientUtil.checkIfDischargeTimeElapsed,
  delete_draftnote_validator,
  validator,
  notesController.delete_draftnote,
  audit
);

let delete_pended_notes_validator = [
  body("CPMRN").exists().isString(),
  body("encounters").exists().isInt(),
  // body('user').exists(),
  body("noteId").exists().isString(),
];
router.put(
  "/deletepended",
  validateAccessToken,
  accessScope("delete_note_pended"),
  patientUtil.checkIfDischargeTimeElapsed,
  delete_pended_notes_validator,
  validator,
  notesController.delete_pended_notes,
  audit
);

let delete_codesheet_validator = [
  body("CPMRN").exists().isString(),
  body("encounters").exists().isInt(),
];
router.put(
  "/deleteCodesheet",
  validateAccessToken,
  accessScope("delete_code_sheet"),
  patientUtil.checkIfDischargeTimeElapsed,
  delete_codesheet_validator,
  validator,
  notesController.delete_codesheet,
  audit
);

let update_code_sheet_validator = [
  param("CPMRN").not().isIn(["null", "undefined"]),
  param("encounters").not().isIn(["null", "undefined"]),
];
router.put(
  "/codesheet/updateCodeSheet/:CPMRN/:encounters",
  validateAccessToken,
  accessScope("update_code_sheet"),
  patientUtil.checkIfDischargeTimeElapsed,
  update_code_sheet_validator,
  validator,
  notesController.update_code_sheet,
  audit
);

router.post(
  "/codesheet/codesheetdraft/:CPMRN/:encounters",
  validateAccessToken,
  accessScope("update_code_sheet"),
  patientUtil.checkIfDischargeTimeElapsed,
  update_code_sheet_validator,
  validator,
  notesController.codeSheet_draft,
  audit
);

module.exports = router;
