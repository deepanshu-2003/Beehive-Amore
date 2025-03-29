const express = require("express");
const router = express.Router();
const Placement = require("../models/placements");
const User = require("../models/users");
const fetchuser = require("../middleware/fetchUser");
const { body, validationResult } = require("express-validator");
const multer = require('multer');
const path = require('path');
const jwt = require("jsonwebtoken");
require('dotenv').config();

// Configure multer for file upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/resumes')
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname)
    }
});

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(null, false);
            return cb(new Error('Only PDF files are allowed'));
        }
    }
});

const JWT_SECRET = process.env.JWT_SECRET;

// Middleware to verify admin
const verifyAdmin = async (req, res, next) => {
    try {
        const token = req.header('auth_token');
        if (!token) {
            return res.status(401).json({ error: "Access denied" });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findById(decoded.id);

        if (!user || user.type !== 'admin') {
            return res.status(403).json({ error: "Access denied. Admin only." });
        }

        req.user = user;
        next();
    } catch (error) {
        console.error("Admin verification error:", error);
        res.status(401).json({ error: "Invalid token" });
    }
};

// ------------ endpoint to create a new placement -------------------
router.post("/create-placement", verifyAdmin, async (req, res) => {
    const { company_name, company_email, company_phone, company_address, job_title, job_description, job_location, job_type, job_category, job_salary, job_experience, job_qualification, job_skills, job_status } = req.body;

    try {
        const placement = new Placement({
            company_name: company_name || "Company Name",
            company_email: company_email || "company@gmail.com",
            company_phone: company_phone || "+919876543210",
            company_address: company_address || "Company Address",
            job_title: job_title || "Job Title",
            job_description: job_description || "Job Description",
            job_location: job_location || "Job Location",
            job_type: job_type || "Full Time",
            job_category: job_category || "Job Category",
            job_salary: job_salary || "Job Salary",
            job_experience: job_experience || "0-1 Year",
            job_qualification: job_qualification || "Bachelor's Degree",
            job_skills: job_skills || ["Skill 1", "Skill 2", "Skill 3"],
            job_status: job_status || "Active",
        });

        await placement.save();
        return res.status(201).json({ message: "Placement created successfully", placement });
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ error: "Invalid authentication token." });
        }
        return res.status(500).json({ error: error.message });
    }
});

// ------------ endpoint to get all placements -------------------
router.get("/get-placements", async (req, res) => {
    try {
        let isAdmin = false;
        const token = req.header('auth_token');

        if (token) {
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                const user = await User.findById(decoded.id);
                if (user && user.type === 'admin') {
                    isAdmin = true;
                }
            } catch (error) {
                console.error("Token verification error:", error);
            }
        }

        const placements = await Placement.find().sort({ job_created_at: -1 });

        // If admin, send all data; if not, filter sensitive info
        const filteredPlacements = placements.map(placement => {
            const placementObj = placement.toObject();
            if (!isAdmin) {
                delete placementObj.company_email;
                delete placementObj.company_phone;
                delete placementObj.company_address;
                delete placementObj.applications;
            }
            return placementObj;
        });

        res.json({
            placements: filteredPlacements,
            isAdmin
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
});

// ------------ endpoint to get a single placement by ID -------------------
router.get("/get-placement/:id", verifyAdmin, async (req, res) => {
    try {
        const placement = await Placement.findById(req.params.id);

        if (!placement) {
            return res.status(404).json({ error: "Placement not found" });
        }

        // Convert to a plain object and add isAdminView flag
        const placementData = placement.toObject();
        placementData.isAdminView = true;

        res.json(placementData);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

// ------------ endpoint to update a placement by ID -------------------
router.put("/update-placement/:id", verifyAdmin, async (req, res) => {
    try {
        // Process job skills (convert from string to array if needed)
        if (req.body.job_skills && typeof req.body.job_skills === 'string') {
            req.body.job_skills = req.body.job_skills.split(',').map(skill => skill.trim());
        }

        // Update the placement
        const updatedPlacement = await Placement.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true }
        );

        if (!updatedPlacement) {
            return res.status(404).json({ error: "Placement not found" });
        }

        // Convert to plain object and add isAdminView flag
        const placementData = updatedPlacement.toObject();
        placementData.isAdminView = true;

        return res.status(200).json({
            message: "Placement updated successfully",
            placement: placementData
        });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

// ROUTE 1: Get all placements (public)
router.get("/get-placements-public", async (req, res) => {
    try {
        const placements = await Placement.find()
            .select('-company_email -company_phone -company_address')
            .sort({ job_created_at: -1 });
        res.json(placements);
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
});

// ROUTE 2: Get single placement by ID (public)
router.get("/get-placement-public/:id", async (req, res) => {
    try {
        const placement = await Placement.findById(req.params.id);

        if (!placement) {
            return res.status(404).json({ error: "Placement not found" });
        }

        res.json(placement);
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
});

// ROUTE 3: Check if user has already applied (requires auth)
router.get("/check-application/:id", fetchuser, async (req, res) => {
    try {
        const placement = await Placement.findById(req.params.id);
        if (!placement) {
            return res.status(404).json({ error: "Placement not found" });
        }

        const hasApplied = placement.applications.some(
            app => app.user.toString() === req.user.id
        );

        res.json({ hasApplied });
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
});

// ROUTE 4: Apply for a placement (requires auth)
router.post("/apply/:id", [fetchuser, upload.single('resume')], async (req, res) => {
    try {
        const placement = await Placement.findById(req.params.id);
        if (!placement) {
            return res.status(404).json({ error: "Placement not found" });
        }
        if (placement.job_status !== 'Active') {
            return res.status(400).json({ error: "This position is no longer accepting applications" });
        }
        // Check if already applied
        const hasApplied = placement.applications.some(
            app => app.user.toString() === req.user.id
        );
        if (hasApplied) {
            return res.status(400).json({ error: "You have already applied for this position" });
        }
        // Validate required fields
        if (!req.body.name || !req.body.email || !req.body.phone || !req.file) {
            return res.status(400).json({ error: "Please fill all required fields" });
        }
        const newApplication = {
            user: req.user.id,
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone,
            resume: req.file ? req.file.path : '',
            coverLetter: req.body.coverLetter || '',
            appliedAt: new Date()
        };
        placement.applications.push(newApplication);
    await placement.save();

        res.json({ message: "Application submitted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});

module.exports = router;
