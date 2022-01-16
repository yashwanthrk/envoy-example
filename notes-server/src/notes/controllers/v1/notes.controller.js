const Notes = require("../../../mongo/notes.model");
const Patient = require("../../../patients/models/patients.model");
const Notebook = require("../../../notebooks/models/notebooks.model");
const SOCKET = require("../../../controllers/socket");
const SOCKET_MOBILE = require("../../../support/mobile.socket");
const { response } = require("../../../../support/supportFunctions");
const { logger } = require("../../../logger");
const {
  patientLastOpened,
} = require("../../../patients/support/patient.support");
const {
  isUserAlsoCommandCenter,
  getUserTitle,
} = require("../../support/common.utils");
const aws = require("aws-sdk");
const mongoose = require("mongoose");

aws.config.region = process.env.s3_region;
aws.config.apiVersion = "2015-03-31";

/**
 * Creating new notes and remove from draft notes
 */
exports.add_notes = (req, res, next) => {
  try {
    const CPMRN = req.params.CPMRN;
    const encounters = req.params.encounters;
    const note = req.body.note;
    const user = req.userData;
    const isClient = !isUserAlsoCommandCenter(req.userData);

    // adding authour data into note
    note["content"][0]["authorId"] = user.email;
    note["content"][0]["authorType"] = user.role;
    note["content"][0]["authorIsClient"] = isClient;
    note["content"][0]["author"] = getUserTitle(req.userData);

    res.locals.audit = { type: "note:new", params: { CPMRN, encounters } };
    let finalNotes = {
      createdTimestamp: new Date(),
      content: [
        {
          author: note.content[0].author,
          authorId: note.content[0].authorId,
          authorType: note.content[0].authorType,
          authorIsClient: note.content[0].authorIsClient,
          noteType: note.content[0].noteType,
          noteSubType: note.content[0].noteSubType,
          primaryText: note.content[0].primaryText,
          secondaryText: note.content[0].secondaryText,
          tertiaryText: note.content[0].tertiaryText,
          diagnosisText: note.content[0].diagnosisText,
          timestamp: new Date(),
          lock: note.content[0].lock,
          pendOrSigned: note.content[0].pendOrSigned,
        },
      ],
      isDeleteEnabled: note.isDeleteEnabled,
    };

    const createdTimestampIndex = finalNotes.createdTimestamp;

    const notes = new Notes.notes({ finalNotes });
    Patient.findOneAndUpdate(
      {
        CPMRN: CPMRN,
        encounters: encounters,
      },
      {
        $push: {
          "notes.finalNotes": notes.finalNotes,
        },
        $pull: {
          "notes.draftNotes": {
            refId: "new",
            authorId: note.content[0].authorId,
          },
        },
      },
      {
        new: true,
        projection: {
          notes: 1,
          CPMRN: 1,
          encounters: 1,
          hospitalID: 1,
          hospitalName: 1,
          unitName: 1,
        },
      }
    )
      .exec()
      .then(async (result) => {
        // TODO sockets - notes
        // audit logs
        res.locals.audit = {
          type: "Patient notes entered",
          params: {
            CPMRN,
            encounters,
          },
        };
        if (result) {
          SOCKET.getUpdatedPatientForSocket(
            CPMRN,
            encounters,
            req.userData.userId,
            result.hospitalID
          );

          const responseData = SOCKET.getNotesForSocketNew(
            CPMRN,
            encounters,
            result,
            createdTimestampIndex,
            (objectID = null),
            user,
            req.userData.userId,
            result.hospitalID
          ); // return need to added to the methods
          const { patNotes, ...signOutNotes } = noteStatus(result);

          const socketPatientData = {
            CPMRN,
            encounters,
            hospitalName: result.hospitalName,
            unitName: result.unitName,
            hospitalID: result.hospitalID,
            notes: signOutNotes,
            notesData: patNotes,
            _id: result._id,
          };

          // SOCKET.emitUpdatedPatientList(
          //   socketPatientData,
          //   req.userData.userId,
          //   socketPatientData.hospitalID
          // );

          // SOCKET_MOBILE.getHospitalList(req.userData, result.hospitalID);
          // SOCKET_MOBILE.getPatientsList(
          //   socketPatientData,
          //   req.userData.userId,
          //   result.hospitalID
          // );

          // SOCKET_MOBILE.getHospitalList(req.userData, result.hospitalID);
        }
        res.locals.cpdata = response(
          response.STATUS.SUCCESS,
          "Patient notes entered",
          responseData
        );

        next();
      })
      .catch((err) => {
        logger.error("Create Note error,", new Error(error));
        res.locals.cpdata = response(
          response.STATUS.ERROR,
          "Patient notes error",
          err
        );
        return next();
      });

    patientLastOpened({ CPMRN, encounters }, req.userData);
  } catch (e) {
    console.log(e.stack);
  }
};

