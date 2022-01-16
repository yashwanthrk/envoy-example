const mongoInstance = require("./index");

const USER_MODEL = mongoInstance.getDBInstance("users");
const HOSPITAL_MODEL = mongoInstance.getDBInstance("hospitals");
const PATIENT_MODEL = mongoInstance.getDBInstance("patients");

module.exports = {
  USER_MODEL,
  HOSPITAL_MODEL,
  PATIENT_MODEL,
};
