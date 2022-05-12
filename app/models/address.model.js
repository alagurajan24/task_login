const { Schema } = require("mongoose");

module.exports = mongoose => {
    var schema = mongoose.Schema(
        {
            customerId: { type: Schema.Types.ObjectId, ref: "customer" },
            name: String,
            mobileno: String,
            address: String,
            city: String,
            state: String,
            pincode: String,
            landmark: String,
            addressType: String,
            status: { type: Number, default: 1 }
        },
        { timestamps: true }
    );
    schema.method("toJSON", function () {
        const { __v, _id, ...object } = this.toObject();
        object.id = _id;
        return object;
    });

    const User = mongoose.model("address", schema);
    return User;
};
