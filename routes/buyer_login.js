const express = require("express");
const router = express.Router();
const db = require("../db.js");

router.post("/", (req, res) => {
  const { buyer_email, buyer_password } = req.body;
  // console.log(buyer_email, buyer_password);

  db.query(
    "CALL buyer_Login(?, ?)",
    [buyer_email, buyer_password],
    (err, results) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).send("Database error occurred");
      }

      const loginResult = results[0][0].login;
      
      switch (loginResult) {
        case "Login successful":
          // Set loggedIn and userType in session
          req.session.loggedin = true;
          req.session.userType = 'buyer';
          req.session.email = buyer_email
          res.redirect("/");
          break;
        case "Incorrect password":
          return res.send("Incorrect password");
        case "User not found":
          return res.send("User not found");
        default:
          return res.send("Unknown error occurred");
      }
    }
  );
});

module.exports = router;
