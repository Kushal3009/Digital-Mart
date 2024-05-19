const express = require("express");
const router = express.Router();
const db = require("../db.js");
const bcrypt = require("bcrypt");

router.post("/", async (req, res) => {
  const { buyer_email, buyer_password } = req.body;
  // console.log(req.body);

  try {
    // Fetch hashed password from the database based on the email
    db.query(
      "SELECT buyer_password FROM buyer WHERE buyer_email = ?",
      [buyer_email],
      async (err, results) => {
        if (err) {
          console.error("Database error:", err);
          return res.status(500).send("Database error occurred");
        }

        // If no matching user found, return appropriate message
        if (results.length === 0) {
          return res.status(400).json({ error: 'User not found' });
        }

        // Extract hashed password from database results
        const hashedPasswordFromDB = results[0].buyer_password;

        // Compare hashed password from database with entered password
        const passwordMatch = await bcrypt.compare(
          buyer_password,
          hashedPasswordFromDB
        );

        if (passwordMatch) {
          // Set loggedIn and userType in session
          req.session.loggedin = true;
          req.session.userType = "buyer";
          req.session.email = buyer_email;

          // Transfer products from local storage to user's cart in the database
          const cart = req.session.cart || [];
          if (cart.length > 0) {
            // Iterate over each product in the local storage cart
            cart.forEach(item => {
              const product_id = item.product_id;
              const quantity = item.quantity;

              // Add product to the user's cart in the database
              db.query(
                `SELECT buyer_id FROM buyer WHERE buyer_email = ?`,
                [buyer_email],
                async (err, results) => {
                  if (err) {
                    console.error("Database error:", err);
                    // Handle database error
                  }

                  const buyer_id = results[0].buyer_id;
                  db.query(
                    `CALL addToCart(?,?,?)`,
                    [buyer_id, product_id, quantity],
                    (err, result) => {
                      if (err) {
                        console.error("Database error:", err);
                        // Handle database error
                      }
                    }
                  );
                }
              );
            });
            req.session.cart = [];
          }

          res.status(200).json({ success: true, message: "Login successful" });
        } else {
          return res.status(400).json({ error: 'Password does not match' });
        }
      }
    );
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

module.exports = router;
