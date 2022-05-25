module.exports = app => {
  const auth = require("../controllers/login.controller.js");
  const VerifyToken = require("../middleware/VerifyToken.js");

  var router = require("express").Router();

  const { check } = require('express-validator');

  router.post("/login", [
    check('email', 'Enter valid email').isEmail(),
    check('password', 'Password length should be 6').isLength({ min: 6 })
  ], auth.login);
  router.post("/register", [
    check('email', 'Enter valid email').isEmail(),
    check('password', 'Password length should be minimum 6').isLength({ min: 6 }),
    check('name', 'Name length should be minimum 3').isLength({ min: 3 }),
  ], auth.register);

  router.put("/update/:id", VerifyToken, auth.update);

  router.post("/imageUpload", VerifyToken, auth.import);

  router.get("/customers/:data", auth.customerList);

  app.use('/api/', router);
};