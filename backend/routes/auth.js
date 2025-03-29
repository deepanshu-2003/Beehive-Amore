const express = require("express");
const router = express.Router();
require("dotenv").config();
const User = require("../models/users");
const fetchUser = require("../middleware/fetch_user");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const EmailVerify = require("../models/emailVerification");
const MetaUser = require("../models/metaUser");
const MobileVerify = require("../models/mobileVerification");

const JWT_SECRET = process.env.JWT_SECRET; // Use environment variable for production
const { OAuth2Client, auth } = require("google-auth-library");

const EMAIL_SECRET = process.env.EMAIL_SECRET;
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;
const BASE_URL = process.env.BASE_URL;

// random user id generation----------------------------------------------
function generateRandomUsername() {
  const adjectives = [
    "Brave",
    "Clever",
    "Witty",
    "Happy",
    "Gentle",
    "Quick",
    "Bright",
    "Bold",
    "Calm",
    "Lively",
  ];
  const nouns = [
    "Lion",
    "Tiger",
    "Panda",
    "Falcon",
    "Fox",
    "Eagle",
    "Bear",
    "Wolf",
    "Dragon",
    "Shark",
  ];

  // Generate random indices
  const randomAdjective =
    adjectives[Math.floor(Math.random() * adjectives.length)];
  const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
  const randomNumber = Math.floor(Math.random() * 10000); // Random number from 0 to 9999

  // Combine parts to form a username
  return `${randomAdjective}${randomNoun}${randomNumber}`;
}

