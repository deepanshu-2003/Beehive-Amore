const express = require("express");
const router = express.Router();
const Course = require("../models/courses");
const User = require("../models/users");
const CourseReview = require("../models/courseReview");
const { check, validationResult, body, query } = require("express-validator");
const courseContent = require("../models/courseContent");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const courseMember = require("../models/courseMember");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;
const ffmpeg = require("fluent-ffmpeg");
const { createReadStream } = require("fs");
ffmpeg.setFfmpegPath(ffmpegPath);

// @route - POST /course/add-course
// @desc - Add a new course
// @access - Public

// Course creation in database
// Helper function to check course access
const checkCourseAccess = async (userId, courseId) => {
  const user = await User.findById(userId);
  if (user.type === "admin") return true;

  const member = await courseMember.findOne({
    user: userId,
    course: courseId,
    status: "active",
  });
  return !!member;
};

const JWT_SECRET = process.env.JWT_SECRET;
router.post(
  "/create",
  [
    check("course_name", "Please enter a course name").not().isEmpty(),
    check("course_desc", "Please enter a course description").not().isEmpty(),
    check("course_price", "Please enter a course price").not().isEmpty(),
    check("course_discount", "Please enter a course discount").not().isEmpty(),
    check("course_img", "Please enter a course image").not().isEmpty(),
    check("course_duration", "Please enter a course duration").not().isEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const token = req.header("auth_token");
    if (!token) {
      return res.status(401).json({ error: "Unauthorized Accesss" });
    } else {
      //verifying token from admin only
      try {
        const user_id = jwt.verify(token, JWT_SECRET);
        const usertype = await User.findById(user_id.id).select("type");
        if (usertype.type !== "admin")
          return res.status(401).json({ error: "Unauthorized Accesss" });
      } catch (error) {
        return res.status(401).json({ error: "Unauthorized Accesss" });
      }
    }
    const {
      course_name,
      course_desc,
      course_price,
      course_discount,
      course_img,
      course_duration,
    } = req.body;

    try {
      const newCourse = new Course({
        course_name,
        course_desc,
        course_price,
        course_discount,
        course_img,
        course_duration,
      });

      const savedCourse = await newCourse.save();
      res.json(savedCourse);
    } catch (error) {
      console.error("Error adding course:", error.message);
      res.status(500).send("Server Error");
    }
  }
);

// Course fetching from database

router.get("/get/:id", async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }
    res.json(course);
  } catch (error) {
    console.error("Error fetching course:", error.message);
    res.status(500).send("Server Error");
  }
});

router.get("/:id/reviews", async (req, res) => {
  try {
    const courseId = req.params.id;

    // Validate course existence
    const courseExists = await Course.findById(courseId);
    if (!courseExists) {
      return res.status(404).json({ error: "Course not found" });
    }

    // Aggregation pipeline to fetch reviews with username and calculate average rating
    const reviewsData = await CourseReview.aggregate([
      {
        $match: { course: new mongoose.Types.ObjectId(courseId) }, // Use 'new' for ObjectId
      },
      {
        $lookup: {
          from: "users", // Join with users collection
          localField: "user", // Field in CourseReview
          foreignField: "_id", // Field in User
          as: "userDetails",
        },
      },
      {
        $unwind: "$userDetails", // Flatten the userDetails array
      },
      {
        $group: {
          _id: "$course", // Group by course
          reviews: {
            $push: {
              username: "$userDetails.username", // Fetch username from userDetails
              rating: "$rating",
              review: "$review",
              date: "$review_date",
            },
          },
          averageRating: { $avg: "$rating" }, // Calculate average rating
          totalReviews: { $sum: 1 }, // Count total reviews
        },
      },
      {
        $lookup: {
          from: "courses", // Join with courses collection
          localField: "_id",
          foreignField: "_id",
          as: "courseDetails",
        },
      },
      {
        $unwind: "$courseDetails", // Flatten the courseDetails array
      },
      {
        $project: {
          _id: 0,
          course: "$courseDetails.course_name", // Include course name
          averageRating: 1,
          totalReviews: 1,
          reviews: 1,
        },
      },
    ]);

    if (!reviewsData.length) {
      return res.json({
        course: courseExists.course_name,
        averageRating: 0,
        totalReviews: 0,
        reviews: [],
      });
    }

    res.json(reviewsData[0]);
  } catch (error) {
    console.error("Error fetching reviews:", error.message);
    res.status(500).send("Server Error");
  }
});

