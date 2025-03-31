const express = require("express");
const router = express.Router();
const User = require("../models/users");
const Notification = require("../models/notification");
const Message = require("../models/message");
const Course = require("../models/courses");
const CourseMember = require("../models/courseMember");
const Placement = require("../models/placements");
const fetchUser = require("../middleware/fetchUser");
const { body, validationResult } = require("express-validator");
const mongoose = require("mongoose");

/**
 * @route   GET /api/dashboard/overview
 * @desc    Get dashboard overview data (courses, placements, notifications count)
 * @access  Private
 */
router.get("/overview", fetchUser, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get counts in parallel for better performance
    const [
      unreadNotificationsCount,
      coursesCount,
      placementsCount,
      unreadMessagesCount
    ] = await Promise.all([
      Notification.countDocuments({ user: userId, read: false }),
      Course.countDocuments({ members: userId }),
      Placement.countDocuments({ applicants: userId }),
      Message.countDocuments({ recipient: 'user', senderRef: userId, read: false })
    ]);

    res.json({
      unreadNotifications: unreadNotificationsCount,
      courses: coursesCount,
      placements: placementsCount,
      unreadMessages: unreadMessagesCount,
      success: true
    });
  } catch (error) {
    console.error("Error fetching dashboard overview:", error);
    res.status(500).json({ error: "Server error", success: false });
  }
});

/**
 * @route   GET /api/dashboard/notifications
 * @desc    Get user notifications with pagination
 * @access  Private
 */
router.get("/notifications", fetchUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const notifications = await Notification.find({ user: userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Notification.countDocuments({ user: userId });

    res.json({
      notifications,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      },
      success: true
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ error: "Server error", success: false });
  }
});

/**
 * @route   PUT /api/dashboard/notifications/:id/read
 * @desc    Mark a notification as read
 * @access  Private
 */
router.put("/notifications/:id/read", fetchUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const notificationId = req.params.id;

    // Ensure the notification belongs to the user
    const notification = await Notification.findOne({
      _id: notificationId,
      user: userId
    });

    if (!notification) {
      return res.status(404).json({
        error: "Notification not found or doesn't belong to you",
        success: false
      });
    }

    // Update the notification
    notification.read = true;
    await notification.save();

    res.json({ success: true, notification });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    res.status(500).json({ error: "Server error", success: false });
  }
});

/**
 * @route   PUT /api/dashboard/notifications/read-all
 * @desc    Mark all notifications as read
 * @access  Private
 */
router.put("/notifications/read-all", fetchUser, async (req, res) => {
  try {
    const userId = req.user.id;

    // Update all unread notifications for this user
    const result = await Notification.updateMany(
      { user: userId, read: false },
      { $set: { read: true } }
    );

    res.json({
      success: true,
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    res.status(500).json({ error: "Server error", success: false });
  }
});

/**
 * @route   DELETE /api/dashboard/notifications/:id
 * @desc    Delete a notification
 * @access  Private
 */
router.delete("/notifications/:id", fetchUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const notificationId = req.params.id;

    // Ensure the notification belongs to the user
    const notification = await Notification.findOne({
      _id: notificationId,
      user: userId
    });

    if (!notification) {
      return res.status(404).json({
        error: "Notification not found or doesn't belong to you",
        success: false
      });
    }

    // Delete the notification
    await Notification.findByIdAndDelete(notificationId);

    res.json({ success: true, message: "Notification deleted" });
  } catch (error) {
    console.error("Error deleting notification:", error);
    res.status(500).json({ error: "Server error", success: false });
  }
});

/**
 * @route   GET /api/dashboard/courses
 * @desc    Get user's enrolled courses
 * @access  Private
 */
router.get("/courses", fetchUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;

    // Find courses where the user is a member
    const courseMemberships = await CourseMember.find({ user: userId })
      .populate({
        path: 'course',
        select: 'course_name course_img course_duration price description category rating'
      })
      .sort({ purchaseDate: -1 })
      .skip(skip)
      .limit(limit);

const courses = courseMemberships.map(membership => ({
  ...membership.course._doc,
  courseName: membership.course.course_name,
  image: membership.course.course_img,
  duration: membership.course.course_duration,
  purchaseDate: membership.purchaseDate,
  expiryDate: membership.expiryDate,
  progress: membership.progress
}));

    const total = await CourseMember.countDocuments({ user: userId });
    
    res.json({
      courses,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      },
      success: true
    });
  } catch (error) {
    console.error("Error fetching user courses:", error);
    res.status(500).json({ error: "Server error", success: false });
  }
});

/**
 * @route   GET /api/dashboard/placements
 * @desc    Get user's placement applications
 * @access  Private
 */