exports.update_notes = async (req, res, next) => {
  try {
    const CPMRN = req.params.CPMRN;
    const encounters = req.params.encounters;
    const note = req.body;
    const user = req.userData;

    // audit logs
    res.locals.audit = {
      type: "Notes:updated",
      params: {
        CPMRN,
        encounters,
      },
    };

    const isClient = !isUserAlsoCommandCenter(req.userData);
    const objectID = req.params.OBJID;

    // adding authour data into note
    note["content"][0]["authorId"] = user.email;
    note["content"][0]["authorType"] = user.role;
    note["content"][0]["authorIsClient"] = isClient;
    note["content"][0]["author"] = getUserTitle(req.userData);

    note.content[0].addendum.forEach((addendum) => {
      addendum.timestamp = addendum.timestamp ? addendum.timestamp : new Date();
    });

    let finalNotes = {
      content: [
        {
          author: note.content[0].author,
          authorId: note.content[0].authorId,
          authorType: note.content[0].authorType,
          authorIsClient: note.content[0].authorIsClient,
          noteType: note.content[0].noteType,
          noteSubType: note.content[0].noteSubType,
          primaryText: note.content[0].primaryText,
          secondaryText: note.content[0].secondaryText,
          tertiaryText: note.content[0].tertiaryText,
          diagnosisText: note.content[0].diagnosisText,
          addendum: note.content[0].addendum,
          timestamp: new Date(),
          lock: note.content[0].lock,
          pendOrSigned: note.content[0].pendOrSigned,
        },
      ],
      isDeleteEnabled: note.isDeleteEnabled,
    };

    const updatesNotes = await Patient.findOneAndUpdate(
      {
        CPMRN,
        encounters,
        "notes.finalNotes": {
          $elemMatch: {
            _id: req.params.OBJID,
          },
        },
      },
      {
        $set: {
          "notes.finalNotes.$.isDeleteEnabled": finalNotes.isDeleteEnabled,
          "notes.finalNotes.$.lock": {},
        },
        $push: {
          "notes.finalNotes.$.content": finalNotes.content[0],
        },
        $pull: {
          "notes.draftNotes": {
            refId: req.params.OBJID,
            authorId: finalNotes.content[0].authorId,
          },
        },
      },
      {
        new: true,
        projection: {
          notes: 1,
          CPMRN: 1,
          encounters: 1,
          hospitalID: 1,
        },
      }
    ).lean();

    if (updatesNotes) {
      const responseData = SOCKET.getNotesForSocketNew(
        CPMRN,
        encounters,
        updatesNotes,
        (createdTimestampIndex = null),
        objectID,
        user,
        req.userData.userId,
        updatesNotes.hospitalID
      );
      // SOCKET.getTvForSocket(req.userData.userId, updatesNotes.hospitalID);

      const { patNotes, ...signOutNotes } = noteStatus(updatesNotes);
      const socketPatientData = {
        CPMRN,
        encounters,
        hospitalName: updatesNotes.hospitalName,
        unitName: updatesNotes.unitName,
        hospitalID: updatesNotes.hospitalID,
        notes: signOutNotes,
        notesData: patNotes,
        _id: updatesNotes._id,
      };

      // SOCKET.emitUpdatedPatientList(
      //   socketPatientData,
      //   req.userData.userId,
      //   socketPatientData.hospitalID
      // );

      // SOCKET_MOBILE.getHospitalList(req.userData, updatesNotes.hospitalID);
      // SOCKET_MOBILE.getPatientsList(
      //   socketPatientData,
      //   req.userData.userId,
      //   updatesNotes.hospitalID
      // );
    }
    res.locals.cpdata = response(
      success,
      "Patient notes updated",
      responseData
    );
    next();
  } catch (error) {
    logger.error("Update Note error,", new Error(error));
    res.locals.cpdata = response(
      response.STATUS.ERROR,
      "Patient note update error",
      err
    );
    return next();
  }
};

