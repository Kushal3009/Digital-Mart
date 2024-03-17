// Import required modules
const express = require("express");
const pool = require("./db.js");
const bodyParser = require("body-parser");
const path = require("path");
const session = require("express-session");

const PORT = 3000;
const app = express();

// Middleware
app.use((req, res, next) => {
  req.db = pool;
  next();
});
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: "secret",
    resave: true,
    saveUninitialized: true,
  })
);
app.set('view engine', 'ejs'); 

// Router
app.use("/api/seller_registration", require("./routes/seller_registration.js"));
app.use("/api/buyer_registration", require("./routes/buyer_registration.js"));
app.use("/api/seller_login", require("./routes/seller_login.js"));
app.use("/api/buyer_login", require("./routes/buyer_login.js"));
// Add this line to use the search route



// Routes
app.get("/user", (req, res) => {
  if (req.session.loggedin && req.session.userType === "user") {
    res.render("user_form");
  } else {
    res.redirect("/");
  }
});

app.get("/seller", (req, res) => {
  if (req.session.loggedin && req.session.userType === "seller") {
    res.render("seller_form");
  } else {
    res.redirect("/");
  }
});

app.get("/user_login", (req, res) => {
  res.render("user_login");
});

app.get("/seller_login", (req, res) => {
  res.render("seller_login");
});

// Logout route
app.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/");
  });
});



// Index route
app.get("/", (req, res) => {
  const page = parseInt(req.query.page) || 1; 
  const itemsPerPage = 12; 
  const offset = (page - 1) * itemsPerPage; 

  function getTotalPages(totalItems, itemsPerPage) {
    return Math.ceil(totalItems / itemsPerPage);
  }

  
  pool.query(
    "SELECT product_name, product_price, brand_name, product_image, product_rating, product_total_ratings,product_id FROM product p LIMIT ?, ?",
    [offset, itemsPerPage],
    (err, products) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).send("Database error occurred");
      }

      pool.query("SELECT COUNT(*) AS total FROM product", (err, result) => {
        if (err) {
          console.error("Database error:", err);
          return res.status(500).send("Database error occurred");
        }

        const totalProducts = result[0].total;
        const totalPages = getTotalPages(totalProducts, itemsPerPage);

        const pages = [];
        for (let i = 1; i <= totalPages; i++) {
          pages.push({
            page: i,
            active: i === page
          });
        }

        res.render("home", {
          products: products,
          currentPage: page,
          totalPages: totalPages,
          pages: pages,
          loggedIn: req.session.loggedin,
          userType: req.session.userType
        });
      });
    }
  );
});




// Finding the products 
app.get('/api/products', (req, res) => {
  let searchTerm = req.query.searchTerm;
  console.log(searchTerm);
  const page = parseInt(req.query.page) || 1; 
  console.log(page);
  const itemsPerPage = 12;
  const offset = (page - 1) * itemsPerPage; 

  let query;
  let queryArgs;

  if (searchTerm) {
    query = `
      SELECT product_id, product_name, product_price, brand_name, product_image, product_rating, product_total_ratings FROM product p
      WHERE product_name LIKE ?
      LIMIT ?, ?
    `;
    queryArgs = [`%${searchTerm}%`, offset, itemsPerPage];
  } else {
    query = `
      SELECT product_name, product_price, brand_name, product_image, product_rating,product_total_ratings FROM product
      LIMIT ?, ?
    `;
    queryArgs = [offset, itemsPerPage];
  }

  // Execute the query
  pool.query(query, queryArgs, (error, results) => {
    if (error) {
      console.error('Error executing SQL query:', error);
      res.json({ error: 'Internal server error' });
      return;
    }

    // Query total number of products for pagination
    let totalProductsQuery;
    let totalProductsArgs;

    if (searchTerm) {
      totalProductsQuery = "SELECT COUNT(*) AS total FROM product WHERE product_name LIKE ?";
      totalProductsArgs = [`%${searchTerm}%`];
    } else {
      totalProductsQuery = "SELECT COUNT(*) AS total FROM product";
      totalProductsArgs = [];
    }

    pool.query(totalProductsQuery, totalProductsArgs, (err, result) => {
      if (err) {
        console.error('Error executing SQL query:', err);
        res.json({ error: 'Internal server error' });
        return;
      }
      // console.log(results)
      const totalProducts = result[0].total;
      const totalPages = Math.ceil(totalProducts / itemsPerPage);
      // console.log(results);
      // Send the search results and pagination information back to the client
      res.render("home",{
        products: results,
        totalPages: totalPages,
        currentPage: page,
        totalPages: totalPages,
        pages: page,
        loggedIn: req.session.loggedin,
        userType: req.session.userType,
      });
    });
  });
});





