const Mongoose  = require("mongoose");

const ContactSchema = Mongoose.Schema({
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
    subject:{
        type: String,
    },
    message:{
        type: String,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },

});

module.exports = Mongoose.model('contact',ContactSchema);