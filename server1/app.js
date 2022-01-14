const express = require("express");
const morgan = require("morgan");

const app = express();
app.use(morgan("dev"));
app.get("/api/v1", function (req, res) {
  res.send("GET request to the homepage");
});
app.get("/health", (req, res) => {
    res.status(200).send();
  });
  
// Start the server
app.listen(4000, function () {
  console.log("Express server listening on port " + 4000);
});