exports.delete_draftnote = async (req, res, next) => {
  try {
    let notes = req.body;
    notes["currentUser"] = req.userData;
    const CPMRN = notes.CPMRN;
    const encounters = notes.encounters;
    const refId = notes.refId;
    let deleteDraft;
    if (refId != "new") {
      deleteDraft = await Patient.findOneAndUpdate(
        {
          CPMRN: CPMRN,
          encounters: encounters,
          "notes.finalNotes._id": mongoose.Types.ObjectId(refId),
          "notes.draftNotes.refId": refId,
        },
        {
          $pull: {
            "notes.draftNotes": { refId, authorId: req.userData.email },
          },
          $set: { "notes.finalNotes.$.lock": {} },
        },
        {
          new: true,
          projection: {
            CPMRN: 1,
            encounters: 1,
            notes: 1,
            hospitalID: 1,
          },
        }
      ).lean();
    } else {
      deleteDraft = await Patient.findOneAndUpdate(
        {
          CPMRN: CPMRN,
          encounters: encounters,
        },
        {
          $pull: {
            "notes.draftNotes": { refId, authorId: req.userData.email },
          },
        },
        {
          new: true,
          projection: {
            CPMRN: 1,
            encounters: 1,
            notes: 1,
            hospitalID: 1,
          },
        }
      ).lean();
    }
    // audit logs
    res.locals.audit = {
      type: "Patient Draft Note Deleted",
      params: {
        CPMRN,
        encounters,
      },
    };

    if (deleteDraft) {
      const responseData = SOCKET.getNotesForSocketNewDraft(
        CPMRN,
        encounters,
        deleteDraft,
        refId,
        req.userData,
        req.userData.userId,
        deleteDraft.hospitalID
      );
      // SOCKET.getTvForSocket(req.userData.userId, updatesNotes.hospitalID);
      const { patNotes, ...signOutNotes } = noteStatus(deleteDraft);

      const socketPatientData = {
        CPMRN,
        encounters,
        hospitalName: deleteDraft.hospitalName,
        unitName: deleteDraft.unitName,
        hospitalID: deleteDraft.hospitalID,
        notes: signOutNotes,
        notesData: patNotes,
        _id: deleteDraft._id,
      };

      // SOCKET.emitUpdatedPatientList(
      //   socketPatientData,
      //   req.userData.userId,
      //   socketPatientData.hospitalID
      // );

      // SOCKET_MOBILE.getHospitalList(req.userData, deleteDraft.hospitalID);
      // SOCKET_MOBILE.getPatientsList(
      //   socketPatientData,
      //   req.userData.userId,
      //   deleteDraft.hospitalID
      // );
    }
    res.locals.cpdata = response(
      response.STATUS.SUCCESS,
      "Patient draft notes deleted",
      responseData
    );
    next();
  } catch (error) {
    logger.error("delete draft note error,", new Error(error));
    res.locals.cpdata = response(
      response.STATUS.ERROR,
      "Delete draft note error",
      error
    );
    return next();
  }
};

