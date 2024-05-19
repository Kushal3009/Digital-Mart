const express = require('express');
const router = express.Router();
const pool = require('../db.js');


router.get('/api/products', (req, res) => {
  // Extract search query parameters from request
  const searchTerm = req.query.searchTerm;

  // Construct SQL query to search products
  let query;
  let queryArgs;

  if (searchTerm) {
    query = `
     SELECT product_name, product_price, brand_name, product_image, product_rating FROM product p
      WHERE product_name LIKE ?
    `;
    queryArgs = [`%${searchTerm}%`];
  }
  // Execute the query
  pool.query(query, queryArgs, (error, results) => {
      if (error) {
        console.error('Error executing SQL query:', error);
        res.json({ error: 'Internal server error' });
        return;
      }
    // Send the search results back to the client
    
    res.json(results);
  });
});

module.exports = router;
