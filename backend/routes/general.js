const express = require("express");
const router = express.Router();
const { check, validationResult } = require('express-validator');
const User = require("../models/users");
const path = require('path');
const fs = require('fs');
const Enroll = require('../models/Enroll');
const Contact = require('../models/contact')




// Image proxy for serving user-uploaded images from the local filesystem
router.get("/image-proxy", (req, res) => {
    const relativeImagePath = req.query.url; // Expect the image path relative to the uploads dir
    if (!relativeImagePath) {
        return res.status(400).send("No image path provided");
    }

    // Construct the absolute path to the image file
    // Assumes 'uploads' directory is one level above the 'backend' directory
    const uploadsDir = path.join(__dirname, '../../uploads');
    const absoluteImagePath = path.join(uploadsDir, relativeImagePath);

    // Basic security check to prevent path traversal
    if (!absoluteImagePath.startsWith(uploadsDir)) {
        return res.status(403).send("Forbidden access");
    }

    // Check if file exists and send it
    fs.access(absoluteImagePath, fs.constants.R_OK, (err) => {
        if (err) {
            console.error("Error accessing image or file not found:", absoluteImagePath, err);
            // Optionally send a default image or just 404
            // For now, send 404
            return res.status(404).send("Image not found");
        }

        // Send the file; Express handles Content-Type based on extension
        res.sendFile(absoluteImagePath, (err) => {
            if (err) {
                console.error("Error sending file:", absoluteImagePath, err);
                // Avoid sending error details to client unless necessary
                if (!res.headersSent) {
                    res.status(500).send("Error serving the image");
                }
            }
        });
    });
});


// Verify is username is available
router.get("/username-available", async (req, res) => {
    const { username } = req.query;
    if (!username) {
        return res.json({ available: false });
    }
    
    try {
        // Check if the username is available
        const user = await User.findOne({ username}); // Find a user with the given username
        if (user) {
            return res.json({ available: false });
        }
        return res.json({ available: true });
    } catch (error) {
        console.error("Error checking username availability:", error);
        // res.status(500).send("Error checking username availability");
        return res.json({ available: false });
    }
});


// validating username with not incqluding special characters and spaces
router.get("/validate-username", async (req, res) => {
    const { username } = req.query;
    if (!username) {
        return res.json({ valid: false });
    }
    if (username.match(/^[a-zA-Z0-9_]+$/)) {
        return res.json({ valid: true });
    } else {
        return res.json({ valid: false });
    }
});




router.post('/enroll',
    [
        check("name", "Please enter a valid name").not().isEmpty(),
        check("mobile", "Please enter a valid mobile").not().isEmpty(),
        check("email", "Please enter a valid Email").not().isEmpty(),
        check("course", "Please enter a valid course").not().isEmpty(),
      ],
      async (req,res) =>{
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const { name, mobile, email, course } = req.body;

            const enrollment = new Enroll({
                name,
                mobile,
                email,
                course
            });

            const savedEnrollment = await enrollment.save();
            res.status(200).json(savedEnrollment);

        } catch (error) {
            console.error("Error enrolling in course:", error);
            res.status(500).send("Error enrolling in course");
        }
      }
)


router.post('/contact',
    [
        check("name", "Please enter a valid name").not().isEmpty(),
        check("email", "Please enter a valid Email").not().isEmpty(),
        check("subject", "Please enter a valid subject").not().isEmpty(),
        check("message", "Please enter a valid message").not().isEmpty(),
      ],
      async (req,res) =>{
        const errors = validationResult(req);
            if (!errors.isEmpty()) {
              return res.status(400).json({ errors: errors.array() });
            }

        try {
            const { name, email, mobile, subject, message } = req.body;

            const contact = new Contact({
                name,
                email,
                mobile,
                subject,
                message
            });

            const savedContact = await contact.save();
            res.json(savedContact);

        } catch (error) {
            console.error("Error saving contact form:", error);
            res.status(500).send("Error saving contact form");
        }
      }
)


module.exports = router;
