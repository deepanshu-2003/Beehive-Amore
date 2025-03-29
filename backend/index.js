require('dotenv').config(); // Load environment variables
const express = require('express');
const app = express();
const cors = require('cors');
const port = process.env.PORT || 5000; // Use environment variable for port
const bcrypt = require("bcryptjs");
const connectToMongo = require('./db');
const fs = require('fs');
const path = require('path');


// Importing the User model
const User = require('./models/users');

// Connecting to MongoDB
connectToMongo();

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'auth_token', 'range'],
  exposedHeaders: ['Content-Length', 'Content-Range', 'Accept-Ranges'],
  credentials: true
}));

// Increase timeout for video streaming
app.use((req, res, next) => {
  res.setTimeout(30 * 60 * 1000); // 30 minutes timeout
  next();
});

app.use(express.json());

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Importing routes
app.use('/auth', require('./routes/auth'));
app.use('/course', require('./routes/course'));
app.use('/general', require('./routes/general'));
app.use('/payment', require('./routes/payment'));
app.use('/service', require('./routes/service'));
app.use('/placement', require('./routes/placement'));
app.use('/dashboard', require('./routes/dashboard'));





const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Default admin creation function
const createDefaultAdmin = async () => {
    try {
        const adminUsername = process.env.ADMIN_USERNAME;
        const adminEmail = process.env.ADMIN_EMAIL;
        const adminPassword = process.env.ADMIN_PASSWORD;
        const adminMobile = process.env.ADMIN_MOBILE;

        // Check if the admin user already exists
        const existingAdmin = await User.findOne({ type: "admin" });
        if (existingAdmin) {
            console.log("Default admin user already exists.");
            return;
        }

        // Hash the admin password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(adminPassword, salt);

        // Create the admin user
        await User.create({
            first_name: "Admin",
            last_name: "User",
            username: adminUsername,
            email: adminEmail,
            type: "admin",
            password: hashedPassword,
            mobile: adminMobile,
        });

        console.log("Default admin user created successfully.");
    } catch (error) {
        console.error("An error occurred while creating the default admin user:", error.message);
    }
};

// Call the function to create the default admin user
createDefaultAdmin();

// Global error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send({ message: 'Something went wrong!', error: err.message });
});

// Start the Express server
app.listen(port, () => {
    console.log(`Beehive Amore Backend is listening on Port ${port}`);
});
