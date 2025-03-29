const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    resume: {
        type: String,
        required: true
    },
    coverLetter: {
        type: String
    },
    appliedAt: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['Pending', 'Shortlisted', 'Rejected'],
        default: 'Pending'
    }
});

const PlacementSchema = new mongoose.Schema({
    company_name: {
        type: String,
        required: true,
        default: "Company Name",
    },
    company_email: {
        type: String,
        default: "company@gmail.com",
    },
    company_phone: {
        type: String,
        default: "+919876543210",
    },
    company_address: {
        type: String,
        default: "Company Address",
    },
    job_title: {
        type: String,
        required: true,
        default: "Job Title",
    },
    job_description: {
        type: String,
        required: true,
        default: "Job Description",
    },
    job_location: {
        type: String,
        required: true,
        default: "Job Location",
    },
    job_type: {
        type: String,
        required: true,
        enum: ['Full Time', 'Part Time', 'Contract', 'Temporary'],
        default: "Full Time",
    },
    job_category: {
        type: String,
        required: true,
        default: "Job Category",
    },
    job_salary: {
        type: String,
        default: "Job Salary",
    },
    job_experience: {
        type: String,
        default: "0-1 Year",
    },
    job_qualification: {
        type: String,
        default: "Bachelor's Degree",
    },
    job_skills: {
        type: [String],
        default: ["Skill 1", "Skill 2", "Skill 3"],
    },
    job_status: {
        type: String,
        enum: ['Active', 'Inactive', 'Filled'],
        default: "Active",
    },
    job_created_at: {
        type: Date,
        default: Date.now,
    },
    job_updated_at: {
        type: Date,
        default: Date.now,
    },
    applications: [applicationSchema]
})

const Placement = mongoose.model("Placement", PlacementSchema);

module.exports = Placement;