router.get("/placements", fetchUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;

    // Find placements where the user has applied
    const placements = await Placement.find({ applicants: userId })
      .select("title company location salary status applicationDate")
      .sort({ applicationDate: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Placement.countDocuments({ applicants: userId });

    res.json({
      placements,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      },
      success: true
    });
  } catch (error) {
    console.error("Error fetching user placements:", error);
    res.status(500).json({ error: "Server error", success: false });
  }
});

/**
 * @route   GET /api/dashboard/conversations
 * @desc    Get user's conversations
 * @access  Private
 */
router.get("/conversations", fetchUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Find all conversations for this user
    const conversations = await Conversation.find({ participants: userId })
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('participants', 'first_name last_name email');

    const total = await Conversation.countDocuments({ participants: userId });

    res.json({
      conversations,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      },
      success: true
    });
  } catch (error) {
    console.error("Error fetching conversations:", error);
    res.status(500).json({ error: "Server error", success: false });
  }
});

/**
 * @route   POST /api/dashboard/conversations
 * @desc    Create a new conversation
 * @access  Private
 */
router.post(
  "/conversations",
  fetchUser,
  [
    body("title").optional().trim(),
    body("category").optional().isIn([
      "general",
      "technical",
      "billing",
      "course",
      "placement",
      "other"
    ]),
    body("priority").optional().isIn(["low", "medium", "high", "urgent"]),
    body("initialMessage").notEmpty().withMessage("Initial message is required")
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array(), success: false });
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const userId = req.user.id;
      const { title, category, priority, initialMessage } = req.body;

      // Create the conversation
      const conversation = new Conversation({
        participants: [userId], // User is a participant
        createdBy: userId,
        title: title || `Support Request - ${new Date().toLocaleDateString()}`,
        category: category || 'general',
        priority: priority || 'medium',
        status: 'active',
        unreadUserCount: 0,
        unreadAdminCount: 1 // Admin has one unread message
      });

      await conversation.save({ session });

      // Create the initial message
      const message = new Message({
        conversation: conversation._id,
        senderRef: userId,
        sender: "user",
        recipient: "admin",
        content: initialMessage,
        read: false
      });

      await message.save({ session });

      // Update the conversation with the message
      conversation.lastMessage = message.createdAt;
      await conversation.save({ session });

      await session.commitTransaction();
      session.endSession();

      res.status(201).json({
        success: true,
        conversation,
        message
      });
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      console.error("Error creating conversation:", error);
      res.status(500).json({ error: "Server error", success: false });
    }
  }
);

/**
 * @route   GET /api/dashboard/conversations/:id/messages
 * @desc    Get messages for a specific conversation
 * @access  Private
 */
router.get("/conversations/:id/messages", fetchUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const conversationId = req.params.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Ensure the conversation belongs to the user
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: userId
    });

    if (!conversation) {
      return res.status(404).json({
        error: "Conversation not found or doesn't belong to you",
        success: false
      });
    }

    // Get messages for this conversation
    const messages = await Message.find({ conversation: conversationId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Message.countDocuments({ conversation: conversationId });

    // Mark user's unread messages as read
    if (conversation.unreadUserCount > 0) {
      await Message.updateMany(
        {
          conversation: conversationId,
          sender: "admin",
          recipient: userId,
          read: false
        },
        {
          $set: { read: true, readAt: new Date() }
        }
      );

      // Update the conversation unread count
      conversation.unreadUserCount = 0;
      await conversation.save();
    }

    res.json({
      messages: messages.reverse(), // Return in chronological order
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      },
      success: true
    });
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ error: "Server error", success: false });
  }
});

/**
 * @route   POST /api/dashboard/conversations/:id/messages
 * @desc    Send a message in a conversation
 * @access  Private
 */
router.post(
  "/conversations/:id/messages",
  fetchUser,
  [body("content").notEmpty().withMessage("Message content is required")],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array(), success: false });
    }

    try {
      const userId = req.user.id;
      const conversationId = req.params.id;
      const { content } = req.body;

      // Ensure the conversation belongs to the user
      const conversation = await Conversation.findOne({
        _id: conversationId,
        user: userId
      });

      if (!conversation) {
        return res.status(404).json({
          error: "Conversation not found or doesn't belong to you",
          success: false
        });
      }

      // Create and save the new message
      const message = new Message({
        conversation: conversationId,
        senderRef: userId,
        sender: "user",
        recipient: "admin",
        content,
        read: false
      });

      await message.save();

      // Update the conversation
      conversation.lastMessage = message.createdAt;
      conversation.updatedAt = message.createdAt;
      conversation.unreadAdminCount += 1;
      
      // If conversation was closed, reopen it
      if (conversation.status === "closed") {
        conversation.status = "active";
        conversation.closedAt = null;
      }
      
      await conversation.save();

      res.status(201).json({
        success: true,
        message
      });
    } catch (error) {
      console.error("Error sending message:", error);
      res.status(500).json({ error: "Server error", success: false });
    }
  }
);