exports.update_code_sheet = (req, res, next) => {
  const CPMRN = req.params.CPMRN;
  const encounters = req.params.encounters;

  const auditType =
    req.body.codeSheetType === "sign" ? "code_blue:sign" : "code_blue:update";
  res.locals.audit = { type: auditType, params: { CPMRN, encounters } };

  if (req.body.objId) {
    Patient.findOneAndUpdate(
      {
        CPMRN,
        encounters,
        "notes.codeSheet._id": mongoose.Types.ObjectId(req.body.objId),
      },
      {
        $set: {
          "notes.codeSheet.$.information": req.body.information,
          "notes.codeSheet.$.result": req.body.result,
          "notes.codeSheet.$.data": req.body.data,
          "notes.codeSheet.$.codeSheetType": req.body.codeSheetType,
          "notes.codeSheet.$.isDeleteEnabled": req.body.isDeleteEnabled,
        },
      },
      {
        new: true,
        projection: {
          CPMRN: 1,
          encounters: 1,
          notes: {
            codeSheet: 1,
          },
          hospitalID: 1,
        },
      }
    )
      .exec()
      .then((result) => {
        const responseData = SOCKET.getCodeSheetForSocket(
          CPMRN,
          encounters,
          result,
          req.userData.userId,
          result.hospitalID
        );
        // SOCKET.draftNote(user);
        res.locals.cpdata = response(
          response.STATUS.SUCCESS,
          "Code sheet updated",
          responseData
        );
        return next();
      })
      .catch((err) => {
        logger.error("Update CodeSheet error,", new Error(error));
        res.locals.cpdata = response(
          response.STATUS.ERROR,
          "Code sheet error on update",
          err
        );
        next();
      });
  } else {
    Patient.findOneAndUpdate(
      {
        CPMRN: req.params.CPMRN,
        encounters: req.params.encounters,
      },
      {
        $push: {
          "notes.codeSheet": {
            $each: [req.body],
          },
        },
        $set: {
          "notes.codeSheetDraft": null,
        },
      },
      {
        new: true,
        projection: {
          CPMRN: 1,
          encounters: 1,
          notes: {
            codeSheet: 1,
          },
          hospitalID: 1,
        },
      }
    )
      .exec()
      .then((result) => {
        const responseData = SOCKET.getCodeSheetForSocket(
          CPMRN,
          encounters,
          result,
          req.userData.userId,
          result.hospitalID
        );
        res.locals.cpdata = response(
          response.STATUS.SUCCESS,
          "New Code sheet added",
          responseData
        );
        return next();
      })
      .catch((err) => {
        logger.error("Add CodeSheet error,", new Error(err));

        res.locals.cpdata = response(
          response.STATUS.ERROR,
          "New codesheet add error",
          err
        );
        next();
      });
  }

  // patientLastOpened({ CPMRN, encounters }, req.userData);
};

exports.codeSheet_draft = async (req, res, next) => {
  try {
    const CPMRN = req.params.CPMRN;
    const encounters = req.params.encounters;
    const codeSheet = req.body;
    const codeSheetDraft = await Patient.findOneAndUpdate(
      {
        CPMRN,
        encounters,
      },
      {
        $set: { "notes.codeSheetDraft": codeSheet },
      }
    ).lean();

    const auditType = "autosave-code_sheet";
    res.locals.audit = { type: auditType, params: { CPMRN, encounters } };
    res.locals.cpdata = response(
      response.STATUS.SUCCESS,
      "Codesheet draft successfully",
      codeSheet
    );

    next();
  } catch (error) {
    logger.error("CodeSheet draft error,", new Error(error));
    res.locals.cpdata = response(
      response.STATUS.ERROR,
      "Codesheet draft error",
      error
    );

    return next();
  }
};

