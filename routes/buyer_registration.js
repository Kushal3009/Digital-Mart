const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const db = require("../db.js");
const { body, validationResult } = require("express-validator");

const registrationValidationRules = [
  body("buyer_name").notEmpty(),
  body("buyer_email").isEmail(),
  body("buyer_password").isLength({ min: 6 }),
  body("buyer_phonenumber").isNumeric().isLength({ max: 10 }),
];

router.post("/", registrationValidationRules, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: "Validation failed" });
  }

  const {
    buyer_name,
    buyer_email,
    buyer_phonenumber,
    buyer_password,
    buyer_address,
    city_name,
    pincode,
  } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(buyer_password, 10);

    const sql = "CALL create_buyer(?, ?, ?, ?, ?, ?, ?)";
    const inserts = [
      buyer_name,
      buyer_email,
      buyer_phonenumber,
      hashedPassword,
      buyer_address,
      city_name,
      pincode,
    ];

    db.query(sql, inserts, (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "Internal Server Error" });
      }

      console.log("Buyer registered successfully");
      res.status(200).json({ message: "Buyer registered successfully" });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});



module.exports = router;
