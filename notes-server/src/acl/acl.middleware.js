const nurseScopes = [
  "read_vital",
  "create_vital",
  "get_file_signed_url",
  "get_orderables",
  "get_orderable",
  "get_camera",

  // IO
  "get_io",
  "update_io",

  // SBAR
  "read_sbar",
  "create_sbar",
  "edit_sbar",
  "update_sbar", // - remove later

  // Shift Assignment
  "read_shift_assignment",
  "shift_assign",

  // Signout
  "read_signout",

  // Protocol
  "get_protocol",
  "place_protocol",
  "get_protocol_file",
  "discontinue_protocol",

  // Summary
  "get_summary",
  "save_summary",

  // Patient
  "get_patient",
  "get_patients",
  "create_patient",
  "update_patient",
  "search_patient",
  "get_discharge_patients",
  "update_patient_severity",
  "update_patient_covid",

  // Order
  "read_orders",
  "edit_order",
  "move_order",
  "place_order",
  "discontinue_order",
  "communicate_order",

  "create_orderable_request",

  // Document/Lab
  "create_lab",
  "update_lab",
  "delete_lab",
  "get_lab_image",

  // Hospital
  "get_hospitals",
  "get_available_beds",
  "get_primary_md",

  // Note
  "aira",
  "read_note",
  "lock_note",
  "create_note",
  "update_note",
  "autosave_note",
  "delete_note_draft",
  "delete_note_pended",

  // Code Sheet
  "delete_code_sheet",
  "update_code_sheet",
  "autosave_code_sheet",

  // Notebook
  "get_notebook",
  "create_notebook_note",
  "create_notebook_diagnosis",
  "create_system",
  "create_todo",
  "edit_note",
  "edit_diagnosis",
  "edit_todo",
  "delete_diagnosis",
  "delete_note",
  "delete_todo",
  "copy_system",
  "create_note_diagnosis",

  // Chat
  "get_chat",

  // Patient Monitor
  "get_patient_monitors",
  "get_patient_monitor_latest_data",

  // MAR
  "MAR-getSchedules",
  "MAR-checkForInfusionCompletion",
  "MAR-getLatestSchedule",
  "MAR-updateSchedule",
  "MAR-updateInfusionSchedule",
];

export const rnScopes = [...nurseScopes];

export const ccrnScopes = [...nurseScopes];

export const nursePractitionerScopes = [...nurseScopes, "edit_MRN"];

export const physicianScopes = [
  "read_sbar",
  "take_action",
  "update_sbar", // - remove later

  "get_camera",
  "get_io",

  "read_vital",

  "get_patient",
  "get_patients",
  "create_patient",
  "update_patient",
  "search_patient",
  "get_discharge_patients",
  "update_patient_severity",
  "update_patient_covid",

  "get_summary",

  "get_protocol",
  "sign_protocol",
  "place_protocol",
  "get_protocol_file",
  "discontinue_protocol",

  "update_on_call",

  // orders
  "read_orders",
  "edit_order",
  "sign_order",
  "place_order",
  "discontinue_order",

  "create_orderable_request",

  // Document
  "delete_lab",
  "get_lab_image",

  // Hospital
  "get_hospitals",
  "get_available_beds",
  "get_primary_md",

  "get_file_signed_url",

  "get_orderables",
  "get_orderable",

  // Note
  "aira",
  "lock_note",
  "read_note",
  "create_note",
  "update_note",
  "autosave_note",
  "delete_note_draft",
  "delete_note_pended",

  // Code Sheet
  "delete_code_sheet",
  "update_code_sheet",
  "autosave_code_sheet",

  // Notebook
  "get_notebook",
  "create_notebook_note",
  "create_notebook_diagnosis",
  "create_system",
  "create_todo",
  "edit_note",
  "edit_diagnosis",
  "edit_todo",
  "delete_diagnosis",
  "delete_note",
  "delete_todo",
  "copy_system",
  "create_note_diagnosis",

  // Shift Assignment
  "read_shift_assignment",
  "shift_assign",

  // Signout
  "read_signout",

  // orders
  "read_orders",

  // Chat
  "get_chat",

  // Patient Monitor
  "get_patient_monitors",

  // MAR
  "MAR-getSchedules",
  "MAR-checkForInfusionCompletion",
];

