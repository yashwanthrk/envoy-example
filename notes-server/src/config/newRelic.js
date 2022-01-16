const config = {
    enabled: process.env.NEW_RELIC_ENABLED,
    appName: process.env.NEW_RELIC_APP_NAME,
    licenseKey: process.env.NEW_RELIC_LICENSE_KEY,
};

module.exports = config;