exports.delete_codesheet = (req, res, next) => {
  const CPMRN = req.body.CPMRN;
  const encounters = req.body.encounters;
  const id = req.body.refID;

  res.locals.audit = {
    type: "codesheet:delete",
    params: { CPMRN, encounters },
  };

  if (id != "new") {
    Patient.findOneAndUpdate(
      { CPMRN, encounters },
      {
        $pull: { "notes.codeSheet": { _id: mongoose.Types.ObjectId(id) } },
      },
      {
        new: true,
      }
    )
      .then((result) => {
        const responseData = SOCKET.getCodeSheetForSocket(
          CPMRN,
          encounters,
          result,
          req.userData.userId,
          result.hospitalID
        );
        res.locals.cpdata = response(
          response.STATUS.SUCCESS,
          "Codesheet delete success",
          responseData
        );
        return next();
      })
      .catch((err) => {
        logger.error("CodeSheet delete error,", new Error(err));
        res.locals.cpdata = response(
          response.STATUS.ERROR,
          "Codesheet delete error",
          err
        );

        return next();
      });
  } else {
    Patient.findOneAndUpdate(
      {
        CPMRN: CPMRN,
        encounters: encounters,
      },
      {
        $set: {
          "notes.codeSheetDraft": null,
        },
      },
      {
        new: true,
      }
    )
      .then((result) => {
        const responseData = SOCKET.getCodeSheetForSocket(
          CPMRN,
          encounters,
          result,
          req.userData.userId,
          result.hospitalID
        );

        res.locals.cpdata = response(
          response.STATUS.SUCCESS,
          "Codesheet delete success",
          responseData
        );

        return next();
      })
      .catch((err) => {
        logger.error(JSON.stringify(err, Object.getOwnPropertyNames(err)));
        next({ status: 500, message: "Server Error" });
      });
  }
  // TODO notes socket
  // patientLastOpened({ CPMRN, encounters }, req.userData);
};

exports.delete_pended_notes = (req, res, next) => {
  const CPMRN = req.body.CPMRN;
  const encounters = req.body.encounters;
  const noteID = req.body.noteId;

  res.locals.audit = {
    type: "note:delete:pend",
    params: { CPMRN, encounters },
  };

  Patient.findOneAndUpdate(
    {
      CPMRN: CPMRN,
      encounters: encounters,
    },
    {
      $pull: {
        "notes.finalNotes": { _id: req.body.noteId },
      },
    },
    {
      new: true,
    }
  )
    .then(async (result) => {
      // TODO notes socket

      const responseData = SOCKET.getNotesForSocketOnDelete(
        CPMRN,
        encounters,
        noteID,
        req.userData.userId
      );
      const { patNotes, ...signOutNotes } = noteStatus(result);

      const socketPatientData = {
        CPMRN,
        encounters,
        hospitalName: result.hospitalName,
        unitName: result.unitName,
        hospitalID: result.hospitalID,
        notes: signOutNotes,
        notesData: patNotes,
        _id: result._id,
      };
      // SOCKET.emitUpdatedPatientList(
      //   socketPatientData,
      //   req.userData.userId,
      //   socketPatientData.hospitalID
      // );

      // SOCKET_MOBILE.getHospitalList(req.userData, result.hospitalID);
      // SOCKET_MOBILE.getPatientsList(
      //   socketPatientData,
      //   req.userData.userId,
      //   result.hospitalID
      // );

      // SOCKET.getUpdatedPatientForSocket(CPMRN, encounters, req.userData.userId);
      // //Socket for Mobile
      // SOCKET_MOBILE.getHospitalList(req.userData);
      res.locals.cpdata = response(
        response.STATUS.SUCCESS,
        "Pended note deleted",
        responseData
      );

      return next();
    })
    .catch((err) => {
      logger.error("Delete pended note error,", new Error(err));
      res.locals.cpdata = response(
        response.STATUS.ERROR,
        "Pended note Delete error",
        err
      );

      next();
    });

  // patientLastOpened({ CPMRN, encounters }, req.userData);
};

