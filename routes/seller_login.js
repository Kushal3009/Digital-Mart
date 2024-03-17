const express = require("express");
const router = express.Router();
const db = require("../db.js");

router.post("/", (req, res) => {
  const { seller_email, seller_password, searchTerm } = req.body;

  db.query(
    "CALL seller_Login(?, ?)",
    [seller_email, seller_password],
    (err, results) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).send("Database error occurred");
      }

      const loginResult = results[0][0].login;

      switch (loginResult) {
        case "Login successful":
          req.session.loggedin = true;
          req.session.userType = 'seller';

          const productQuery = "CALL seller_product(?)";
          const queryArgs =  [seller_email];

          db.query(
            productQuery,
            queryArgs,
            (err, productResults) => {
              if (err) {
                console.error("Database error:", err);
                return res.send("Database error occurred");
              }
              const products = productResults[0];

              // Here, ensure that the 'products' array contains correct image URLs

              // Pass the 'products' array along with other necessary data to the index template
              res.render("index", { 
                products: products, 
                loggedIn: req.session.loggedin, 
                userType: req.session.userType 
              });
            }
          );
          break;
        case "Incorrect password":
          return res.send("Incorrect password");
        case "User not found":
          return res.send("Seller not found");
        default:
          return res.send("Unknown error occurred");
      }
    }
  );
});

module.exports = router;