app.get("/product_details/:product_id",(req,res)=>{
  const productId = req.params.product_id;
  pool.query('select * from product where product_id = ?', [productId],(err, product)=>{
    if(err){
      res.json({error:err})
    }else{
      res.render("product",{product :product[0]});
    }
  })
})

app.get("/add_cart/:product_id", (req, res) => {
  if (req.session.loggedin === true || req.session.userType === "buyer") {
      const buyer_email = req.session.email;
      const product_id = req.params.product_id;

      pool.query(`SELECT buyer_id FROM buyer WHERE buyer_email = ?`, [buyer_email], (err, result) => {
          if (err) {
              console.log(err);
              // Send an appropriate response or redirect to an error page
              return res.status(500).send("Internal Server Error");
          } else {
              const buyer_id = result[0].buyer_id;
              pool.query('INSERT INTO cart (buyer_id, product_id) VALUES (?, ?)', [buyer_id, product_id], (err, result) => {
                  if (err) {
                      console.log(err);
                      // Send an appropriate response or redirect to an error page
                      return res.status(500).send("Internal Server Error");
                  } else {
                      // Redirect to cart page after successful insertion
                      return res.json({message:"Product Add successfully"});
                  }
              });
          }
      });
  } else {
      res.redirect('/user_login');
  }
});


app.get('/cart', async (req, res) => {
  const buyer_email = req.session.email;
  
  // Fetch buyer_id from the database
  pool.query(`SELECT buyer_id FROM buyer WHERE buyer_email = ?`, [buyer_email], (err, buyerResult) => {
    if (err) {
      console.error('Error fetching buyer_id:', err);
      return res.status(500).send('Internal Server Error');
    }
    
    // Check if buyerResult is empty or not
    if (!buyerResult || !buyerResult[0] || !buyerResult[0].buyer_id) {
      console.error('Buyer not found or buyer_id is missing');
      return res.status(404).send('Buyer not found');
    }
    
    const buyer_id = buyerResult[0].buyer_id;
    
    // Call the stored procedure 'cart' with the buyer_id
    const query = "CALL cart(?)";
    pool.query(query, [buyer_id], (err, cartResult) => {
      if (err) {
        console.error('Error fetching cart data:', err);
        return res.status(500).send('Internal Server Error');
      }
      
      // Extract cart data from the result
      const cartItems = cartResult[0];

      // Render the 'cart' view with cart data
      res.render('cart', { cartItems });
    });
  });
});


app.delete('/cart/:itemId', async (req, res) => {
  const itemId = req.params.itemId;

  // Perform deletion operation in the database
  pool.query('DELETE FROM cart WHERE item_id = ?', [itemId], (err, result) => {
    if (err) {
      console.error('Error deleting item from cart:', err);
      return res.status(500).send('Internal Server Error');
    }
    
    // Check if any rows were affected by the deletion
    if (result.affectedRows === 0) {
      console.error('Item not found in cart');
      return res.status(404).send('Item not found in cart');
    }

    // Item deleted successfully
    res.status(200).send('Item deleted from cart');
  });
});




app.listen(PORT, () => {
  console.log(`Server is running on port http://localhost:${PORT}`);
});