exports.get_prepopulate = async (req, res) => {
  try {
    const CPMRN = req.params.CPMRN;
    const encounters = parseInt(req.params.encounters);
    const notesType = req.body;

    const roundar = await Notebook.findOne({ CPMRN, encounters });

    const airaNote = await Patient.aggregate([
      {
        $match: { CPMRN, encounters },
      },
      {
        $set: {
          lastElmDate: {
            $arrayElemAt: ["$notes.finalNotes.createdTimestamp", -1],
          },
        },
      },
      {
        $project: {
          name: 1,
          age: 1,
          sex: 1,
          chronic: 1,
          immune: 1,
          CPMRN: 1,
          hospitalName: 1,
          ICUAdmitDate: 1,
          isNIV: 1,
          isIntubated: 1,
          isTrach: 1,
          operativeStatus: 1,
          orders: 1,
          documents: 1,
          // days: 1,
          vitals: 1,
          io: 1,
          pressors: 1,
          "notes.finalNotes": {
            $filter: {
              input: "$notes.finalNotes",
              as: "n",
              cond: {
                $gte: ["$$n.createdTimestamp", "$lastElmDate" - 2],
              },
            },
          },
        },
      },
      { $set: { lastElmDate: "$$REMOVE" } },
    ]);

    const patient = { ...airaNote[0], roundar, notesType };

    const lambda = new aws.Lambda({
      accessKeyId: process.env.s3_access_key,
      secretAccessKey: process.env.s3_secret_key,
    });
    let data = {
      data: patient,
    };

    let lambdaFunctionName = process.env.AIRA_LAMBDA;

    let pullParams = {
      FunctionName: lambdaFunctionName,
      InvocationType: "RequestResponse",
      LogType: "None",
      Payload: JSON.stringify(data),
    };
    lambda.invoke(pullParams, function (err, data) {
      if (err) {
        logger.info(err);
        res
          .status(500)
          .json(
            response(response.STATUS.SUCCESS, "aira data not fetched", err)
          );
      } else {
        res
          .status(200)
          .json(
            response(response.STATUS.SUCCESS, "aira data fetched", data.Payload)
          );
      }
    });
  } catch (error) {
    logger.error("Aira error", new Error(error));
    return res
      .status(400)
      .json(response(response.STATUS.ERROR, "aira data not fetched", error));
  }
  // patientLastOpened({ CPMRN, encounters }, req.userData);
};

