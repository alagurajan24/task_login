const { address } = require("../models");
const db = require("../models");
const Address = db.address;
var status = 'failed';
var message = '';
var data = [];

exports.create = (req, res) => {
    Address.findOne({ mobileno: req.body.mobileno }, function (err, address) {
        if (err) return res.status(500).send({
            status: status,
            message: 'Something went wrong',
            data: data
        });
        if (address) return res.status(500).send({
            status: status,
            message: 'Address already placed',
            data: data
        });

        Address.create({
            customerId: req.customerId,
            name: req.body.name,
            mobileno: req.body.mobileno,
            address: req.body.address,
            city: req.body.city,
            state: req.body.state,
            pincode: req.body.pincode,
            landmark: req.body.landmark,
            addressType: req.body.addressType
        },
            function (err, user) {
                if (err) return res.status(500).send({
                    status: status,
                    message: 'Something went wrong',
                    data: data
                })

                res.status(200).send({
                    status: 'success',
                    message: 'Address Created successfully',
                    data: user
                });
            });
    });
};

exports.update = (req, res) => {
    const id = req.params.id;

    Address.findOne({ mobileno: req.body.mobileno, _id: { $ne: id } }, function (err, address) {
        if (err) return res.status(500).send({
            status: status,
            message: 'Something went wrong',
            data: data
        });
        if (address) return res.status(500).send({
            status: status,
            message: 'Address mobile number already exist',
            data: data
        });

        var body = {
            customerId: req.customerId,
            name: req.body.name,
            mobileno: req.body.mobileno,
            address: req.body.address,
            city: req.body.city,
            state: req.body.state,
            pincode: req.body.pincode,
            landmark: req.body.landmark,
            addressType: req.body.addressType
        };

        Address.findByIdAndUpdate(id, body, { useFindAndModify: false })
            .then(address => {
                if (!address) {
                    res.status(404).send({
                        status: status,
                        message: 'Maybe addres was not found',
                        data: data
                    });
                } else {
                    status = "success";
                    res.send({
                        status: status,
                        message: 'Address updated successfully',
                        data: address
                    });
                }
            })
    });

}

exports.delete = (req, res) => {

    var newvalues = { $set: { status: 2 } };
    Address.updateOne({ _id: req.body.id }, newvalues, function (err, addres) {
        if (err) return res.status(500).send({
            status: status,
            message: 'Something went wrong',
            data: data
        });
        status = "success";
        res.send({
            status: status,
            message: 'Address deleted successfully',
            data: data
        });
    });
}

exports.list = async (req, res) => {
    // for sorting
    var sortKey = (req.query.sortKey != undefined) ? req.query.sortKey : '_id';
    var sortType = (req.query.sortType == 'ASC') ? 1 : -1;
    const sort = {}
    sort[sortKey] = sortType
    // for searching
    var searchString = req.query.search;
    // for limit and offset
    var limit = parseInt(req.query.limit);
    var skip = parseInt(req.query.skip);
    // for searching
    var search = req.query.search;

    // var sk = (search != undefined && search != '') ? { $text: { $search: search } } : trim(' ');
    // console.log(sk, 'jhbhbh');

    // Address.find(sk).limit(limit).skip(skip).sort(sort).exec((err, docs) => {
    //     res.send(docs)
    // });
    console.log(search, 'search')
    if (search != undefined && search != '') {
        Address.find({ $text: { $search: search } }).limit(limit).skip(skip).sort(sort).exec((err, docs) => {
            res.send({
                status: 'success',
                message: 'Address listed successfully',
                data: docs
            });
        });
    } else {
        // Address.find().limit(limit).skip(skip).sort(sort).exec((err, docs) => {
        Address.find().exec((err, docs) => {
            console.log(docs, 'docs')
            res.send({
                status: 'success',
                message: 'Address listed successfully',
                data: docs
            });
        });
    }

}

exports.getByaddress = (req, res) => {

    const id = req.params.id;

    Address.findById({ _id: id }, function (err, address) {
        if (err) return res.status(500).send({
            status: status,
            message: 'Something went wrong',
            data: data
        });

        Address.findById({ _id: id }).exec((err, address) => {
            res.send({
                status: 'success',
                message: 'Address listed successfully',
                data: address
            });
        });

    });
}