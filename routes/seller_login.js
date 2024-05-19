const express = require("express");
const router = express.Router();
const db = require("../db.js");
const bcrypt = require("bcrypt");
const util = require("util");
const query = util.promisify(db.query).bind(db);

router.post("/", async (req, res) => {
  const { seller_email, seller_password } = req.body;
  // console.log(req.body);

  try {
    // Fetch hashed password from the database based on the email
    db.query(
      "SELECT seller_password FROM seller WHERE seller_email = ?",
      [seller_email],
      async (err, result) => {
        if (err) {
          console.log(err);
        }
        // If no matching user found, return appropriate message
        if (result.length === 0) {
          return res.status(404).json({ error: "Seller not found" });
        }

        // Extract hashed password from database results
        const hashedPasswordFromDB = result[0].seller_password;

        // Compare hashed password from database with entered password
        const passwordMatch = await bcrypt.compare(
          seller_password,
          hashedPasswordFromDB
        );

        if (passwordMatch) {
          // Set loggedIn and userType in session
          req.session.loggedin = true;
          req.session.userType = "seller";
          req.session.email = seller_email;
          res.status(200).json({ success: true, message: "Login successful" });
        } else {
          console.log("password not match");
          return res.status(401).json({ error: "Password does not match" });
        }
      }
    );
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

module.exports = router;
