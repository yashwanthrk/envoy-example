const router = require("express").Router();
// const v1Routes = require("./v1");
const notesRoutes = require("./notes.route");
// router.use("/v1", v1Routes);
router.use("/notes", notesRoutes);
module.exports = router;
