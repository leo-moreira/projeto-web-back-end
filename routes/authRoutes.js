const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { checkLogin } = require("../middlewares/authMiddleware");

router.get("/login", authController.getLoginPage);

router.post("/login", authController.postLogin);

router.get("/dashboard", checkLogin, authController.getDashboardPage);

router.get("/logout", authController.getLogout);

router.get("/", (req, res) => {
  if (req.session.logado) {
    res.redirect("/dashboard");
  } else {
    res.redirect("/login");
  }
});

module.exports = router;
