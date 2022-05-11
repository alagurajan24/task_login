module.exports = mongoose => {
    var schema = mongoose.Schema(
        {
            name: String,
            email: String,
            password: String,
            mobileno: String,
            age: Number,
            height: String,
            weight: String,
            martialstatus: String,
            status: { type: Number, default: 1 }
        },
        { timestamps: true }
    );
    schema.method("toJSON", function () {
        const { __v, _id, ...object } = this.toObject();
        object.id = _id;
        return object;
    });

    const User = mongoose.model("customer", schema);
    return User;
};