export const dietitianScopes = [
  // SBAR
  "read_sbar",
  "create_sbar",
  "update_sbar",

  "get_camera",
  "get_io",

  "read_vital",

  "get_protocol",
  "place_protocol",
  "get_protocol_file",
  "discontinue_protocol",

  "get_summary",

  "get_patient",
  "get_patients",
  "create_patient",
  "update_patient",
  "search_patient",
  "get_discharge_patients",
  "update_patient_severity",
  "update_patient_covid",

  // orders
  "read_orders",
  "edit_order",
  "move_order",
  "place_order",
  "discontinue_order",
  "communicate_order",

  "create_orderable_request",

  // Document
  "delete_lab",
  "get_lab_image",

  // Hospital
  "get_hospitals",
  "get_available_beds",
  "get_primary_md",

  "get_file_signed_url",

  "get_orderables",
  "get_orderable",

  // Note
  "lock_note",
  "read_note",
  "create_note",
  "update_note",
  "autosave_note",
  "delete_note_draft",
  "delete_note_pended",
  "aira",

  // Code Sheet
  "delete_code_sheet",
  "update_code_sheet",
  "autosave_code_sheet",

  // Notebook
  "get_notebook",
  "create_notebook_note",
  "create_notebook_diagnosis",
  "create_system",
  "create_todo",
  "edit_note",
  "edit_diagnosis",
  "edit_todo",
  "delete_diagnosis",
  "delete_note",
  "delete_todo",
  "copy_system",
  "create_note_diagnosis",

  // Signout
  "read_signout",

  // orders
  "read_orders",

  // Chat
  "get_chat",

  // Patient Monitor
  "get_patient_monitors",

  // MAR
  "MAR-getSchedules",
  "MAR-checkForInfusionCompletion",

  // Shift Assignment
  "read_shift_assignment",
  "shift_assign",
];

export const pharmacologistScopes = [
  // SBAR
  "read_sbar",
  "create_sbar",
  "update_sbar",

  "get_camera",
  "get_io",

  "read_vital",

  "get_protocol",
  "place_protocol",
  "get_protocol_file",
  "discontinue_protocol",

  "get_summary",

  "get_patient",
  "get_patients",
  "create_patient",
  "update_patient",
  "search_patient",
  "get_discharge_patients",
  "update_patient_severity",
  "update_patient_covid",

  // orders
  "read_orders",
  "edit_order",
  "move_order",
  "place_order",
  "discontinue_order",
  "communicate_order",

  "create_orderable_request",

  // Document
  "delete_lab",
  "get_lab_image",

  // Hospital
  "get_hospitals",
  "get_available_beds",
  "get_primary_md",

  "get_file_signed_url",

  "get_orderables",
  "get_orderable",

  // Note
  "lock_note",
  "read_note",
  "create_note",
  "update_note",
  "autosave_note",
  "delete_note_draft",
  "delete_note_pended",
  "aira",

  // Code Sheet
  "delete_code_sheet",
  "update_code_sheet",
  "autosave_code_sheet",

  // Notebook
  "get_notebook",
  "create_notebook_note",
  "create_notebook_diagnosis",
  "create_system",
  "create_todo",
  "edit_note",
  "edit_diagnosis",
  "edit_todo",
  "delete_diagnosis",
  "delete_note",
  "delete_todo",
  "copy_system",
  "create_note_diagnosis",

  // Signout
  "read_signout",

  // Chat
  "get_chat",

  // Patient Monitor
  "get_patient_monitors",

  // MAR
  "MAR-getSchedules",
  "MAR-checkForInfusionCompletion",

  // Shift Assignment
  "read_shift_assignment",
  "shift_assign",
];

export const billingAdministratorScopes = [
  "get_hospital_billing",

  // Hospital
  "get_hospitals",
];

export const superBillingAdministratorScopes = [
  ...billingAdministratorScopes,

  // Hospital
  "get_command_centers",
];

export const medicalAdministratorScopes = [
  "get_hospitals",
  "create_lab",

  "get_orderable",
  "get_orderables",
  "check_orderable",
  "create_orderable",
  "update_orderable",
  "delete_orderable",
  "set_orderable_default",
  "delete_orderable_preset",
  "set_orderable_display_shortcut",

  "get_orderable_requests",
  "accept_orderable_request",
  "reject_orderable_request",

  "get_protocol",
  "create_protocol",
  "update_protocol",
  "delete_protocol",
  "get_protocol_signed_url",

  "get_protocols",
  "readmit_patient",
  "get_discharge_patients",
];

export const tvScopes = ["tv", "get_hospitals", "get_patients", "get_on_call"];

export const auditorScopes = ["get_vital_dashboard"];

export const ralertScopes = [
  "acknowledge_ralert_message",
  "get_ralert_messages",
];

export const labTechnicianScopes = [
  "read_vital",
  "get_file_signed_url",

  // Patient
  "get_patient",
  "get_patients",
  "search_patient",

  // SBAR
  "read_sbar",
  "create_sbar",
  "update_sbar",

  // Document/Lab
  "create_lab",
  "update_lab",
  "delete_lab",
  "get_lab_image",

  // Hospital
  "get_hospitals",

  // Code Sheet
  "delete_code_sheet",
  "update_code_sheet",
  "autosave_code_sheet",

  // orders
  "read_orders",

  // Protocol
  "get_protocol_file",

  // Chat
  "get_chat",

  // MAR
  "MAR-getSchedules",
  "MAR-checkForInfusionCompletion",

  // Shift Assignment
  "read_shift_assignment",
  "shift_assign",

  // Summary
  "get_summary",
];