// ------------------- User creation -----------------------
router.post(
  "/create-user",
  [
    body("first_name", "please Enter a valid name")
      .notEmpty()
      .isLength({ min: 1, max: 20 }),
    body("last_name", "please Enter a valid name")
      .notEmpty()
      .isLength({ min: 1, max: 20 }),
    body("username", "Username must be at least 3 characters long").isLength({
      min: 3,
    }),
    body("username", "Username limit exeeded").isLength({
      max: 20,
    }),
    body("email", "Please enter a valid email").isEmail(),
    body("password", "Password must be at least 8 characters long").isLength({
      min: 8,
    }),
    body(
      "mobile",
      "Please enter a valid 10-digit mobile number"
    ).isMobilePhone(),
    body("recaptchaToken", "Recaptcha token is required").notEmpty(), // Ensure recaptcha_token is provided
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const {
        username,
        email,
        mobile,
        password,
        first_name,
        last_name,
        recaptchaToken,
      } = req.body;
      let email_verified = false;
      let mobile_verified = false;
      // Verify the reCAPTCHA token with Google's API
      const secretKey = process.env.SECRET_KEY; // Use environment variable for the secret key
      const recaptchaUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${recaptchaToken}`;

      const recaptchaResponse = await fetch(recaptchaUrl, { method: "POST" });
      const recaptchaData = await recaptchaResponse.json();
      if (!recaptchaData.success) {
        return res.status(400).json({
          error: "Failed reCAPTCHA verification. Please try again.",
          details: recaptchaData["error-codes"],
        });
      }

      // Check if the username already exists
      let user = await User.findOne({ username });
      if (user) {
        return res
          .status(400)
          .json({ error: "User with this username already exists." });
      }

      // Check if the email already exists
      user = await User.findOne({ email });
      if (user) {
        return res
          .status(400)
          .json({ error: "User with this email already exists." });
      }

      // Check if the mobile number already exists
      user = await User.findOne({ mobile });
      if (user) {
        return res
          .status(400)
          .json({ error: "User with this mobile number already exists." });
      }
      const user_email = await EmailVerify.findOne({ email });
      if (user_email && user_email.email_verified) {
        email_verified = true;
        // remove entry
        await user_email.deleteOne();
      }
      const user_mobile = await MobileVerify.findOne({ mobile });
      if (user_mobile && user_mobile.verified) {
        mobile_verified = true;
        await user_mobile.deleteOne();
      }
      // Hash the password
      const salt = await bcrypt.genSalt(10);
      const secured_passwd = await bcrypt.hash(password, salt);

      // Create the user
      user = await User.create({
        first_name,
        last_name,
        username,
        email,
        email_verified,
        password: secured_passwd,
        mobile,
        mobile_verified,
      });

      // Generate a JWT token
      const auth_token = jwt.sign({ id: user.id }, JWT_SECRET, {
        expiresIn: "1h",
      });

      res.json({ auth_token });
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal server error occurred");
    }
  }
);

//--------------------Validating Auth Token---------------------

router.post("/validate-token", async (req, res) => {
  const { auth_token } = req.body;
  if (!auth_token) {
    return res.status(400).json({ error: "Invalid token" });
  }

  try {
    const user = jwt.verify(auth_token, JWT_SECRET);
    if (!user) {
      return res.status(400).json({ error: "Invalid token" });
    }

    res.json({ auth_token });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal server error occurred");
  }
});

// ------------ Google Login ----------------------
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const client = new OAuth2Client(CLIENT_ID);
router.post("/google-login", async (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ error: "Failed to continue with Google" });
  }

  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: CLIENT_ID, // Match the client ID
    });
    const payload = ticket.getPayload();
    // console.log(payload);
    // Checking that if it is already exists
    let user = await User.findOne({ email: payload.email });
    if (user && user.auth_type !== "google") {
      return res
        .status(400)
        .json({ error: "User with this email already exists" });
    }
    if (!user) {

      // Generate random username
      let random_username = false;
      let username = "";
      while(!random_username){
        username = generateRandomUsername();
        let user_check = await User.findOne({username});
        if(!user_check){
          random_username = true;
        }
      }
      // Create the user
      user = await User.create({
        first_name: payload.given_name,
        last_name: payload.family_name,
        username: username||"",
        profile_img: payload.picture,
        email: payload.email,
        email_verified: payload.email_verified,
        auth_type: "google",
        password: "",
        mobile: "",
      });
      // Generate a JWT token
      const auth_token = jwt.sign({ id: user.id }, JWT_SECRET, {
        expiresIn: "1h",
      });

      res.json({ auth_token });
    } else {
      if (user.auth_type !== "google")
        return res
          .status(400)
          .json({ error: "Internal Server error Occured." });
      // Generate a JWT token
      const auth_token = jwt.sign({ id: user.id }, JWT_SECRET, {
        expiresIn: "1h",
      });
      // console.log(user);
      res.json({ auth_token });
    }
  } catch (err) {
    console.error("Error verifying Google token:", err.message);
    res.status(401).json({ error: "Invalid Google token" });
  }
});

// --------------- User login ----------------------
router.post(
  "/login",
  [
    body("loginId", "Username or Email must be at least 3 characters long").notEmpty().isLength({
      min: 3,
    }),
    body("password", "Password must be at least 8 characters long").notEmpty().isLength({
      min: 8,
    })
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { loginId, password } = req.body;

    try {
     

      // Find user by username or email
      let user = await User.findOne({ $or: [{ username: loginId }, { email: loginId }] });
      if (!user) {
        return res.status(400).json({ error: "Invalid credentials" });
      }

      // Check password
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        return res.status(400).json({ error: "Invalid credentials" });
      }

      // Prevent admin login
      if (user.type === "admin") {
        return res.status(400).json({ error: "Invalid credentials" });
      }

      // Generate a JWT token
      const auth_token = jwt.sign({ id: user.id }, JWT_SECRET, {
        expiresIn: "1h",
      });

      res.json({ auth_token });
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal server error occurred");
    }
  }
);

// ---------------- admin login ---------------------
router.post(
  "/login-admin",
  [
    body("username", "Username must be at least 3 characters long").isLength({
      min: 3,
    }),
    body("password", "Password must be at least 8 characters long").isLength({
      min: 8,
    }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { username, password } = req.body;

    try {
      let user = await User.findOne({ username });
      if (!user) {
        return res.status(400).json({ error: "Invalid credentials" });
      }

      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        return res.status(400).json({ error: "Invalid credentials" });
      }

      if (user.type !== "admin") {
        return res.status(400).json({ error: "Invalid credentials" });
      }

      // Generate a JWT token

      const auth_token = jwt.sign({ id: user.id }, JWT_SECRET, {
        expiresIn: "1h",
      });
      res.json({ auth_token });
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal server error occurred");
    }
  }
);

// --------------- Fetch Admin User---------------
router.post("/get-admin-user", fetchUser, async (req, res) => {
  const token = req.header("auth_token");
  if (!token) {
    return res.status(400).json({ error: "Invalid token" });
  }
  try {
    const user_id = jwt.verify(token, JWT_SECRET).id;
    const user = await User.findById(user_id).select(
      "-password -__v -_id -createdAt -updatedAt -auth_type"
    );
    if (user.type !== "admin") {
      return res.status(400).json({ error: "Unauthorized access" });
    }
    res.json(user);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal server error occurred");
  }
});

// Add user type endpoint
router.get('/user-type', async (req, res) => {
  try {
    const token = req.header('auth_token');
    if (!token) {
      return res.status(401).json({ error: 'Please authenticate using a valid token' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id).select('type');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ type: user.type });
  } catch (error) {
    console.error('Error in user-type:', error.message);
    res.status(500).send('Server Error');
  }
});

// --------------- Fetch User ----------------------
router.post("/get-user", fetchUser, async (req, res) => {
  const user_id = req.user.id;
  try {
    const user = await User.findById(user_id).select(
      "-password -__v -_id -createdAt -updatedAt -auth_type -type"
    );
    res.json(user);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal server error occurred");
  }
});

// ----------------------------Email Verification ---------------------------------
const transporter = nodemailer.createTransport({
  service: "Gmail", // or another email provider
  port: 465,
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
});
// ----------------------------Sending Email --------------------------------------

// endpoint for sending verification mail
// Endpoint for sending verification email
router.post(
  "/send-verification",
  [body("email", "Please enter a valid email").isEmail()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email } = req.body;
    let tuser = null;

    try {
      const already_present = await User.findOne({ email });
      if (req.body.preRegistered) {
        const token = req.header("auth_token");
        const user_id = jwt.verify(token, JWT_SECRET).id;
        tuser = await User.findById(user_id);
      }
      if (already_present)
        if (req.body.preRegistered) {
          if (tuser.email !== email) {
            return res.status(400).json({
              errors: [
                {
                  type: "field",
                  value: "email",
                  msg: "Email does not match the pre-registered email.",
                  path: "email",
                  location: "body",
                },
              ],
            });
          }
        } else if (already_present) {
          return res.status(404).json({
            errors: [
              {
                type: "field",
                value: "email",
                msg: "Email is already registered.",
                path: "email",
                location: "body",
              },
            ],
          });
        }

      // Check if the email already exists in the verification database
      let user = await EmailVerify.findOne({ email });
      let userId;

      if (user) {
        // Fetch existing userId
        userId = user.userId;
        if (user.email_verified) {
          return res.json({ message: "Email Verified successfuly." });
        }
      } else {
        // Generate a new userId for a new email
        userId = generateRandomUsername();

        // Save the new email and userId to the database
        user = new EmailVerify({
          userId,
          email,
          verified: false,
        });

        await user.save();
      }

      // Create a token for verification
      const token = jwt.sign({ userId }, EMAIL_SECRET, { expiresIn: "1h" });

      // Verification link
      const verificationLink = `${BASE_URL}/auth/verify-email?token=${token}`;

      // Email options
      const mailOptions = {
        from: EMAIL_USER,
        to: email,
        subject: "Email Verification",
        html: `
        <p>Click the link below to verify your email address:</p>
        <a href="${verificationLink}">Verify Email</a>
        <p>This link is valid for 1 hour.</p>
      `,
      };

      // Send the email
      await transporter.sendMail(mailOptions);

      res
        .status(200)
        .json({ message: "Verification email sent successfully." });
    } catch (error) {
      console.error("Error sending email:", error);
      res.status(500).json({
        errors: [
          {
            type: "field",
            value: "spdvldixit2003",
            msg: "Failed to send verification email.",
            path: "email",
            location: "body",
          },
        ],
      });
    }
  }
);

//-------------------verifying email ----------------------------------------
// Endpoint for verifying email
router.get("/verify-email", async (req, res) => {
  const { token } = req.query;
  if (!token) {
    return res.status(400).json({ error: "Invalid or missing token." });
  }
  // Email content templates
  const successHtml = (message = "Email Verified Successfully") => {
    return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email Verified</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/css/bootstrap.min.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
  </head>
  <body style="background-
  color: #f8f9fa; padding: 20px;">
    <div class="container text-center mt-5">
      <div class="card shadow-sm p-4">
        <i class="fas fa-check-circle text-success" style="font-size: 4rem;"></i>
        <h1 class="mt-3"> ${message} </h1>
        <p class="lead">Your email address has been successfully verified. Now you can proceed.</p>
        <a href= ${process.env.FRONTEND_URL} class="btn btn-primary mt-3">Go to Home</a>
      </div>
    </div>
  </body>
  </html>
`;
  };

  const failureHtml = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email Not Verified</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/css/bootstrap.min.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
  </head>
  <body style="background-color: #f8f9fa; padding: 20px;">
    <div class="container text-center mt-5">
      <div class="card shadow-sm p-4">
        <i class="fas fa-times-circle text-danger" style="font-size: 4rem;"></i>
        <h1 class="mt-3">Email Verification Failed</h1>
        <p class="lead">We couldn't verify your email address. Please try again or contact support.</p>
        <a href= ${process.env.FRONTEND_URL}/contact class="btn btn-warning mt-3">Contact Support</a>
      </div>
    </div>
  </body>
  </html>
  `;

  try {
    // Verify the token
    const decoded = jwt.verify(token, EMAIL_SECRET);
    const { userId } = decoded;

    // Find the user in the database
    const user = await EmailVerify.findOne({ userId });
    // if user present in database of users
    const userInUser = await User.findOne({ email: user.email });
    if (!user) {
      return res.status(404).send(failureHtml);
    }

    //  update if already registered in user database -------
    if (userInUser && !userInUser.email_verified) {
      userInUser.email_verified = true;
      await userInUser.save();
    }

    // Update the user's verification status
    if (user.email_verified) {
      return res.status(200).send(successHtml("Email Already Verified"));
    }
    user.email_verified = true;
    await user.save();
    return res.status(200).send(successHtml("Email Verified successfully."));
  } catch (error) {
    console.error("Error verifying email:", error);
    return res.status(400).send(failureHtml);
  }
});

// ------------ endpoint to check email verification each time -------------------
router.post("/email-verify-status", async (req, res) => {
  let status = false;
  try {
    const email = req.body.email;
    let user = await EmailVerify.findOne({ email });
    if (!user) {
      return res.json({ status });
    }
    if (user.email_verified) {
      status = true;
      return res.json({ status });
    }
    return res.json({ status });
  } catch (error) {
    return res.status(500).json({ error: "Internal Server error occured." });
  }
});

// ---------------------------------------------------------------------------------
// ----------------------------Mobile Verification ---------------------------------
// ---------------------------------------------------------------------------------

const accountSid = `${process.env.TWILIO_ACCOUNT_SID}`;
const authToken = `${process.env.TWILIO_AUTH_TOKEN}`;
const twilio_client = require("twilio")(accountSid, authToken);

// Randomm OTP generation
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000);
};

router.post(
  "/verify-mobile",
  [
    body(
      "mobile",
      "Please enter a valid 10-digit mobile number"
    ).isMobilePhone(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const OTP = generateOTP();
      const { mobile } = req.body;
      let tuser = null;
      const user = await User.findOne({ mobile });
      if (req.body.preRegistered) {
        const token = req.header("auth_token");
        console.log(token);
        const user_id = jwt.verify(token, JWT_SECRET).id;
        tuser = await User.findById(user_id);
      }
      if (user) {
        if (req.body.preRegistered) {
          if (tuser.mobile !== mobile) {
            return res
              .status(400)
              .json({ error: "Mobile number already registered..." });
          }
        } else {
          return res
            .status(400)
            .json({ error: "Mobile number already registered." });
        }
      }
      const already_present = await MobileVerify.findOne({ mobile });
      console.log(already_present);

      if (already_present && already_present.verified) {
        return res.json({ msg: "Mobile number already verified" });
      }
      await twilio_client.messages.create({
        body: `Your OTP for Beehive Amore is ${OTP}. Please use this code to verify your mobile number. Do not share this code with anyone. It is valid for 10 minutes.`,
        from: "+16203776217",
        to:  `${mobile}`,
      });
      if (already_present) {
        already_present.OTP = OTP;
        already_present.verified = false;
        createdAt = new Date();
        await already_present.save();
      }
      const mobileVerify = new MobileVerify({
        mobile: req.body.mobile,
        OTP,
      });
      await mobileVerify.save();
      return res.json({ msg: `OTP sent Successfully` });
    } catch (err) {
      console.log("Error sending message", err);
      return res.status(404).json({ error: "Unable to send OTP." });
    }
  }
);

router.post(
  "/verify-mobile-otp",
  [
    body(
      "mobile",
      "Please enter a valid 10-digit mobile number"
    ).isMobilePhone(),
    body("OTP", "Please enter a valid OTP"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log("nope");
      return res.status(400).json({ errors: errors.array() });
    }
    const { mobile, OTP } = req.body;
    const token = req.header("auth_token") || null;
    try {
      const mobileVerify = await MobileVerify.findOne({ mobile });
      if (!mobileVerify) {
        return res.status(400).json({ error: "OTP Expired regenerate OTP" });
      }
      if (mobileVerify.OTP !== OTP && !mobileVerify.verified) {
        return res.status(400).json({ errors: [{ msg: "Invalid OTP" }] });
      }
      
      mobileVerify.verified = true;
      await mobileVerify.save();
      if(token && token !== "null"){
        const user_id = jwt.verify(token, JWT_SECRET).id;
        const user = await User.findById(user_id);
        user.mobile = mobile;
        user.mobile_verified = true;
        await user.save();
      }
      return res.json({ msg: "Mobile number verified successfully" });
    } catch (error) {
      console.error("Error verifying mobile number:", error);
      return res
        .status(500)
        .json({ errors: [{ msg: "Internal server error occurred" }] });
    }
  }
);

router.post("/mobile-verify-status", async (req, res) => {
  let status = false;
  try {
    const mobile = req.body.mobile;
    let user = await MobileVerify.findOne({ mobile });
    if (!user) {
      return res.json({ status });
    }
    if (user.verified) {
      status = true;
      return res.json({ status });
    }
    return res.json({ status });
  } catch (error) {
    return res.status(500).json({ error: "Internal Server error occured." });
  }
});

//-----------------------------------------------------------
// -----------------Meta User Handling ---------------------
// ---------------------------------------------------------
// ------------------ meta User Creation -------------------
router.post(
  "/meta-user",
  [
    body("profession", "Profession is required")
      .notEmpty()
      .isLength({ min: 3, max: 100 }),
    body("addressLine", "Address is required")
      .notEmpty()
      .isLength({ min: 3, max: 100 }),
    body("city", "City is required").notEmpty().isLength({ min: 3, max: 100 }),
    body("state", "State is required")
      .notEmpty()
      .isLength({ min: 3, max: 100 }),
    body("country", "Country is required")
      .notEmpty()
      .isLength({ min: 3, max: 100 }),
    body("postalCode", "Postal code is required")
      .notEmpty()
      .isLength({ min: 3, max: 8 }),
  ],
  async (req, res) => {
    const token = req.header("auth_token");
    if (!token) {
      return res.status(400).json({ error: "Invalid token" });
    }
    try {
      const user_id = jwt.verify(token, JWT_SECRET).id;
      const user = await User.findById(user_id);
      if (!user) {
        return res.status(400).json({ error: "User not Authenticated." });
      }
      let metaUser = await MetaUser.findOne({ user: user_id });
      if (!metaUser) {
        metaUser = new MetaUser({});
      }
      const { profession, addressLine, city, state, postalCode, country } =
        req.body;
      if (user.email_verified && user.mobile_verified) {
        metaUser.user = user_id;
        metaUser.profession = profession;
        metaUser.verified = true;
        metaUser.address = addressLine;
        metaUser.city = city;
        metaUser.state = state;
        metaUser.postalCode = postalCode;
        metaUser.country = country;
        
        await metaUser.save();
        const emailVerify = await EmailVerify.findOne({ email: user.email });
        if (emailVerify) {
          await emailVerify.deleteOne();
        }
        const mobileVerify = await MobileVerify.findOne({
          mobile: user.mobile,
        });
        if (mobileVerify) {
          await mobileVerify.deleteOne();
        }
        if (
          !user.profession ||
          !user.address ||
          !user.city ||
          !user.state ||
          !user.postalCode ||
          !user.country
        ) {
          if (!user.profession) {
            user.profession = profession;
          }
          if (!user.address) {
            user.address = addressLine;
          }
          if (!user.city) {
            user.city = city;
          }
          if (!user.state) {
            user.state = state;
          }
          if (!user.postalCode) {
            user.postalCode = postalCode;
          }
          if (!user.country) {
            user.country = country;
          }
          await user.save();
        }
        return res.json({ msg: "Meta User created successfully" });
      } else {
        return res
          .status(400)
          .json({ error: "Please verify email and mobile ." });
      }
    } catch (error) {
      console.error(error.message);
      return res.status(500).json({ error: "Internal Server Error occurred." });
    }
  }
);

//  ----------------------- Check For Meta User ---------------------------------
router.post("/check-meta-user", async (req, res) => {
  const token = req.header("auth_token");
  if (!token) {
    return res.status(400).json({ error: "Invalid token" });
  }
  try {
    const user_id = jwt.verify(token, JWT_SECRET).id;
    const user = await User.findById(user_id);
    let status = false;
    const metaUser = await MetaUser.findOne({ user: user_id });
    if (metaUser) {
      if (user.email_verified && user.mobile_verified) {
        if (!metaUser.verified) {
          metaUser.verified = true;
          await metaUser.save();
        }
        status = true;
      }
    }
    return res.json({ status });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ error: "Internal Server Error occurred." });
  }
});

module.exports = router;
