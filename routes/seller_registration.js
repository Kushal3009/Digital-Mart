const express = require("express");
const bcrypt = require("bcrypt");
const router = express.Router();
const db = require("../db.js");
const { body, validationResult } = require("express-validator");

const registrationValidationRules = [
  body("seller_name").notEmpty(),
  body("seller_email").isEmail(),
  body("seller_password").isLength({ min: 6 }),
  body("seller_phonenumber").isLength({ max: 10 })
];

router.post("/", registrationValidationRules, async (req, res) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const {
    seller_name,
    seller_email,
    seller_phonenumber,
    seller_password,
    seller_shopname
  } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(seller_password, 10);
    const sql = "CALL create_seller(?, ?, ?, ?, ?)";
    const values = [seller_name, seller_email, seller_phonenumber, hashedPassword, seller_shopname];

    db.query(sql, values, (err, result) => {
      if (err) {
        console.error("Error registering seller:", err);
        return res.status(500).json({ success: false, message: "Seller Already Register" });
      }

      console.log("Seller registered successfully");
      res.status(200).json({ success: true, message: "Seller registered successfully" });
    });
  } catch (error) {
    console.error("Error hashing password:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

router.get("/", (req, res) => {
  db.query("SELECT * FROM seller", (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ success: false, message: "Database error" });
    }

    if (result.length === 0) {
      return res.status(404).json({ success: false, message: "No sellers found" });
    }

    res.status(200).json({ success: true, sellers: result });
  });
});

module.exports = router;
