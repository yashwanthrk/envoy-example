const { body } = require("express-validator");

const validFileSize = 20971520;
const validFileMime = ["image/jpeg", "image/png", "application/pdf"];

export const documentFileValidation = [
  body("files").custom((files) => {
    for (let file of files) {
      if (file.size > validFileSize) {
        return Promise.reject(file.name + " - File size is larger than 20MB");
      }

      if (!jsvalidator.isIn(file.type, validFileMime)) {
        return Promise.reject(file.name + " - Invalid file type");
      }
    }

    return Promise.resolve();
  }),
];
