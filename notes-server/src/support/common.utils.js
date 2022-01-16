/**
 * Function to check if user hospitals contains a command center hospital
 * @param {Object} userInfo - Redis user data (token info) (req.userData)
 * @returns Boolean
 */
const isUserAlsoCommandCenter = (userInfo) => {
  // check if isCommandCenter = true flag exists in hospital collection
  // isCommandCenter flag exist and is true only for hospital which is also a Command Center. Ex- Cloudphysician
  for (let currentHospital of userInfo.hospitals) {
    if (currentHospital[["isCommandCenter"]]) {
      return true;
    }
  }
  return false;
};

const getUserTitle = (currentUser) => {
  let author = "";
  if (currentUser.title) {
    author += currentUser.title + " ";
  }
  author += currentUser.name;
  if (currentUser.qualification) {
    author += " " + currentUser.qualification;
  }
  return author;
};

const createNotifyMessageKey = (patientData) => {
  return (
    patientData.hospitalName +
    " - " +
    patientData.unitName +
    (patientData.bedNo ? ", " + patientData.bedNo : "")
  );
};

module.exports = {
  isUserAlsoCommandCenter,
  getUserTitle,
  createNotifyMessageKey,
};
