const fs = require("fs");
const rsaPemToJwk = require("rsa-pem-to-jwk");
const pem = fs.readFileSync("./certs/private.pem");
const jwk = rsaPemToJwk(pem, { use: "sig" }, "public");

console.log(jwk);
