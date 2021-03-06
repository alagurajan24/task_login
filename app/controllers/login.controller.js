const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require("../models");
const multer = require('multer');
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
const CryptoJS = require("crypto-js");
const { validationResult } = require('express-validator');
const Customer = db.customer;
var status = 'failed';
var message = '';
var data = [];

exports.login = (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).send({
            status: status,
            message: 'Something went wrong',
            data: errors
        });
    }
    // check already exist
    Customer.findOne({ email: req.body.email }, function (err, customer) {
        if (err) return res.status(500).send({
            status: status,
            message: 'Something went wrong',
            data: data
        });
        if (!customer) return res.status(404).send({
            status: status,
            message: 'No customer found, Please register',
            data: data
        });

        var passwordIsValid = bcrypt.compareSync(req.body.password, customer.password);
        if (!passwordIsValid) return res.status(401).send({
            status: status,
            message: 'Invalid email or password',
            data: data
        });
        var token = jwt.sign({ id: customer._id }, 'admin', {
            expiresIn: 86400 // expires in 24 hours
        });

        res.status(200).send({
            status: 'success',
            message: 'Login successfully',
            data: {
                token: token
            }
        });
    });
};

exports.register = (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).send({
            status: status,
            message: 'Something went wrong',
            data: errors
        });
    }
    Customer.findOne({ email: req.body.email }, function (err, customer) {
        data: data
        if (err) return res.status(500).send({
            status: status,
            message: 'Something went wrong',
        });
        if (customer) return res.status(500).send({
            status: status,
            message: 'Customer email already exist',
            data: data
        });
        Customer.findOne({ mobileno: req.body.mobileno }, function (err, customer) {
            if (err) return res.status(500).send({
                status: status,
                message: 'Something went wrong',
                data: data
            });
            if (customer) return res.status(500).send({
                status: status,
                message: 'Customer mobile number already exist',
                data: data
            });

            var hashedPassword = bcrypt.hashSync(req.body.password, 8);

            Customer.create({
                name: req.body.name,
                mobileno: req.body.mobileno,
                email: req.body.email,
                password: hashedPassword
            },
                function (err, user) {
                    if (err) return res.status(500).send({
                        status: status,
                        message: 'Something went wrong',
                        data: data
                    })
                    // create a token
                    var token = jwt.sign({ id: user._id }, 'admin', {
                        expiresIn: 86400 // expires in 24 hours
                    });

                    //mail sent
                    const transporter = nodemailer.createTransport({
                        host: process.env.MAIL_HOST,
                        port: process.env.MAIL_PORT,
                        auth: {
                            user: process.env.MAIL_SENDER,
                            pass: process.env.MAIL_PASSWORD
                        }
                    });

                    // send email
                    var hashData = encrypt([{ name: req.body.name, email: req.body.email }]);

                    function encrypt(data) {
                        var ciphertextreplace = CryptoJS.AES.encrypt(JSON.stringify(data), 'secret key 123').toString();
                        console.log(ciphertextreplace, 'txt!!!!!')
                        var ciphertext = ciphertextreplace.replaceAll("/", "$");

                        return ciphertext;
                    }

                    // const url = 'http://localhost:8080/api/customers?name=' + hashname + '&email=' + hashemail;
                    const url = 'http://localhost:8080/api/customers/' + hashData;
                    console.log(url, 'urlll')

                    var mailOptions = {
                        from: process.env.MAIL_SENDER,
                        to: req.body.email,
                        subject: 'Test Email Subject',
                        html: 'please click this email confirmation link: ' + url
                    };

                    transporter.sendMail(mailOptions, function (error, info) {
                        if (error) {
                            console.log(error);
                        } else {
                            console.log('Email sent: ' + info.response);
                        }
                    });

                    res.status(200).send({
                        status: 'success',
                        message: 'Register successfully',
                        data: {
                            token: token,
                            customer: user
                        }
                    });
                });
        });
    });
};

exports.update = (req, res) => {
    const id = req.params.id;

    var hashedPassword = bcrypt.hashSync(req.body.password, 8);

    Customer.findOne({ email: req.body.email, _id: { $ne: id } }, function (err, customers) {
        if (err) return res.status(500).send({
            status: status,
            message: 'Something went wrong',
            data: data
        });
        if (customers) return res.status(500).send({
            status: status,
            message: 'Customer email already exist',
            data: data
        });

        Customer.findOne({ mobileno: req.body.mobileno, _id: { $ne: id } }, function (err, customer) {
            if (err) return res.status(500).send({
                status: status,
                message: 'Something went wrong',
                data: data
            });
            if (customer) return res.status(500).send({
                status: status,
                message: 'Customer mobile number already exist',
                data: data
            });

            var body = {
                name: req.body.name,
                mobileno: req.body.mobileno,
                email: req.body.email,
                password: hashedPassword,
                age: req.body.age,
                height: req.body.height,
                weight: req.body.weight,
                martialstatus: req.body.martialstatus
            };

            Customer.findByIdAndUpdate(id, body, { useFindAndModify: false })
                .then(customer => {
                    if (!customer) {
                        res.status(404).send({
                            status: status,
                            message: 'Maybe customer was not found',
                            data: data
                        });
                    } else {
                        status = "success";
                        res.send({
                            status: status,
                            message: 'Customer updated successfully',
                            data: customer
                        });
                    }
                })
        });
    });
}

exports.customerList = (req, res) => {

    let ciphertext = req.params.data;

    //string replace
    var ciphertextrplce = ciphertext.replaceAll('$', '/');

    var decrypted = CryptoJS.AES.decrypt(ciphertextrplce, 'secret key 123').toString(CryptoJS.enc.Utf8);
    var decryptObj = JSON.parse(decrypted);

    res.send({
        status: 'success',
        message: 'customer listed successfully',
        data: decryptObj
    });
};

exports.import = (req, res) => {
    var upload = multer({ storage: storage }).single("profile_image");
    upload(req, res, (err) => {
        if (err) {
            res.status(400).send("Something went wrong!");
        }
        res.send(req.file);
    });
};

var path = "C:/Node/task_login/uploads/"
global.__basedir = __dirname;
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path);
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});



