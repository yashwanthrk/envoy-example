const express = require("express");
const cors = require("cors");

const app = express();
const config = require("./config");

const morgan = require("morgan");
const bodyParser = require("body-parser");
const helmet = require("helmet");
const compression = require("compression");

const useragent = require("express-useragent");
const { createNamespace } = require("cls-hooked");
const contextPassing = createNamespace("context-passing");
const mongoInstance = require("./mongo");
const {
  ignorePublicRoutes,
  validateAccessToken,
} = require("./auth/auth.middleware");

// const authRoutes = require("./routes/auth");

const { logger } = require("./logger");

async function main() {
  await mongoInstance.init();
    require("./redis");


  morgan.token("ip", (req, res) => {
    return (
      (req.headers["x-forwarded-for"] || "").split(",").pop().trim() ||
      req.socket.remoteAddress ||
      req.ip ||
      null
    );
  });
  morgan.token("host", function (req, res) {
    return req.hostname;
  });
  morgan.token("device", (req, res) => {
    return req.useragent && req.useragent.isMobile ? "MOBILE" : "WEB";
  });
  morgan.token("user", (req, res) => {
    return req.userData && req.userData.email ? req.userData.email : null;
  });


 const notesRoutes = require("./api/routes/notes");
 app.use(/notes, notesRoutes);
  app.use(
    morgan(
      ":ip :device :method :host :url HTTP(S)/:http-version :status :response-time :user",
      { stream: { write: (message) => logger.info(message.trim()) } }
    )
  );



  app.use(
    express.urlencoded({
      extended: false,
    })
  );
  app.use(
    compression({
      level: 6,
    })
  );
  app.use(express.json());
  app.use(useragent.express());

  app.use(cors());
  app.use(helmet());

  app.use((req, res, next) => {
    if (!req.route) {
      return res.json({
        status: 404,
        message: `Route url ${req.originalUrl} with method ${req.method} not found`,
      });
    }
  });
}

main();

app.get("/healthcheck", (req, res) => {
  res.status(200).send();
});

module.exports = app;
