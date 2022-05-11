var jwt = require('jsonwebtoken');
var status = 'failed';
var message = '';
var data = [];
const db = require("../models");
const Customer = db.customer;

// var config = require('../config');

function verifyToken(req, res, next) {

  var headerToken = req.headers['authorization'];  
  if (!headerToken)
    return res.status(403).send({ status: status, message: 'No token provided.', data: data });

  var tokenArray = headerToken.split(" ");
  var token = (tokenArray.length > 0) ? tokenArray[1] : '';

  if (!token)
    return res.status(403).send({ status: status, message: 'No token provided.', data: data });
    
  jwt.verify(token, 'admin', function(err, decoded) {
    if (err)
    return res.status(500).send({ status: status, message: 'Failed to authenticate token.', data: data });
    Customer.findOne({ _id: decoded.id }, function (err, customer) {
        if (err) return res.status(500).send({
            status: status,
            message: 'Something went wrong',
            data: data
        });
        if (customer && customer.status == 1){
            req.customerId = decoded.id;
            next();
        } else {
            return res.status(403).send({
                status: status,
                message: 'Unauthorized',
                data: data
            });
        }
    });

    
  });
}

module.exports = verifyToken;