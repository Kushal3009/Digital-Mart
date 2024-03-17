const express = require("express");
const router = express.Router();
const db = require("../db.js");

router.post("/", (req, res) => {
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
    const sql = "CALL create_buyer(?, ?, ?, ?, ?, ?, ?)";
    const inserts = [
      buyer_name,
      buyer_email,
      buyer_phonenumber,
      buyer_password,
      buyer_address,
      city_name,
      pincode,
    ];

    db.query(sql, inserts, (err, result) => {
      if (err) {
        console.error(err);
        return res.send("buyer already registering");
      }

      console.log("Buyer registered successfully");
      res.render("user_login");
    });
  } catch (error) {
    console.error(error);
    res.send("Error registering buyer");
  }
});

router.get("/", (req, res) => {
  db.query("select * from buyer", (err, result) => {
    if (err) {
      console.log(err);
      return res.json({ message: err });
    }
    if (result.length === 0) {
      return res.json({ message: "No buyer found" });
    }

    res.json(result);
  });
});

module.exports = router;

// // {
//   "buyer_name":"Kushal",
//   "buyer_email":"kushal@gmail.com",
//   "buyer_password":"abc123",
//   "buyer_address":"surat",
//   "product_id":3,
//   "buyer_phonenumber":123456789,
//   "user_product_rating:":4
// }
