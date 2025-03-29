const Mongoose = require("mongoose");

const NotificationSchema = Mongoose.Schema({
    user: {
        type: Mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    important: {
        type: Boolean,
        default: false
    },
    read: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    expiresAt: {
        type: Date,
        default: function() {
            // Default expiration is 30 days from creation
            const date = new Date();
            date.setDate(date.getDate() + 30);
            return date;
        }
    }
});

// Index for faster queries
NotificationSchema.index({ user: 1, read: 1, createdAt: -1 });
NotificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index for auto-deletion

module.exports = Mongoose.model('notification', NotificationSchema);
