const { nanoid } = require("nanoid");

/**
 * Replaced uuid with nanoid.
 *
 * @return {string} - generated uuid;
 */
export function generateUUIDV4() {
  try {
    return nanoid(21);
  } catch (e) {
    throw new Error(e);
  }
}

/**
 * Generates a unique id
 *
 * @param {number} length - size of the generate unique id
 * @return {String}
 */
export function generateUniqueId(length = 21) {
  return nanoid(length);
}

export function response(status, message = null, data = null, obj = {}) {
  if (status !== "error" && status !== "warning" && status !== "success") {
    status = "error";
  }

  return { status, message, data, ...obj };
}

response.STATUS = Object.freeze({
  ERROR: "error",
  WARNING: "warning",
  SUCCESS: "success",
});

export function getCloudPhysicianDeviceInfo(req) {
  try {
    return req.useragent && req.useragent.isMobile ? "MOBILE" : "WEB";
  } catch (e) {
    return null;
  }
}

/**
 * Returns user's ip address
 *
 * @param {Request} req - request object of express
 * @returns {string|null}
 */
export function getUserIpAddress(req) {
  try {
    return (
      (req.headers["x-forwarded-for"] || "").split(",").pop().trim() ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress ||
      req.connection.socket.remoteAddress ||
      null
    );
  } catch (e) {
    return null;
  }
}