/**
 * @route   PUT /api/dashboard/conversations/:id
 * @desc    Update conversation (close, change priority, etc.)
 * @access  Private
 */
router.put(
  "/conversations/:id",
  fetchUser,
  [
    body("status").optional().isIn(["active", "closed"]),
    body("priority").optional().isIn(["low", "medium", "high", "urgent"])
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array(), success: false });
    }

    try {
      const userId = req.user.id;
      const conversationId = req.params.id;
      const { status, priority } = req.body;

      // Ensure the conversation belongs to the user
      const conversation = await Conversation.findOne({
        _id: conversationId,
        user: userId
      });

      if (!conversation) {
        return res.status(404).json({
          error: "Conversation not found or doesn't belong to you",
          success: false
        });
      }

      // Update fields if provided
      if (status) {
        conversation.status = status;
        if (status === "closed") {
          conversation.closedAt = new Date();
        } else if (status === "active" && conversation.status === "closed") {
          conversation.closedAt = null;
        }
      }

      if (priority) {
        conversation.priority = priority;
      }

      conversation.updatedAt = new Date();
      await conversation.save();

      res.json({
        success: true,
        conversation
      });
    } catch (error) {
      console.error("Error updating conversation:", error);
      res.status(500).json({ error: "Server error", success: false });
    }
  }
);

/**
 * @route   GET /api/dashboard/user-profile
 * @desc    Get user profile information for dashboard
 * @access  Private
 */
router.get("/user-profile", fetchUser, async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId).select(
      "-password -__v"
    );

    if (!user) {
      return res.status(404).json({ error: "User not found", success: false });
    }

    res.json({
      user,
      success: true
    });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ error: "Server error", success: false });
  }
});

/**
 * @route   GET /api/dashboard/messages
 * @desc    Get all messages for the user
 * @access  Private
 */
router.get("/messages", fetchUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    // Find messages where the user is either the sender or recipient
    const messages = await Message.find({
      $or: [
        { senderRef: userId, sender: 'user' },
        { recipient: 'user' }
      ]
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Message.countDocuments({
      $or: [
        { senderRef: userId, sender: 'user' },
        { recipient: 'user' }
      ]
    });

    // Mark unread messages as read if they're from admin to user
    await Message.updateMany(
      {
        recipient: 'user',
        sender: 'admin',
        read: false
      },
      {
        $set: { read: true, readAt: new Date() }
      }
    );

    res.json({
      messages: messages.reverse(), // Return in chronological order
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      },
      success: true
    });
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ error: "Server error", success: false });
  }
});

/**
 * @route   GET /api/dashboard/messages/unread-count
 * @desc    Get count of unread messages for the user
 * @access  Private
 */
router.get("/messages/unread-count", fetchUser, async (req, res) => {
  try {
    const userId = req.user.id;

    const count = await Message.countDocuments({
      recipient: 'user',
      sender: 'admin',
      read: false
    });

    res.json({
      count,
      success: true
    });
  } catch (error) {
    console.error("Error fetching unread message count:", error);
    res.status(500).json({ error: "Server error", success: false });
  }
});

/**
 * @route   PUT /api/dashboard/messages/mark-read
 * @desc    Mark all messages as read for the user
 * @access  Private
 */
router.put("/messages/mark-read", fetchUser, async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await Message.updateMany(
      {
        recipient: 'user',
        sender: 'admin',
        read: false
      },
      {
        $set: { read: true, readAt: new Date() }
      }
    );

    res.json({
      success: true,
      updatedCount: result.nModified || 0
    });
  } catch (error) {
    console.error("Error marking messages as read:", error);
    res.status(500).json({ error: "Server error", success: false });
  }
});

/**
 * @route   POST /api/dashboard/messages
 * @desc    Send a new message
 * @access  Private
 */
router.post(
  "/messages",
  fetchUser,
  [body("content").notEmpty().withMessage("Message content is required")],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array(), success: false });
    }

    try {
      const userId = req.user.id;
      const { content } = req.body;

      // Create and save the new message
      const message = new Message({
        senderRef: userId,
        sender: 'user',
        recipient: 'admin',
        content,
        read: false
      });

      await message.save();

      res.status(201).json({
        success: true,
        message
      });
    } catch (error) {
      console.error("Error sending message:", error);
      res.status(500).json({ error: "Server error", success: false });
    }
  }
);

module.exports = router;
