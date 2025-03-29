const Mongoose = require("mongoose");

const MessageSchema = Mongoose.Schema({
    conversation: {
        type: Mongoose.Schema.Types.ObjectId,
        ref: 'conversation',
        default: null
    },
    senderRef: {
        type: Mongoose.Schema.Types.ObjectId,
        ref: 'user',
        default: null
    },
    recipient: {
        type: String,
        enum: ['user', 'admin'],
        default: 'admin'
    },
    sender: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    content: {
        type: String,
        required: true
    },
    read: {
        type: Boolean,
        default: false
    },
    readAt: {
        type: Date,
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Index for faster queries
MessageSchema.index({ createdAt: -1 });
MessageSchema.index({ sender: 1, createdAt: -1 });
MessageSchema.index({ recipient: 1, read: 1 });
MessageSchema.index({ senderRef: 1, sender: 1 });

module.exports = Mongoose.model('message', MessageSchema);
