const express = require("express");
const morgan = require("morgan");
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");
const fs = require("fs");

// const token = jwt.sign({ email: "nurse@cp.net" }, "secret", {
//   algorithm: "RS256",
//   expiresIn: "14d",
//   issuer: "cp:issuer",
// });

const app = express();
app.use(express.static("public"));

app.use(
  bodyParser.urlencoded({
    extended: false,
  })
);

app.use(bodyParser.json());

app.use(morgan("dev"));
app.get("/api/v1", function (req, res) {
  const secret = fs.readFileSync("./certs/private.pem");
  const token = jwt.sign({ email: "nurse@cp.net" }, secret, {
    // algorithm: "HS256",
    algorithm: "RS256",
    expiresIn: "14d",
    // issuer: "cloudphyisican.com",
    header: { kid: "789" },
    // audience: "cp:audience",
  });

  res.send(`GET request to the homepage ${token}`);
});

const jwksClient = require("jwks-rsa");

const client = jwksClient({
  jwksUri: "http://localhost:4000/.well-known/jwks.json",
  cache: true,
  rateLimit: true,
  // requestHeaders: {}, // Optional
  // timeout: 30000, // Defaults to 30s
});

app.post("/api/v1/verify", function (req, res) {
  const token = req.headers.authorization.split(" ")[1];
  const getPublicKey = (header, callback) => {
    console.log({ header });
    client.getSigningKey(header.kid, (err, key) => {
      const signingKey = fs.readFileSync("./certs/public.pem");
      callback(null, signingKey);
    });
  };
  jwt.verify(token, getPublicKey, {}, function (err, decoded) {
    if (err) {
      return res.send(`error ${err}`);
    }
    console.log(err);
    console.log(decoded);
    return res.send(`GET request to the homepage ${decoded["email"]}`);
  });
});

app.get("/health", (req, res) => {
  res.status(200).send();
});

// Start the server
app.listen(4000, function () {
  console.log("Express server listening on port " + 4000);
});
