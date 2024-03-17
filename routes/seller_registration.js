const express = require("express");
const router = express.Router();
const db = require("../db.js");



router.post("/", (req, res) => {
  // Extract seller data from request body
  const {
    seller_name,
    seller_email,
    seller_phonenumber,
    seller_password,
    seller_shopname
  } = req.body;

  // Call the stored procedure to insert seller data into the database
  const sql = "CALL create_seller(?, ?, ?, ?, ?)";
  const values = [seller_name, seller_email, seller_phonenumber, seller_password, seller_shopname];

  // Execute SQL query
  db.query(sql, values, (err, result) => {
    if (err) {
      console.error("Error registering seller:", err);
      return res.status(500).send("Error registering seller");
    }

    console.log("Seller registered successfully");
    res.status(200).send("Seller registered successfully");
  });
});






















router.get("/", (req, res) => {
  db.query("select * from seller", (err, result) => {
    if (err) {
      console.log(err);
      return res.json({ message: err });
    }
    if (result.length === 0) {
      return res.status(404).json({ message: "No sellers found" });
    }

    res.status(200).json(result);
  });
});

module.exports = router;


// {
//   "seller_name":"xyz",
//   "seller_email":"xyz@.com",
//   "seller_phonenumber":7894562123,
//   "seller_password":"abc123",
//   "seller_shopname":"myshop",
// }