exports.autosave_note = async (req, res, next) => {
  try {
    const CPMRN = req.params.CPMRN;
    const encounters = req.params.encounters;
    const isClient = !isUserAlsoCommandCenter(req.userData);
    let note = req.body;
    const user = req.userData;
    note["authorId"] = user.email;
    note["authorType"] = user.role;
    note["authorIsClient"] = isClient;
    note["author"] = getUserTitle(req.userData);

    let draftNotes = {
      refId: note.refId,
      author: note.author,
      authorId: note.authorId,
      noteType: note.noteType,
      noteSubType: note.noteSubType,
      authorType: note.authorType,
      authorIsClient: note.authorIsClient,
      primaryText: note.primaryText,
      secondaryText: note.secondaryText,
      tertiaryText: note.tertiaryText,
      diagnosisText: note.diagnosisText,
      timestamp: new Date(),
      addendum: note.addendum,
      isAddendum: note.isAddendum,
      lock: note.lock ? note.lock : {},
    };

    const draftNote = await Patient.findOneAndUpdate(
      {
        CPMRN,
        encounters,
      },

      [
        {
          $set: {
            "notes.draftNotes": { $ifNull: ["$notes.draftNotes", []] },
            "notes.finalNotes": { $ifNull: ["$notes.finalNotes", []] },
          },
        },
        {
          $set: {
            matches: {
              $filter: {
                input: "$notes.draftNotes",
                as: "n",
                cond: {
                  $and: [
                    { $eq: [draftNotes.refId, "$$n.refId"] },
                    { $eq: [draftNotes.authorId, "$$n.authorId"] },
                  ],
                },
              },
            },
          },
        },
        {
          $set: {
            "notes.draftNotes": {
              $cond: [
                { $eq: [{ $size: "$matches" }, 0] },
                { $concatArrays: ["$notes.draftNotes", [draftNotes]] },
                {
                  $concatArrays: [
                    {
                      $filter: {
                        input: "$notes.draftNotes",
                        as: "n",
                        cond: { $ne: [draftNotes.refId, "$$n.refId"] },
                      },
                    },
                    [draftNotes],
                  ],
                },
              ],
            },
            "notes.finalNotes": {
              $map: {
                input: "$notes.finalNotes",
                as: "n",
                in: {
                  $cond: [
                    {
                      $eq: [{ $toString: "$$n._id" }, draftNotes.refId],
                    },
                    { $mergeObjects: ["$$n", { lock: draftNotes.lock }] },
                    "$$n",
                  ],
                },
              },
            },
            matches: "$$REMOVE",
          },
        },
      ],
      {
        new: true,
        projection: {
          CPMRN: 1,
          encounters: 1,
          notes: 1,
          hospitalName: 1,
          unitName: 1,
          hospitalID: 1,
        },
      }
    ).lean();

    res.locals.audit = {
      type: "note:draftSaved",
      params: { CPMRN, encounters },
    };
    if (draftNote) {
      const responseData = SOCKET.getNotesForSocketNewDraft(
        CPMRN,
        encounters,
        draftNote,
        draftNotes.refId,
        user,
        req.userData.userId
      );
      const { patNotes, ...signOutNotes } = noteStatus(draftNote);

      const socketPatientData = {
        CPMRN,
        encounters,
        hospitalName: draftNote.hospitalName,
        unitName: draftNote.unitName,
        hospitalID: draftNote.hospitalID,
        notes: signOutNotes,
        notesData: patNotes,
        _id: draftNote._id,
      };

      // SOCKET.emitUpdatedPatientList(
      //   socketPatientData,
      //   req.userData.userId,
      //   socketPatientData.hospitalID
      // );

      // SOCKET_MOBILE.getHospitalList(req.userData, draftNote.hospitalID);
      // SOCKET_MOBILE.getPatientsList(
      //   socketPatientData,
      //   req.userData.userId,
      //   draftNote.hospitalID
      // );
    }
    res.locals.cpdata = response(
      response.STATUS.SUCCESS,
      "Patient Note draft Updated",
      responseData
    );
    next();
  } catch (error) {
    logger.error("Update Draftnote error,", new Error(error));
    res.locals.cpdata = response(
      response.STATUS.ERROR,
      "Patient note draft update error",
      error
    );
    return next();
  }
};

const noteStatus = (result) => {
  // for create
  let isPended = false;
  let patNotes;
  let isDraft = { users: [] };
  result.notes.finalNotes.filter((note) => {
    if (note) {
      const content = note.content.reduce((first, second) =>
        new Date(first.timestamp) > new Date(second.timestamp) ? first : second
      );
      if (content.pendOrSigned === "pended") {
        isPended = true;
      }
      if (
        (content.noteType === "Progress" || content.noteType === "Admission") &&
        content.pendOrSigned === "signed"
      ) {
        patNotes = content;
      }
    }
  });
  if (result.notes && result.notes.draftNotes)
    isDraft["status"] = result.notes.draftNotes.length ? true : false;
  if (isDraft && result.notes.draftNotes) {
    result.notes.draftNotes.forEach((note) => {
      isDraft["users"].push(note.authorId);
    });
  }
  return {
    isPended,
    isDraft,
    patNotes,
  };
};
