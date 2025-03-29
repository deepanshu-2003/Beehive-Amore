const Mongoose = require("mongoose");

const ConversationSchema = Mongoose.Schema({
    participants: [{
        type: Mongoose.Schema.Types.ObjectId,
        ref: 'user'
    }],
    createdBy: {
        type: Mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    title: {
        type: String,
        default: function() {
            return `Conversation ${new Date().toLocaleDateString()}`;
        }
    },
    status: {
        type: String,
        enum: ['active', 'closed', 'archived'],
        default: 'active'
    },
    category: {
        type: String,
        enum: ['general', 'technical', 'billing', 'course', 'placement', 'other'],
        default: 'general'
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'urgent'],
        default: 'medium'
    },
    lastMessage: {
        type: Date,
        default: Date.now
    },
    assignedTo: {
        type: Mongoose.Schema.Types.ObjectId,
        ref: 'user',
        default: null
    },
    unreadUserCount: {
        type: Number,
        default: 0
    },
    unreadAdminCount: {
        type: Number,
        default: 0
    },
    relatedEntity: {
        type: Mongoose.Schema.Types.ObjectId,
        refPath: 'entityType',
        default: null
    },
    entityType: {
        type: String,
        enum: ['course', 'placement', 'payment', null],
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    closedAt: {
        type: Date,
        default: null
    }
});

// Update the updatedAt field on save
ConversationSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// Indexes for faster queries
ConversationSchema.index({ user: 1, status: 1, lastMessage: -1 });
ConversationSchema.index({ assignedTo: 1, status: 1 });
ConversationSchema.index({ status: 1, priority: 1 });

module.exports = Mongoose.model('conversation', ConversationSchema);
