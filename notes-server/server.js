/*

 RRRRRRRRRRRRRRRRR                  AAA               DDDDDDDDDDDDD                  AAA               RRRRRRRRRRRRRRRRR
 R::::::::::::::::R                A:::A              D::::::::::::DDD              A:::A              R::::::::::::::::R
 R::::::RRRRRR:::::R              A:::::A             D:::::::::::::::DD           A:::::A             R::::::RRRRRR:::::R
 RR:::::R     R:::::R            A:::::::A            DDD:::::DDDDD:::::D         A:::::::A            RR:::::R     R:::::R
 R::::R     R:::::R             A:::::::::A             D:::::D    D:::::D       A:::::::::A             R::::R     R:::::R
 R::::R     R:::::R            A:::::A:::::A            D:::::D     D:::::D     A:::::A:::::A            R::::R     R:::::R
 R::::RRRRRR:::::R            A:::::A A:::::A           D:::::D     D:::::D    A:::::A A:::::A           R::::RRRRRR:::::R
 R:::::::::::::RR            A:::::A   A:::::A          D:::::D     D:::::D   A:::::A   A:::::A          R:::::::::::::RR
 R::::RRRRRR:::::R          A:::::A     A:::::A         D:::::D     D:::::D  A:::::A     A:::::A         R::::RRRRRR:::::R
 R::::R     R:::::R        A:::::AAAAAAAAA:::::A        D:::::D     D:::::D A:::::AAAAAAAAA:::::A        R::::R     R:::::R
 R::::R     R:::::R       A:::::::::::::::::::::A       D:::::D     D:::::DA:::::::::::::::::::::A       R::::R     R:::::R
 R::::R     R:::::R      A:::::AAAAAAAAAAAAA:::::A      D:::::D    D:::::DA:::::AAAAAAAAAAAAA:::::A      R::::R     R:::::R
 RR:::::R     R:::::R   A:::::A             A:::::A   DDD:::::DDDDD:::::DA:::::A             A:::::A   RR:::::R     R:::::R
 R::::::R     R:::::R  A:::::A               A:::::A  D:::::::::::::::DDA:::::A               A:::::A  R::::::R     R:::::R
 R::::::R     R:::::R A:::::A                 A:::::A D::::::::::::DDD A:::::A                 A:::::A R::::::R     R:::::R
 RRRRRRRR     RRRRRRRAAAAAAA                   AAAAAAADDDDDDDDDDDDD   AAAAAAA                   AAAAAAARRRRRRRR     RRRRRRR

 */

require("dotenv").config(); // for local without docker
require("events").EventEmitter.prototype._maxListeners = 100;

const { serverConfig } = require("./src/config");

const http = require("http");

const app = require("./src/app");

const port = serverConfig.port || 443;

let server = null;
if (serverConfig.env === "local") {
  server = http.createServer(app);
  server.listen(port);
} else {
  console.log("EMR running in prod");
  const https = require("https");
  const fs = require("fs");
  let key = fs.readFileSync("server.key");
  let cert = fs.readFileSync("server.cert");
  const options = {
    key: key,
    cert: cert,
  };
  server = https.createServer(options, app);
  server.listen(port);
  console.log(`EMR started listening on port ${port}`);
}

exports = module.exports = server;
