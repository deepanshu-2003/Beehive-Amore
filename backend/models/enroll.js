const Mongoose  = require("mongoose");

const EnrollSchema = Mongoose.Schema({
    name:{
        type: String,
        // require: true,
        // unique:true
    },
    mobile:{
        type: String,
        // unique: true,
    },
    email:{
        type: String,
        // unique: true,
    },
    course:{
        type: String,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },

});

module.exports = Mongoose.model('enroll',EnrollSchema);