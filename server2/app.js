const express = require("express");
const morgan = require("morgan");

const app = express();
app.use(morgan("dev"));
app.get("/api/v2", function (req, res) {
  console.log(`x-user-email: ${req.header("x-user-email")}`);
  console.log(`x-jwt-payload: ${req.header("x-jwt-payload")}`);
  res.send("GET request to the homepage");
});
app.get("/health", (req, res) => {
  res.status(200).send();
});

// Start the server
app.listen(4001, function () {
  console.log("Express server listening on port " + 4001);
});
