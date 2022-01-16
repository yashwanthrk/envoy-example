export const allowedRoles = [
  "Super Administrator",
  "System Administrator",
  "Medical Administrator",
  "Super Billing Administrator",
  "Billing Administrator",
  "Dietitian",
  "Critical Care Nurse",
  "Nurse",
  "Nurse Practitioner",
  "Pharmacologist",
  "Physician",
  "Tv",
  "Auditor",
  "Tv-Covid",
  "R-Alert",
  "Lab Technician",
  "Documentation Specialist",
  "Physical Therapist",
  "Occupational Therapist",
  "Respiratory Therapist",
];

export const allowedSuperRoles = [
  "Super Administrator",
  "Super Medical Administrator",
  "Super Billing Administrator",
];

const {
  tvScopes,
  rnScopes,
  ccrnScopes,
  ralertScopes,
  auditorScopes,
  dietitianScopes,
  physicianScopes,
  labTechnicianScopes,
  pharmacologistScopes,
  physicalTherapistScopes,
  nursePractitionerScopes,
  systemAdministratorScopes,
  billingAdministratorScopes,
  respiratoryTherapistScopes,
  medicalAdministratorScopes,
  occupationalTherapistScopes,
  documentationSpecialistScopes,
  superAdministratorScopes,
  superBillingAdministratorScopes,
} = require("./acl.middleware");

const roleObject = {
  Tv: tvScopes,
  Nurse: rnScopes,
  "Tv-Covid": tvScopes,
  "R-Alert": ralertScopes,
  Dietitian: dietitianScopes,
  Physician: physicianScopes,
  "Critical Care Nurse": ccrnScopes,
  "Lab Technician": labTechnicianScopes,
  Pharmacologist: pharmacologistScopes,
  "Nurse Practitioner": nursePractitionerScopes,
  "Physical Therapist": physicalTherapistScopes,
  "System Administrator": systemAdministratorScopes,
  "Billing Administrator": billingAdministratorScopes,
  "Respiratory Therapist": respiratoryTherapistScopes,
  "Medical Administrator": medicalAdministratorScopes,
  "Occupational Therapist": occupationalTherapistScopes,
  "Documentation Specialist": documentationSpecialistScopes,
  "Super Administrator": superAdministratorScopes,
  "Super Billing Administrator": superBillingAdministratorScopes,
};

export const getScopeListForRole = (role) => {
  return roleObject[role];
};
