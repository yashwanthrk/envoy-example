const config = {
  env: process.env.env,
  port: process.env.PORT,
  debug: process.env.DEBUG,
  android: process.env.android,
  ios: process.env.ios,
  jwtKey: process.env.JWTKEY,
  recaptcha: process.env.recaptcha,
  recaptchaSecretKey: process.env.recaptchaSecretKey,
};

module.exports = config;
