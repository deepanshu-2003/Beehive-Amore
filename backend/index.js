require('dotenv').config(); // Load environment variables
const express = require('express');
const app = express();
const cors = require('cors');
const port = process.env.PORT || 5000;
const bcrypt = require("bcryptjs");
const connectToMongo = require('./db');
const fs = require('fs');
const path = require('path');
const User = require('./models/users');

connectToMongo();

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'auth_token', 'range'],
  exposedHeaders: ['Content-Length', 'Content-Range', 'Accept-Ranges'],
}));

app.use((req, res, next) => {
  res.setTimeout(30 * 60 * 1000);
  next();
});

app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/auth', require('./routes/auth'));
app.use('/course', require('./routes/course'));
app.use('/general', require('./routes/general'));
app.use('/payment', require('./routes/payment'));
app.use('/service', require('./routes/service'));
app.use('/dashboard', require('./routes/dashboard'));
// Admin setup
const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const createDefaultAdmin = async () => {
    try {
        const adminUsername = process.env.ADMIN_USERNAME;
        const adminEmail = process.env.ADMIN_EMAIL;
        const adminPassword = process.env.ADMIN_PASSWORD;
        const adminMobile = process.env.ADMIN_MOBILE;

        const existingAdmin = await User.findOne({ type: "admin" });
        if (!existingAdmin) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(adminPassword, salt);
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
        }
    } catch (error) {
        console.error("Admin creation error:", error.message);
    }
};

createDefaultAdmin();

// Error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send({ message: 'Something went wrong!', error: err.message });
});

app.listen(port, () => {
    console.log(`Beehive Amore Backend is listening on Port ${port}`);
});