//  Get all courses
router.post("/get", async (req, res) => {
  try {
    const courses = await Course.aggregate([
      {
        $lookup: {
          from: "coursereviews", // Collection name of reviews
          localField: "_id",
          foreignField: "course",
          as: "reviews",
        },
      },
      {
        $addFields: {
          averageRating: { $avg: "$reviews.rating" },
          totalReviews: { $size: "$reviews" },
        },
      },
    ]);

    res.json(courses);
  } catch (error) {
    console.error("Error fetching courses:", error.message);
    res.status(500).send("Server Error");
  }
});

// Customer ratings on course
router.post(
  "/rating",
  [
    check("course_id", "Course ID is required").not().isEmpty(),
    check("rating", "Rating is required").isFloat({ min: 1, max: 5 }),
    check("review", "Review is required").not().isEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { course_id, user_id, rating, review } = req.body;
    const token = req.header("auth_token");
    if (!token) {
      return res.status(401).json({ error: "Unauthorized Accesss" });
    }

    try {
      //verifying token from admin only
      const user_id = jwt.verify(token, JWT_SECRET).id;
      const course = await Course.findById(course_id);
      if (!course) {
        return res.status(404).json({ error: "Course not found" });
      }
      const member = await courseMember.findOne({
        user: user_id,
        course: course_id,
        status: "active",
      });
      if (!member)
        return res.status(401).json({ error: "Unauthorized Accesss" });
      const user = await User.findById(user_id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      const newReview = new CourseReview({
        user: user_id,
        course: course_id,
        rating,
        review,
      });
      const savedReview = await newReview.save();
      res.json(savedReview);
    } catch (error) {
      console.error("Error submitting review:", error.message);
      res.status(500).send("Internal Server Error");
    }
  }
);

// -----------------Admin endpoints --------------------------
//--------------------Create Directory-----------------------------

router.post(
  "/make-dir",
  [
    check("name", "Please enter a valid directory name")
      .not()
      .isEmpty()
      .matches(/^[a-zA-Z0-9_\s]+$/), // Only alphanumeric characters, underscores, and spaces are allowed
    check("parent", "Parent ID must be a valid MongoDB ObjectId")
      .optional()
      .isMongoId(),
    check(
      "course_id",
      "Course ID is required and must be a valid MongoDB ObjectId"
    ).isMongoId(),
    check("visiblity", "Enter a Valid visiblity Parameter").optional(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      // Extract fields from the request
      const { name, parent, course_id } = req.body;
      const token = req.header("auth_token");
      let { visibility } = req.body;
      if (visibility && visibility == "private") visibility = "private";

      // Check token validity
      if (!token) {
        return res.status(401).json({ error: "Unauthorized access" });
      }

      const user_id = jwt.verify(token, JWT_SECRET).id;

      // Verify user as admin
      const user = await User.findById(user_id).select("-password");
      if (!user || user.type !== "admin") {
        return res.status(403).json({ error: "Unauthorized access" });
      }

      // Verify course existence
      const course = await Course.findById(course_id);
      if (!course) {
        return res.status(404).json({ error: "Course not found" });
      }

      // Check if the parent directory exists (if provided)
      let parentDir = null;
      if (parent) {
        parentDir = await courseContent.findById(parent);
        if (!parentDir || parentDir.file_type !== "dir") {
          return res.status(400).json({ error: "Invalid parent directory" });
        }
      }

      // Check if a directory with the same name already exists under the same parent
      const existingDir = await courseContent.findOne({
        parent: parent || null,
        course: course_id,
        file_type: "dir",
        fileName: name,
      });

      if (existingDir) {
        return res
          .status(400)
          .json({ error: "Directory with this name already exists" });
      }

      // Create the directory in the database
      const newDir = new courseContent({
        user: user_id,
        course: course_id,
        file_type: "dir",
        visibility: visibility,
        parent: parent || null,
        fileName: name,
      });

      const savedDir = await newDir.save();

      res.status(200).json({
        message: "Directory created successfully",
        directory: savedDir,
      });
    } catch (error) {
      console.error("Error creating directory:", error.message);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

// ---------------- Uploading files -------------------
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "../uploads/"); // Save files in the 'uploads' directory
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname)); // Unique filename
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ["video/mp4", "application/pdf"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error("Invalid file type. Only MP4 videos and PDFs are allowed."),
      false
    );
  }
};

