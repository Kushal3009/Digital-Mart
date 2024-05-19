const express = require("express");
const router = express.Router();
const db = require("../db.js");



router.get("/:product_id", (req, res) => {
  const productId = req.params.product_id;
  db.query('select * from product where product_id = ?', [productId], (err, result) => {
      if (err) {
          res.json({ error: err });
      } else {
          res.render("product", {
              product: result[0]
              // userType: req.session.userType // Pass userType to the template
          });
      }
  });
});

  

  module.exports = router;