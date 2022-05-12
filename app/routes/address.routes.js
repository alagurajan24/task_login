module.exports = app => {
    const address = require("../controllers/address.controller.js");
    const VerifyToken = require("../middleware/VerifyToken.js");

    var router = require("express").Router();
  
    router.post("/create",VerifyToken, address.create);
    router.post("/delete",VerifyToken, address.delete);
    router.put("/update/:id",VerifyToken, address.update);
    router.get("/list",VerifyToken, address.list);
    router.get("/getByaddress/:id",VerifyToken, address.getByaddress);
  
    app.use('/api/address/', router);
  };