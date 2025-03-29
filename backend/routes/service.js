const express = require("express");
const router = express.Router();
const Service = require("../models/services");
const { check, validationResult, body, query } = require("express-validator");
router.post(
  "/submit-query",
  [
    check("name").notEmpty().withMessage("Name is required"),
    check("email").notEmpty().withMessage("Email is required"),
    check("mobile").notEmpty().withMessage("Mobile is required"),
    check("serviceType").notEmpty().withMessage("Service is required"),
    check("address").notEmpty().withMessage("Address is required"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const { name, email, mobile, serviceType, address, message } = req.body;
      const userService = new Service({
        name,
        email,
        mobile,
        serviceType,
        address,
        message,
      });
      await userService.save();
      res.status(200).json({ message: "Query submitted successfully" });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Error submitting query" });
    }
  }
);

module.exports = router;