const upload = multer({ storage, fileFilter }).array("files", 10); // Allow up to 10 files

router.post(
  "/upload-file",
  [
    check("course_id", "Course ID is required").isMongoId(),
    check("parent", "Parent ID must be valid").optional().isMongoId(),
  ],
  async (req, res) => {
    try {
      // Handle file upload
      upload(req, res, async function (err) {
        if (err instanceof multer.MulterError) {
          return res.status(400).json({ error: err.message });
        } else if (err) {
          return res.status(500).json({ error: err.message });
        }

        // Verify admin access
        const token = req.header("auth_token");
        if (!token) return res.status(401).json({ error: "Unauthorized" });

        const user_id = jwt.verify(token, JWT_SECRET).id;
        const user = await User.findById(user_id);
        if (!user || user.type !== "admin") {
          return res.status(403).json({ error: "Unauthorized Access." });
        }

        // Check course and parent directory
        const { course_id, parent } = req.body;
        const course = await Course.findById(course_id);
        if (!course) return res.status(404).json({ error: "Course not found" });

        if (parent) {
          const parentDir = await courseContent.findById(parent);
          if (!parentDir || parentDir.file_type !== "dir") {
            return res.status(400).json({ error: "Invalid parent directory" });
          }
        }

        if (!req.files || req.files.length === 0) {
          return res.status(400).json({ error: "No files uploaded" });
        }

        const results = [];
        const processFile = async (file) => {
          let destinationPath = file.path;

          if (file.mimetype === "video/mp4") {
            const hlsOutputDir = path.join(
              __dirname,
              "../../uploads",
              "hls",
              file.filename.split(".")[0]
            );

            if (!fs.existsSync(hlsOutputDir)) {
              fs.mkdirSync(hlsOutputDir, { recursive: true });
            }

            try {
              await new Promise((resolve, reject) => {
                ffmpeg(file.path)
                  .outputOptions([
                    "-c:v libx264", // Video codec
                    "-crf 23", // Constant Rate Factor (quality)
                    "-preset fast", // Encoding speed preset
                    "-c:a aac", // Audio codec
                    "-ar 48000", // Audio sample rate
                    "-b:a 128k", // Audio bitrate
                    "-ac 2", // Audio channels
                    "-hls_time 4", // Duration of each segment
                    "-hls_list_size 0", // Keep all segments
                    "-hls_segment_filename",
                    `${hlsOutputDir}/%03d.ts`, // Segment filename pattern
                    "-f hls", // Force HLS format
                  ])
                  .output(`${hlsOutputDir}/playlist.m3u8`)
                  .on("start", (commandLine) => {
                    console.log("FFmpeg conversion started:", commandLine);
                  })
                  .on("progress", (progress) => {
                    console.log(
                      `Processing: ${
                        progress.percent ? progress.percent.toFixed(2) : 0
                      }% done`
                    );
                  })
                  .on("end", () => {
                    console.log("HLS conversion finished successfully");
                    resolve();
                  })
                  .on("error", (err, stdout, stderr) => {
                    console.error("FFmpeg error:", err.message);
                    console.error("FFmpeg stderr:", stderr);
                    reject(
                      new Error(`FFmpeg conversion failed: ${err.message}`)
                    );
                  })
                  .run();
              });

              destinationPath = path.join(
                "hls",
                file.filename.split(".")[0],
                "playlist.m3u8"
              );

              // Only delete the original file if conversion was successful
              fs.unlinkSync(file.path);
            } catch (error) {
              console.error("Error processing video:", error);
              // Clean up the HLS directory if conversion failed
              if (fs.existsSync(hlsOutputDir)) {
                fs.rmSync(hlsOutputDir, { recursive: true, force: true });
              }
              throw new Error(`Video conversion failed: ${error.message}`);
            }
          }

          const newFile = new courseContent({
            user: user_id,
            course: course_id,
            file_type: file.mimetype === "application/pdf" ? "pdf" : "video",
            parent: parent || null,
            fileName: file.originalname,
            destination: destinationPath,
          });

          const savedFile = await newFile.save();
          return {
            originalName: file.originalname,
            status: "completed",
            file: savedFile,
          };
        };

        try {
          const uploadPromises = req.files.map(processFile);
          const results = await Promise.all(uploadPromises);
          res.status(201).json({
            message: "Files uploaded successfully",
            files: results,
          });
        } catch (error) {
          console.error("Error processing files:", error);
          res.status(500).json({ error: "Error processing files" });
        }
      });
    } catch (error) {
      console.error("Error:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

// ------------------ check for CourseMember ---------------------
router.post("/check-member", async (req, res) => {
  let status = false;
  const token = req.header("auth_token");
  if (!token) {
    return res.status(401).json({ error: "Unauthorized Accesss" });
  }
  try {
    const user_id = jwt.verify(token, JWT_SECRET);

    const user = await User.findById(user_id.id);
    if (!user) return res.json({ status: false });
    const { course_id } = req.body;
    const course = await Course.findById(course_id);

    if (!course) return res.json({ status: status });
    const member = await courseMember.findOne({
      user: user_id.id,
      course: course_id,
    });
    if (member && member.status === "active") {
      status = true;
    }
    return res.json({ status: status });
  } catch (error) {
    console.error("Error checking member:", error);
    return res.json({ status: false });
  }
});

// -------------------- Access Content -------------------------
router.post(
  "/show-content",
  [
    check("course_id", "Course ID is required").isMongoId(),
    check("parent", "Parent ID must be valid").optional().isMongoId(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { course_id, parent } = req.body;
      const course = await Course.findById(course_id);
      if (!course) return res.status(404).json({ error: "Course not found" });

      let hasAccess = false;
      const token = req.header("auth_token") || null;

      if (token && token !== "null") {
        try {
          const user_id = jwt.verify(token, JWT_SECRET).id;
          hasAccess = await checkCourseAccess(user_id, course_id);
        } catch (error) {
          console.error("Token verification error:", error);
        }
      }
      if (parent) {
        const parentDir = await courseContent.findById(parent);
        if (!parentDir || parentDir.file_type !== "dir") {
          return res.status(400).json({ error: "Invalid parent directory" });
        }

        if (parentDir.visibility === "private" && !hasAccess) {
          return res.status(403).json({
            error: "Premium content. Please purchase the course to access.",
          });
        }
      }

      const directories = await courseContent.find({
        course: course_id,
        parent: parent || null,
        file_type: "dir",
      });

      const files = await courseContent.find({
        course: course_id,
        parent: parent || null,
        file_type: { $ne: "dir" },
      });

      return res.json({
        directories,
        files,
      });
    } catch (error) {
      console.error("Error:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

// Stream video content
router.get("/stream/:fileId", async (req, res) => {
  try {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "range, auth_token");
    res.setHeader(
      "Access-Control-Expose-Headers",
      "Content-Length, Content-Range"
    );

    if (req.method === "OPTIONS") {
      res.status(200).end();
      return;
    }
    const file = await courseContent.findById(req.params.fileId);
    if (!file) return res.status(404).json({ error: "File not found" });
    let hasAccess = false;

    const token = req.header("auth_token") || null;
    if (token && token !== "null") {
      const user_id = jwt.verify(token, JWT_SECRET).id;
      hasAccess = await checkCourseAccess(user_id, file.course);
    }
    if (!hasAccess && file.visibility === "private") {
      return res.status(403).json({ error: "Access denied" });
    }

    if (file.file_type !== "video") {
      return res.status(400).json({ error: "Invalid file type" });
    }

    const hlsBasePath = path.resolve(__dirname, "../../uploads");
    const filePath = path.join(hlsBasePath, file.destination);
    const fileDir = path.dirname(filePath);

    if (req.query.segment) {
      const segmentPath = path.join(fileDir, req.query.segment);
      if (!segmentPath.startsWith(hlsBasePath)) {
        return res.status(403).json({ error: "Access denied" });
      }
      if (!fs.existsSync(segmentPath)) {
        return res.status(404).json({ error: "Segment not found" });
      }
      res.setHeader("Content-Type", "video/MP2T");
      const readStream = createReadStream(segmentPath);
      readStream.pipe(res);
      readStream.on("error", (error) => {
        console.error("Error streaming segment:", error);
        if (!res.headersSent) {
          res.status(500).json({ error: "Error streaming segment" });
        }
      });
    } else {
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: "Playlist not found" });
      }
      const content = await fs.promises.readFile(filePath, "utf8");
      const modifiedContent = content.replace(
        /^(?!#)(.+\.ts)$/gm,
        (match) => `${req.baseUrl}/stream/${file._id}?segment=${match}`
      );
      res.setHeader("Content-Type", "application/vnd.apple.mpegurl");
      res.send(modifiedContent);
    }
  } catch (error) {
    console.error("Error streaming file:", error);
    if (!res.headersSent) {
      res.status(500).json({ error: "Error streaming file" });
    }
  }
});

// Serve PDF content with pagination
router.get("/pdf/:fileId", async (req, res) => {
  try {
    // Add CORS headers
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET");
    res.setHeader("Access-Control-Allow-Headers", "auth_token");

    const file = await courseContent.findById(req.params.fileId);
    if (!file) return res.status(404).json({ error: "File not found" });
    // Get token from query parameter or header
    let hasAccess = false;
    const token = req.query.token || req.header("auth_token") || null;
    if (token && token !== "null") {
      // Verify the token
      const decoded = jwt.verify(token, JWT_SECRET);
      const user_id = decoded.id;
      hasAccess = await checkCourseAccess(user_id, file.course);
    }
    if (!hasAccess && file.visibility === "private") {
      return res.status(403).json({ error: "Access denied" });
    }

    // Check access

    const course = await Course.findById(file.course);
    if (!course) return res.status(404).json({ error: "Course not found" });

    if (file.file_type !== "pdf") {
      return res.status(400).json({ error: "Invalid file type" });
    }

    const filePath = path.join(__dirname, "../../uploads", file.destination);

    // Fixed: Use promises version of fs.stat
    const stat = await fs.promises.stat(filePath);

    // Set headers for PDF streaming
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Length", stat.size);
    res.setHeader(
      "Content-Disposition",
      `inline; filename="${encodeURIComponent(file.fileName)}"`
    );
    res.setHeader("Cache-Control", "no-cache");

    // Stream the PDF file
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);

    fileStream.on("error", (error) => {
      console.error("Error streaming PDF:", error);
      if (!res.headersSent) {
        res.status(500).json({ error: "Error streaming PDF" });
      }
    });
  } catch (error) {
    console.error("Error serving PDF:", error);
    if (!res.headersSent) {
      res.status(500).json({
        error: "Error serving PDF",
        details: error.message,
      });
    }
  }
});

//------------------------- End point for searching Course content -------------------------
router.get("/search-content", async (req, res) => {
  const { query } = req.query;
  const { course_id } = req.query;
  console.log(req.body);
  let hasAccess = false;
  const token = req.header("auth_token") || null;
  if (token && token !== "null") {
    const user_id = jwt.verify(token, JWT_SECRET).id;
    hasAccess = await checkCourseAccess(user_id, course_id);
    console.log(`user_id: ${user_id}`);
    console.log(`course_id: ${course_id}`);
    console.log(`hasAccess: ${hasAccess}`);
  }
  try {
    const results = await courseContent.find({
      fileName: { $regex: query, $options: "i" },
      course: course_id,
      ...(hasAccess ? {} : { visibility: "public" }),
    });
    console.log(results);
    console.log(hasAccess);
    res.json(results);
  } catch (error) {
    return res.json({});
  }
});

//------------------------- End point for backtracking parents directory -------------------------
router.get("/backtrack-parents", async (req, res) => {
  const { file_id } = req.body;
  const token = req.header("auth_token") || null;
  let hasAccess = false;
  if (token && token !== "null") {
    const user_id = jwt.verify(token, JWT_SECRET).id;
    hasAccess = await checkCourseAccess(user_id, file_id);
  }
  const file = await courseContent.findById(file_id);
  if (!file) return res.json({});
  let parents = [];
  let current = file;
  try {
    while (current.parent && current.parent !== "null") {
      const parent = await courseContent.findById(current.parent);
      if (!hasAccess && parent.visibility === "private") {
        return res.status(403).json({ error: "Access denied" });
      }
      if (!parent) break;
      parents.push(parent);
      current = parent;
    }
    res.json(parents);
  } catch (error) {
    console.error("Error backtracking parents:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