export const documentationSpecialistScopes = [
  "get_camera",
  // Patient
  "get_patient",
  "get_patients",
  "search_patient",

  // SBAR
  "read_sbar",
  "create_sbar",
  "update_sbar",

  "read_vital",
  "get_file_signed_url",

  "read_vital",
  "create_vital",

  // Note
  "aira",
  "read_note",
  "lock_note",
  "create_note",
  "update_note",
  "autosave_note",
  "delete_note_draft",
  "delete_note_pended",

  // Code Sheet
  "delete_code_sheet",
  "update_code_sheet",
  "autosave_code_sheet",

  // Document/Lab
  "create_lab",
  "update_lab",
  "delete_lab",
  "get_lab_image",

  "get_io",
  "update_io",

  // Summary
  "get_summary",
  "save_summary",

  // orders
  "read_orders",

  // Protocol
  "get_protocol_file",

  // Hospital
  "get_hospitals",

  // Chat
  "get_chat",

  // Patient Monitor
  "get_patient_monitor_latest_data",

  // MAR
  "MAR-getSchedules",
  "MAR-checkForInfusionCompletion",

  // Shift Assignment
  "read_shift_assignment",
  "shift_assign",
];

/*
 * decide on - camera, code sheet
 * */
export const physicalTherapistScopes = [
  "get_file_signed_url",

  // Patient
  "get_patient",
  "get_patients",
  "search_patient",
  "get_discharge_patients",

  // SBAR
  "read_sbar",
  "create_sbar",
  "update_sbar",

  "read_vital",

  // Note
  "aira",
  "read_note",
  "lock_note",
  "create_note",
  "update_note",
  "autosave_note",
  "delete_note_draft",
  "delete_note_pended",

  // Document/Lab
  "get_lab_image",

  "get_io",

  // Summary
  "get_summary",
  "save_summary",

  // orders
  "read_orders",

  // Protocol
  "get_protocol_file",

  // Hospital
  "get_hospitals",

  // Chat
  "get_chat",

  // MAR
  "MAR-getSchedules",
  "MAR-checkForInfusionCompletion",

  // Signout
  "read_signout",

  // Shift Assignment
  "read_shift_assignment",
  "shift_assign",
];

export const occupationalTherapistScopes = [...physicalTherapistScopes];

export const respiratoryTherapistScopes = [
  "get_file_signed_url",
  "get_camera",

  // Patient
  "get_patient",
  "get_patients",
  "search_patient",
  "get_discharge_patients",

  // SBAR
  "read_sbar",
  "create_sbar",
  "update_sbar",

  // Vitals
  "read_vital",
  "create_vital",

  // Note
  "aira",
  "read_note",
  "lock_note",
  "create_note",
  "update_note",
  "autosave_note",
  "delete_note_draft",
  "delete_note_pended",

  // Document/Lab
  "get_lab_image",

  "get_io",

  // Summary
  "get_summary",
  "save_summary",

  // orders
  "read_orders",

  // Protocol
  "get_protocol_file",

  // Hospital
  "get_hospitals",

  // Chat
  "get_chat",

  // Signout
  "read_signout",

  // MAR
  "MAR-getSchedules",
  "MAR-checkForInfusionCompletion",
  "MAR-getLatestSchedule",
  "MAR-updateSchedule",
  "MAR-updateInfusionSchedule",

  // Patient Monitor
  "get_patient_monitor_latest_data",

  // Shift Assignment
  "read_shift_assignment",
  "shift_assign",
];

/**
 * Super Admin
 *
 */
export const superAdministratorScopes = [
  // user
  "get_user",
  "update_user",
  "user_signup",
  "shift_assign",
  "add_command_centers_users",

  // Command center
  "get_command_centers",
  "create_command_center",
  "update_command_center",
  "get_signedUrl_for_command_center_logo",
  "create_command_center_unit",
  "get_command_center_info",

  // Hospital
  "get_hospitals",
  "create_hospital",
  "update_hospital",
  "create_hospital_camera",
  "create_hospital_bed",
  "delete_hospital_camera",
  "delete_hospital_bed",
  "create_hospital_doctor",
  "delete_hospital_doctor",
  "get_signedUrl_for_hospital_logo",
  "create_hospital_unit",
  "get_hospital_info",
  "get_unit_info",

  // RAlert
  "get_ralert_devices",
  "delete_ralert_device",
  "update_ralert_device",
  "create_ralert_device",

  // Patient Monitor
  "get_patient_monitors",
  "create_patient_monitor",
  "delete_patient_monitor",
  "update_patient_monitor",
  "check_unique_patient_monitor",
];

// currently system admin can't perform write operations in hospital
export const systemAdministratorScopes = [
  // Command Centers
  "get_command_center_info",

  "get_user",
  "update_user",
  "user_signup",
  "shift_assign",

  // Hospital
  "get_hospitals",
  "get_signedUrl_for_hospital_logo",
  "get_hospital_info",
  "get_unit_info",

  // RAlert
  "get_ralert_devices",
  "delete_ralert_device",
  "update_ralert_device",
  "create_ralert_device",

  // Patient Monitor
  "get_patient_monitors",
  "create_patient_monitor",
  "delete_patient_monitor",
  "update_patient_monitor",
  "check_unique_patient_monitor",
];
