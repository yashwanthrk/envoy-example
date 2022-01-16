const mongoose = require("mongoose");

const Patient = require("../patients/models/patients.model");
const {
  isPatientGcs,
  computeOrdersState,
  computeOrdersDiscontinue,
  calcQsofa,
  getLatestDocument,
  setRoxColor,
  concatTwoArrays,
} = require("../support/supportFunctions");

const kafka_instance = require("../kafka");
const { getLatestVitals } = require("../support/getLatestVitals");
const winstonLogger = require("../winston");
const { checkIfOrderIsPending } = require("../support/order");
const PatientInfoCache = require("../service/cache/patientInfo");
const { extractPatientBasicInfoFromCache } = require("../support/common.utils");
// const { getDayNum } = require("./vitals/vitals.support");
const { getDayNum } = require("../vitals/support/getDayNum");
const { getPatient } = require("../support/mobile.socket");

const patientInfoCache = new PatientInfoCache();

const self = (module.exports = {
  getPatientForSocket: function (CPMRN, encounters, userId, subRoom = null) {
    console.log("routeLog", "socket - getPatientForSocket");

    Patient.aggregate([
      { $match: { CPMRN, encounters: Number(encounters) } },
      {
        $lookup: {
          from: "mars",
          localField: "CPMRN",
          foreignField: "cpmrn",
          as: "marInfo",
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          lastName: 1,
          initialSymtoms: 1,
          allergies: 1,
          chiefComplaint: 1,
          otherComplications: 1,
          dateOfContactWithHealthFacility: 1,
          dateOfHospitalization: 1,
          dateOfOnsetSymptoms: 1,
          ards: 1,
          chestXray: 1,
          renalFailure: 1,
          coagulopathy: 1,
          cardiacFailure: 1,
          signsAtAdmission: 1,
          symptomsAtAdmission: 1,
          underlyingMedicalConditions: 1,
          onSet: 1,
          covidDetails: 1,
          covidInterviewerDetails: 1,
          occupation: 1,
          nationality: 1,
          fatherName: 1,
          email: 1,
          mobile: 1,
          age: 1,
          sex: 1,
          phone: 1,
          patientImage: 1,
          heightCm: 1,
          heightUnit: 1,
          weightKg: 1,
          weightUnit: 1,
          IBW: 1,
          BMI: 1,
          dob: 1,
          // days: 1,
          vitals: 1,
          bloodGroup: 1,
          MRN: 1,
          CPMRN: 1,
          hospitalName: 1,
          unitName: 1,
          hospitalLogo: 1,
          chronic: 1,
          immune: 1,
          operativeStatus: 1,
          bedNo: 1,
          camera: 1,
          code: 1,
          ICUAdmitDate: 1,
          allergies: 1,
          pastMedicalHistory: 1,
          diagnoses: 1,
          MEWS: 1,
          PCP: 1,
          PCP_phone: 1,
          isCurrentlyAdmitted: 1,
          severity: 1,
          isNIV: 1,
          isIntubated: 1,
          isTrach: 1,
          pressors: 1,
          isHFNC: 1,
          ICUDischargeDate: 1,
          ICUDischargeDisposition: 1,
          ICUDischargeReason: 1,
          encounters: 1,
          admitList: 1,
          orders: 1,
          markedToWriteNotes: 1,
          covid: 1,
          isolation: 1,
          aadhar: 1,
          address: 1,
          patientMonitorId: 1,
          apacheScore: 1,
          ventFreeDays: 1,
          createdBy: 1,
          editedBy: 1,
          marInfo: {
            $map: {
              input: {
                $filter: {
                  input: "$marInfo",
                  as: "each",
                  cond: {
                    $in: ["$$each.orderId", "$pressors"],
                  },
                },
              },
              as: "eachM",
              in: {
                name: "$$eachM.name",
                orderId: "$$eachM.orderId",
                dosage: "$$eachM.dosage",
                dosageUnit: "$$eachM.dosageUnit",
                schedules: { $slice: ["$$eachM.schedules", -2] },
              },
            },

            // name: 1,
            // orderId: 1,
            // latestSchedules: { $slice: ['$marInfo.schedules', 1, 1] }
          },
          hospitalID: 1,
          unitID: 1,
          summary: 1,
        },
      },
    ])
      // .select("-__v")
      .then((patInfo) => {
        let patient = patInfo[0];
        if (patient) {
          const qsofa = calcQsofa(patient.vitals);

          const chronic = concatTwoArrays(
            patient.chronic,
            patient.underlyingMedicalConditions
          );
          const webResponse = {
            _id: patient._id,
            name: patient.name,
            lastName: patient.lastName,
            initialSymtoms: patient.initialSymtoms,
            allergies: patient.allergies,
            chiefComplaint: patient.chiefComplaint,
            otherComplications: patient.otherComplications,
            dateOfContactWithHealthFacility:
              patient.dateOfContactWithHealthFacility,
            dateOfHospitalization: patient.dateOfHospitalization,
            dateOfOnsetSymptoms: patient.dateOfOnsetSymptoms,
            ards: patient.ards,
            chestXray: patient.chestXray,
            renalFailure: patient.renalFailure,
            coagulopathy: patient.coagulopathy,
            cardiacFailure: patient.cardiacFailure,
            signsAtAdmission: patient.signsAtAdmission,
            symptomsAtAdmission: patient.symptomsAtAdmission,
            // underlyingMedicalConditions:
            //   patient.underlyingMedicalConditions,
            onSet: patient.onSet,
            covidDetails: patient.covidDetails,
            covidInterviewerDetails: patient.covidInterviewerDetails,
            occupation: patient.occupation,
            nationality: patient.nationality,
            fatherName: patient.fatherName,
            email: patient.email,
            mobile: patient.mobile,
            age: patient.age,
            sex: patient.sex,
            phone: patient.phone,
            patientImage: patient.patientImage,
            height: patient.heightCm,
            heightUnit: patient.heightUnit,
            weight: patient.weightKg,
            weightUnit: patient.weightUnit,
            IBW: patient.IBW,
            BMI: patient.BMI,
            dob: patient.dob,
            bloodGroup: patient.bloodGroup,
            MRN: patient.MRN,
            CPMRN: patient.CPMRN,
            hospitalName: patient.hospitalName,
            unitName: patient.unitName,
            hospitalLogo: patient.hospitalLogo,
            chronic: chronic,
            immune: patient.immune,
            operativeStatus: patient.operativeStatus,
            bedNo: patient.bedNo,
            camera: patient.camera,
            code: patient.code,
            ICUAdmitDate: patient.ICUAdmitDate,
            allergies: patient.allergies,
            pastMedicalHistory: patient.pastMedicalHistory,
            diagnoses: patient.diagnoses,
            MEWS: patient.MEWS,
            PCP: patient.PCP,
            PCP_phone: patient.PCP_phone,
            isCurrentlyAdmitted: patient.isCurrentlyAdmitted,
            severity: patient.severity,
            isNIV: patient.isNIV,
            isIntubated: patient.isIntubated,
            isTrach: patient.isTrach,
            isPressor: patient.pressors.length > 0 ? true : false,
            isHFNC: patient.isHFNC,
            ICUDischargeDate: patient.ICUDischargeDate,
            ICUDischargeDisposition: patient.ICUDischargeDisposition,
            ICUDischargeReason: patient.ICUDischargeReason,
            // days: patient.days,
            encounters: patient.encounters,
            admitList: patient.admitList,
            isGcs: isPatientGcs(patient.orders.active.communications),
            qsofa: qsofa,
            markedToWriteNotes: patient.markedToWriteNotes,
            covid: patient.covid,
            isolation: patient.isolation,
            aadhar: patient.aadhar,
            address: patient.address,
            patientMonitorId: patient.patientMonitorId,
            apacheScore:
              patient.apacheScore && patient.apacheScore.length
                ? patient.apacheScore.slice(-1)
                : null,
            ventFreeDays:
              patient.ventFreeDays && patient.ventFreeDays.length
                ? patient.ventFreeDays.slice(-1)
                : null,
            marInfo: patient.marInfo,
            pressorMeds: patient.pressors,
            createdBy: patient.createdBy,
            editedBy: patient.editedBy,
            hospitalID: patient.hospitalID,
            unitID: patient.unitID,
            summary: patient.summary,
          };

          let uniqueId = CPMRN + encounters;
          const kafka_data_web = {
            type: uniqueId,
            message: webResponse,
            room: "WEB",
            userId,
            subRoom: patient.hospitalID || subRoom,
          };

          kafka_instance.publishToBroker(kafka_data_web);

          getPatient(CPMRN, encounters, userId, { qsofa, ...patient });
        }
      })
      .catch((err) => {
        console.log(`Error in socket:getPatientForSocket`, err);
      });
  },

  getTvForSocket: async (userId, subRoom = null) => {
    console.log("routeLog", "socket - getTvForSocket");

    const uniqueId = "tv:patientInfo";
    const kafka_data = {
      type: uniqueId,
      message: {
        type: "admitted",
        patientsInfo: "get from server",
      },
      room: "WEB",
      userId,
      subRoom,
    };
    kafka_instance.publishToBroker(kafka_data);
  },

  /**
   * @description This is used in patient list
   * @param {*} CPMRN
   * @param {*} encounters
   * @param {*} userId
   * @param {*} subRoom
   */
  getUpdatedPatientForSocket: function (
    CPMRN,
    encounters,
    userId,
    subRoom = null
  ) {
    console.log("routeLog", "socket - getUpdatedPatientForSocket");
    encounters = parseInt(encounters);

    Patient.aggregate([
      { $match: { CPMRN: CPMRN, encounters: encounters } },
      {
        $project: {
          name: 1,
          lastName: 1,
          initialSymtoms: 1,
          allergies: 1,
          chiefComplaint: 1,
          otherComplications: 1,
          dateOfContactWithHealthFacility: 1,
          dateOfHospitalization: 1,
          dateOfOnsetSymptoms: 1,
          ards: 1,
          chestXray: 1,
          renalFailure: 1,
          coagulopathy: 1,
          PCP: 1,
          cardiacFailure: 1,
          signsAtAdmission: 1,
          symptomsAtAdmission: 1,
          underlyingMedicalConditions: 1,
          onSet: 1,
          covidDetails: 1,
          covidInterviewerDetails: 1,
          occupation: 1,
          nationality: 1,
          fatherName: 1,
          email: 1,
          mobile: 1,
          age: 1,
          sex: 1,
          dob: 1,
          MRN: 1,
          CPMRN: 1,
          hospitalName: 1,
          unitName: 1,
          bedNo: 1,
          camera: 1,
          ICUAdmitDate: 1,
          ICUDischargeDate: 1,
          severity: 1,
          isNIV: 1,
          isIntubated: 1,
          isTrach: 1,
          isHFNC: 1,
          isCurrentlyAdmitted: 1,
          reAdmitReason: 1,
          orders: 1,
          // sbar: 1,
          encounters: 1,
          hospitalLogo: 1,
          communicatedOrders: 1,
          pressors: 1,
          markedToWriteNotes: 1,
          chronic: 1,
          chiefComplaint: 1,
          covid: 1,
          isolation: 1,
          patientMonitorId: 1,
          "notes.finalNotes": {
            $map: {
              input: "$notes.finalNotes",
              as: "each",
              in: {
                _id: "$$each._id",
                createdTimestamp: "$$each.createdTimestamp",
                isDeleteEnabled: "$$each.isDeleteEnabled",
                content: {
                  $arrayElemAt: ["$$each.content", -1],
                },
              },
            },
          },
          documents: {
            $filter: {
              input: "$documents",
              as: "each",
              cond: {
                $or: [
                  { $in: ["ABG", "$$each.tags"] },
                  { $in: ["Xrays", "$$each.tags"] },
                  { $in: ["ECG", "$$each.tags"] },
                ],
              },
            },
          },
          apacheScore: 1,
          ventFreeDays: 1,
          createdBy: 1,
          editedBy: 1,
          // days: 1,
          vitals: 1,
        },
      },
    ])
      .exec()
      .then((pat) => {
        let doc = pat[0];
        let isGcs = isPatientGcs(doc.orders.active.communications);

        let states = computeOrdersState(doc.orders.active);
        let isPended = false;
        let isDraft = false;
        let patNotes = [];

        if (doc.notes && doc.notes.finalNotes) {
          // pended notes
          for (let i = 0; i < doc.notes.finalNotes.length; i++) {
            const notes = doc.notes.finalNotes[i];
            if (notes.content.pendOrSigned === "pended") {
              isPended = true;
              break;
            }
          }

          // final notes
          doc.notes.finalNotes.forEach((note) => {
            // get latest progress / admission notes
            if (
              note.content.noteType == "Progress" &&
              note.content.pendOrSigned === "signed"
            ) {
              patNotes = note.content;
            } else if (
              note.content.noteType == "Admission" &&
              note.content.pendOrSigned === "signed"
            ) {
              patNotes = note.content;
            }
          });
        }
        let isOrderPended = checkIfOrderIsPending(doc.orders.pending);
        let discardedOrderValue = computeOrdersDiscontinue(doc.orders.active);

        // compute ABG ECG xrays
        let abg = {};
        let ecg = {};
        let xray = {};
        if (doc.documents && doc.documents.length) {
          let tempAbg = [],
            tempEcg = [],
            tempXray = [];
          doc.documents.forEach((report) => {
            if (!report.isInactive) {
              if (report.tags.includes("ABG")) {
                tempAbg.push(report);
              } else if (report.tags.includes("ECG")) {
                tempEcg.push(report);
              } else if (report.tags.includes("Xrays")) {
                tempXray.push(report);
              }
            }
          });

          if (tempAbg.length > 1) abg = tempAbg.reduce(getLatestDocument);
          else abg = tempAbg[0];

          if (tempXray.length > 1) xray = tempXray.reduce(getLatestDocument);
          else xray = tempXray[0];

          if (tempEcg.length > 1) ecg = tempEcg.reduce(getLatestDocument);
          else ecg = tempEcg[0];
        }
        // vitals
        // let vitals = [];
        // if (doc.days) {
        //   // console.log('reached');
        //   vitals = getLatestVitals(doc.days);
        // }

        let vitals = doc.vitals
          ? doc.vitals.map((vital) => {
              let dayNum = getDayNum(
                new Date(doc.ICUAdmitDate),
                new Date(vital.timestamp)
              );

              return {
                ...vital,
                dayNum,
              };
            })
          : [];

        const chronic = concatTwoArrays(
          doc.chronic,
          doc.underlyingMedicalConditions
        );
        let patientInfo = {
          _id: doc._id,
          name: doc.name,
          lastName: doc.lastName,
          initialSymtoms: doc.initialSymtoms,
          allergies: doc.allergies,
          chiefComplaint: doc.chiefComplaint,
          otherComplications: doc.otherComplications,
          dateOfContactWithHealthFacility: doc.dateOfContactWithHealthFacility,
          dateOfHospitalization: doc.dateOfHospitalization,
          dateOfOnsetSymptoms: doc.dateOfOnsetSymptoms,
          ards: doc.ards,
          chestXray: doc.chestXray,
          renalFailure: doc.renalFailure,
          coagulopathy: doc.coagulopathy,
          cardiacFailure: doc.cardiacFailure,
          signsAtAdmission: doc.signsAtAdmission,
          symptomsAtAdmission: doc.symptomsAtAdmission,
          // underlyingMedicalConditions: doc.underlyingMedicalConditions,
          onSet: doc.onSet,
          covidDetails: doc.covidDetails,
          covidInterviewerDetails: doc.covidInterviewerDetails,
          occupation: doc.occupation,
          nationality: doc.nationality,
          fatherName: doc.fatherName,
          email: doc.email,
          mobile: doc.mobile,
          age: doc.age,
          dob: doc.dob,
          sex: doc.sex,
          MRN: doc.MRN,
          CPMRN: doc.CPMRN,
          hospitalName: doc.hospitalName,
          unitName: doc.unitName,
          hospitalLogo: doc.hospitalLogo,
          bedNo: doc.bedNo,
          camera: doc.camera,
          ICUAdmitDate: doc.ICUAdmitDate,
          isCurrentlyAdmitted: doc.isCurrentlyAdmitted,
          severity: doc.severity,
          isNIV: doc.isNIV,
          isIntubated: doc.isIntubated,
          isTrach: doc.isTrach,
          isHFNC: doc.isHFNC,
          isPressor: doc.pressors.length > 0 ? true : false,
          // sbar: sbarList,
          PCP: doc.PCP,
          encounters: doc.encounters,
          orderStates: states,
          isOrderPended: isOrderPended,
          isOrderDiscarded: discardedOrderValue,
          notes: { isPended: isPended, isDraft: isDraft },
          notesData: patNotes,
          isGcs,
          ICUDischargeDate: doc.ICUDischargeDate,
          markedToWriteNotes: doc.markedToWriteNotes,
          covid: doc.covid,
          isolation: doc.isolation,
          chronic: chronic,
          chiefComplaint: doc.chiefComplaint,
          vitals,
          patientMonitorId: doc.patientMonitorId ? doc.patientMonitorId : null,
          documents: { abg, ecg, xray },
          apacheScore:
            doc.apacheScore && doc.apacheScore.length
              ? doc.apacheScore.slice(-1)
              : null,
          ventFreeDays:
            doc.ventFreeDays && doc.ventFreeDays.length
              ? doc.ventFreeDays.slice(-1)
              : null,
          createdBy: doc.createdBy,
          editedBy: doc.editedBy,
        };

        const kafka_data = {
          type: "patient updated",
          message: {
            type: "updated",
            patient: patientInfo,
          },
          userId,
          subRoom: patientInfo.hospitalID || subRoom,
        };
        kafka_instance.publishToBroker(kafka_data);
      });
  },

  /**
   * @description This emits the required patient info in parts to update the store - This is to update the patient list
   * @param {Object} patientInfo - Should contain: CPMRN, encounters, hospitalName, unitName, hospitalID, _id(patientID)
   * @param {String} userId
   * @param {String} subRoom
   * @author Suraj Shenoy
   * @date Aug 5 2021
   */
  emitUpdatedPatientList(patientInfo, userId, subRoom = null) {
    const kafka_data = {
      type: "Listen-To-Patient-Updates",
      message: {
        type: "updated",
        patient: patientInfo,
      },
      userId,
      // room: "WEB",
      subRoom: patientInfo.hospitalID || subRoom,
    };
    kafka_instance.publishToBroker(kafka_data);
  },

  getNotesForSocketNewDraft: (
    CPMRN,
    encounters,
    result,
    noteID,
    user,
    userId,
    subRoom = null
  ) => {
    winstonLogger.logger.info("socketLog - getNotesForSocket");
    let draftNotesArray = [];
    if (result.notes.draftNotes)
      draftNotesArray = result.notes.draftNotes.filter(
        (note) => note.authorId === user.email
      );
    let finalNotesArray = [],
      finalNotes = {};
    if (noteID != "new") {
      finalNotesArray = result.notes.finalNotes.filter(
        (note) => note._id.toString() === noteID.toString()
      );
      if (finalNotesArray.length) {
        finalNotes = {
          _id: finalNotesArray[0]._id,
          createdTimestamp: finalNotesArray[0].createdTimestamp,
          isDeleteEnabled: finalNotesArray[0].isDeleteEnabled,
          lock: finalNotesArray[0].lock,
          content: finalNotesArray[0].content.reverse()[0],
        };
      }
    }

    let uniqueId = CPMRN + encounters + "Notes";
    let uniqueIdDrafts = CPMRN + encounters + "Notes" + user.email;
    const kafka_data = {
      type: uniqueId,
      message: finalNotes,
      userId,
      subRoom: result.hospitalID,
    };
    kafka_instance.publishToBroker(kafka_data);
    const kafka_data1 = {
      type: uniqueIdDrafts,
      message: draftNotesArray,
      userId,
      subRoom: result.hospitalID,
    };
    kafka_instance.publishToBroker(kafka_data1);
  },

  getNotesForSocketNew: function (
    CPMRN,
    encounters,
    result,
    createdTimestamp,
    objectID,
    user,
    userId,
    subRoom = null
  ) {
    winstonLogger.logger.info("socketLog - getNotesForSocket");
    let finalNotesArray = [];
    if (createdTimestamp) {
      // for create
      finalNotesArray = result.notes.finalNotes.filter(
        (note) => note.createdTimestamp.getTime() === createdTimestamp.getTime()
      );
    } else if (objectID) {
      // for update
      finalNotesArray = result.notes.finalNotes.filter(
        (note) => note._id.toString() === objectID.toString()
      );
    }
    const finalNotes = {
      _id: finalNotesArray[0]._id,
      createdTimestamp: finalNotesArray[0].createdTimestamp,
      isDeleteEnabled: finalNotesArray[0].isDeleteEnabled,
      content: finalNotesArray[0].content.reverse()[0],
      lock: finalNotesArray[0].lock,
    };

    let draftNotes = [];
    if (
      result.notes &&
      result.notes.draftNotes &&
      result.notes.draftNotes.length
    ) {
      result.notes.draftNotes.forEach((note) => {
        if (note.authorId === user.email) {
          draftNotes.push(note);
        }
      });
    }

    let uniqueId = CPMRN + encounters + "Notes";
    let uniqueIdDrafts = CPMRN + encounters + "Notes" + user.email;
    const kafka_data = {
      type: uniqueId,
      message: finalNotes,
      userId,
      subRoom: subRoom || result.hospitalID,
    };
    kafka_instance.publishToBroker(kafka_data);
    const kafka_data1 = {
      type: uniqueIdDrafts,
      message: draftNotes,
      userId,
      subRoom: subRoom || result.hospitalID,
    };
    kafka_instance.publishToBroker(kafka_data1);
    // global.io.emit(uniqueId, finalNotes);
    // global.io.emit(uniqueIdDrafts, draftNotes);
  },

  getNotesForSocketOnDelete: function (
    CPMRN,
    encounters,
    noteID,
    userId,
    subRoom = null
  ) {
    let uniqueId = CPMRN + encounters + "NoteDelete";
    const kafka_data = {
      type: uniqueId,
      message: noteID,
      userId,
      subRoom,
    };
    kafka_instance.publishToBroker(kafka_data);
    // global.io.emit(uniqueId, noteID);
  },

  getCodeSheetForSocket: function (
    CPMRN,
    encounters,
    result,
    userId,
    subRoom = null
  ) {
    encounters = parseInt(encounters);
    winstonLogger.logger.info("socketLog - getNotesForSocket");

    let uniqueId = CPMRN + encounters + "CodeSheetNotes";

    const note = {
      codeSheet: result.notes.codeSheet,
    };

    const kafka_data = {
      type: uniqueId,
      message: note,
      userId,
      subRoom,
    };
    kafka_instance.publishToBroker(kafka_data);
    // global.io.emit(uniqueId, note);
  },

  getNotesForSocket: function (CPMRN, encounters, userId, subRoom = null) {
    encounters = parseInt(encounters);
    winstonLogger.logger.info("socketLog - getNotesForSocket");

    Patient.aggregate([
      { $match: { CPMRN: CPMRN, encounters: encounters } },
      {
        $project: {
          "notes.finalNotes": {
            $map: {
              input: "$notes.finalNotes",
              as: "each",
              in: {
                _id: "$$each._id",
                createdTimestamp: "$$each.createdTimestamp",
                isDeleteEnabled: "$$each.isDeleteEnabled",
                content: {
                  $arrayElemAt: ["$$each.content", -1],
                },
              },
            },
          },
          "notes.codeSheet": 1,
        },
      },
    ])
      .exec()
      .then((pat) => {
        let doc = pat[0];
        let notes = { finalNotes: [], codeSheet: [] };
        if (doc.notes) {
          if (doc.notes.finalNotes && doc.notes.finalNotes.length) {
            notes.finalNotes = doc.notes.finalNotes;
          }
          if (doc.notes.codeSheet) {
            notes.codeSheet = doc.notes.codeSheet;
          }
        }
        let uniqueId = CPMRN + encounters + "Notes";
        const kafka_data = {
          type: uniqueId,
          message: notes,
          userId,
          subRoom,
        };
        kafka_instance.publishToBroker(kafka_data);
        // global.io.emit(uniqueId, notes);
      });
  },

  // used in patient list
  isDraftExist: function (user, userId) {
    winstonLogger.logger.info("socketLog - isDraftExist");

    // Patient.find({ isCurrentlyAdmitted: true })
    // .select("-__v")
    Patient.aggregate([
      { $match: { isCurrentlyAdmitted: true } },
      {
        $project: {
          CPMRN: 1,
          "notes.draftNotes": {
            $filter: {
              input: "$notes.draftNotes",
              as: "each",
              cond: {
                $eq: ["$$each.authorId", user.email],
              },
            },
          },
        },
      },
    ])
      .exec()
      .then((docs) => {
        const isDraftedNotesExist = docs.map((doc) => {
          let isDraft = false;
          if (
            doc.notes &&
            doc.notes.draftNotes &&
            doc.notes.draftNotes.length
          ) {
            isDraft = true;
          }
          return {
            CPMRN: doc.CPMRN,
            draft: isDraft,
          };
        });
        let uniqueId = user.email;
        const kafka_data = {
          type: uniqueId,
          message: {
            isCurrentlyAdmitted: true,
            draftNotes: isDraftedNotesExist,
          },
          room: "WEB",
          userId,
        };
        kafka_instance.publishToBroker(kafka_data);
        // global.io.emit(user.email, {
        //     isCurrentlyAdmitted: true,
        //     draftNotes: isDraftedNotesExist
        // });
      });
  },

  draftNotes: function (CPMRN, encounters, user, userId, subRoom = null) {
    winstonLogger.logger.info("socketLog - draftNotes");

    Patient.findOne({ CPMRN: CPMRN, encounters: encounters })
      .select("-__v")
      .exec()
      .then((doc) => {
        let notes = { draftNotes: [] };
        if (doc.notes && doc.notes.draftNotes.length) {
          doc.notes.draftNotes.forEach((note) => {
            if (note.authorId === user.email) {
              notes.draftNotes.push(note);
            }
          });
        }
        let uniqueId = CPMRN + encounters + "Notes" + user.email;
        const kafka_data = {
          type: uniqueId,
          message: notes,
          room: "WEB",
          userId,
          subRoom: doc.hospitalID,
        };
        kafka_instance.publishToBroker(kafka_data);
        // global.io.emit(uniqueId, notes);
      });
  },

  getCodesheetDraft: function (CPMRN, encounters, userId, subRoom = null) {
    winstonLogger.logger.info("socketLog - getCodesheetDraft");
    Patient.findOne({
      CPMRN: CPMRN,
      encounters: encounters,
    })
      .select("-__v")
      .exec()
      .then((result) => {
        let uniqueId = CPMRN + encounters + "codesheetDraft";
        // emitting to both mobile and web clients
        const kafka_data = {
          type: uniqueId,
          message: result.notes.codeSheetDraft,
          userId,
          subRoom: result.hospitalID,
        };
        kafka_instance.publishToBroker(kafka_data);
        // global.io.emit(CPMRN + encounters + "codesheetDraft", result.notes.codeSheetDraft);
      });
  },

  /**
   * @description This is to emit the unit info after the shift assignment
   * @param {Unit[]} units - This is the list of units to be emitted
   * @param {String} dataType - Specifies whether its a single unit update or multiple
   * @param {String} userId - User ID for the room
   * @author Suraj Shenoy
   * @date Aug 5 2021
   */
  updateUnitInfo(units, dataType, userId, subRoom = null) {
    const uniqueId = "individual-units-update";
    const kafka_data = {
      type: uniqueId,
      message: { dataType, units },
      room: "WEB",
      userId,
      subRoom,
    };
    kafka_instance.publishToBroker(kafka_data);
  },
});
