// Import required modules
const express = require("express");
const pool = require("./db.js");
const bodyParser = require("body-parser");
const path = require("path");
const session = require("express-session");
const methodOverride = require("method-override");
const multer = require("multer");
const nodemailer = require("nodemailer");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcrypt");

const PORT = 3000;
const app = express();
app.use("/public/", express.static("./public"));

// Middleware

app.use((req, res, next) => {
  req.db = pool;
  next();
});
app.use(cookieParser());
app.use(methodOverride("_method"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: "secret",
    resave: true,
    saveUninitialized: true,
  })
);
app.set("view engine", "ejs");

// Router
app.use("/api/seller_registration", require("./routes/seller_registration.js"));
app.use("/api/buyer_registration", require("./routes/buyer_registration.js"));
app.use("/api/seller_login", require("./routes/seller_login.js"));
app.use("/api/buyer_login", require("./routes/buyer_login.js"));
app.use("/api/allOrders", require("./routes/allOrders.js"));

// Multer setup for handling file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public\\images");
  },
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

const upload = multer({ storage: storage });

app.get("/user_registration", (req, res) => {
  res.render("user_form");
});
app.get("/seller_registration", (req, res) => {
  res.render("seller_form");
});

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
  res.render("user_login", { error: "no" });
});

app.get("/seller_login", (req, res) => {
  res.render("seller_login", { error: "no" });
});

// Logout route
app.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/");
  });
});

// Index route
app.get("/", (req, res) => {
  const buyer_email = req.session.email;
  // console.log(buyer_email)
  if (req.session.userType === "buyer") {
    pool.query(
      `SELECT * FROM product p where visibility = 1 LIMIT 4`,
      (err, products) => {
        if (err) {
          console.error("Database error:", err);
          return res.status(500).send("Database error occurred");
        }

        pool.query(
          "SELECT buyer_name FROM buyer WHERE buyer_email = ?",
          [buyer_email],
          (err, result) => {
            if (err) {
              console.error("Database error:", err);
              return res.status(500).send("Database error occurred");
            }
            const userName = result[0].buyer_name;
            req.session.userName = userName;
            pool.query(
              "select buyer_id from buyer where buyer_email = ?",
              [buyer_email],
              (err, result) => {
                if (err) {
                  console.log(err);
                }
                buyer_id = result[0].buyer_id;
                req.session.buyer_id = buyer_id;
                // console.log("buyer_id",buyer_id)
                pool.query(
                  "SELECT COUNT(*) AS total_items FROM cart WHERE buyer_id = ?;",
                  [buyer_id],
                  (err, total) => {
                    if (err) {
                      console.log(err);
                    }
                    // console.log(total)
                    cartCount = total[0].total_items;
                    req.session.cartCount = cartCount;
                    res.render("index", {
                      products: products,
                      userName: req.session.userName,
                      loggedIn: req.session.loggedin,
                      userType: req.session.userType,
                      cartCount: req.session.cartCount,
                    });
                  }
                );
              }
            );
          }
        );
      }
    );
  } else if (req.session.userType == "seller") {
    let seller_email = req.session.email;

    const productQuery = "CALL seller_product(?)";
    const queryArgs = [seller_email];

    pool.query(productQuery, queryArgs, (err, productResults) => {
      if (err) {
        console.error("Database error:", err);
        return res.send("Database error occurred");
      }
      const products = productResults[0];
      pool.query(
        "SELECT seller_name FROM seller where seller_email = ? ",
        [seller_email],
        (err, result) => {
          if (err) {
            console.error("Database error:", err);
            return res.status(500).send("Database error occurred");
          }

          const userName = result[0].seller_name;
          req.session.userName = userName;
          pool.query(
            "select buyer_id from buyer where buyer_email = ?",
            [buyer_email],
            (err, result) => {
              if (err) {
                console.log(err);
              }
              buyer_id = result[0].buyer_id;
              // console.log("buyer_id",buyer_id)
              pool.query(
                "SELECT COUNT(*) AS total_items FROM cart WHERE buyer_id = ?;",
                [buyer_id],
                (err, total) => {
                  if (err) {
                    console.log(err);
                  }
                  // console.log(total)
                  cartCount = total[0].total_items;
                  req.session.cartCount = cartCount;
                  res.render("allProducts", {
                    products: products,
                    userName: req.session.userName,
                    loggedIn: req.session.loggedin,
                    userType: req.session.userType,
                    cartCount: req.session.cartCount,
                    message: null,
                  });
                }
              );
            }
          );
        }
      );
    });
  } else {
    pool.query(
      "SELECT * FROM product p where visibility = 1 LIMIT 4",
      (err, products) => {
        if (err) {
          console.error("Database error:", err);
          return res.status(500).send("Database error occurred");
        }
        req.session.userName = undefined;
        req.session.loggedIn = res.render("index", {
          products: products,
          loggedIn: false,
          userType: req.session.userType,
          userName: req.session.userName,
        });
      }
    );
  }
});

// Finding the products
app.post("/searchProducts", (req, res) => {
  const searchTerm = req.body.searchTerm; // Get search term from request body

  // SQL query to search for products
  const query = `
    SELECT * FROM product
    WHERE product_name LIKE ? 
  `;

  // Execute the query
  pool.query(query, [`%${searchTerm}%`], (error, results) => {
    if (error) {
      console.error("Error executing MySQL query: " + error.stack);
      return res.status(500).json({ error: "Internal server error" });
    }

    // Check if products are found
    if (results.length === 0) {
      // Render the page with a message indicating no products found
      res.render("allProducts", {
        loggedIn: req.session.loggedin,
        userType: req.session.userType,
        userName: req.session.userName,
        cartCount: req.session.cartCount,
        message: "Products Not Found",
      });
    } else {
      // Render the page with the products
      res.render("allProducts", {
        products: results,
        loggedIn: req.session.loggedin,
        userType: req.session.userType,
        userName: req.session.userName,
        cartCount: req.session.cartCount,
        message: null,
      });
    }
  });
});

app.get("/allProducts", (req, res) => {
  const query = "SELECT * FROM product WHERE visibility = 1";

  pool.query(query, (err, result) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).send("Database error occurred");
    }

    // Set default values for loggedIn, userType, and userName
    let loggedIn = false;
    let userType = null;
    let userName = null;

    // Check if the user is logged in
    if (req.session.loggedin === true && req.session.userType === "buyer") {
      loggedIn = true;
      userType = req.session.userType;
      userName = req.session.userName;
    }
    console.log(req.session.cartCount);
    res.render("allProducts", {
      products: result,
      loggedIn: loggedIn,
      userType: userType,
      userName: userName,
      cartCount: req.session.cartCount,
      message: null,
    });
  });
});

// product details page
app.get("/brands", (req, res) => {
  const brand_name = req.query.brand_name;
  const query = `SELECT * FROM product WHERE brand_name = ?`;

  pool.query(query, [brand_name], (err, result) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).send("Database error occurred");
    }

    // Check if the user is logged in as a buyer
    const loggedIn =
      req.session.loggedin === true && req.session.userType === "buyer";

    // Render the appropriate page based on whether products are found
    if (result.length === 0) {
      if (loggedIn) {
        return res.render("allProducts", {
          message: "No Products Found",
          userType: req.session.userType,
          loggedIn: true,
          userName: req.session.userName,
        });
      } else {
        return res.render("allProducts", {
          userType: req.session.userType,
          loggedIn: req.session.loggedIn,
          userName: req.session.userName,
          cartCount: req.session.cartCount,
          message: "No Products Found",
        });
      }
    } else {
      return res.render("allProducts", {
        products: result,
        userType: req.session.userType,
        loggedIn: loggedIn,
        userName: req.session.userName,
        cartCount: req.session.cartCount,
        message: null,
      });
    }
  });
});

app.get("/category", (req, res) => {
  const category_name = req.query.category_name;
  const query = `SELECT * FROM product WHERE category_name = ?`;

  pool.query(query, [category_name], (err, result) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).send("Database error occurred");
    }

    // Check if the user is logged in as a buyer
    const loggedIn =
      req.session.loggedin === true && req.session.userType === "buyer";

    // Render the appropriate page based on whether products are found
    if (result.length === 0) {
      if (loggedIn) {
        return res.render("allProducts", {
          message: "No Products Found",
          userType: req.session.userType,
          loggedIn: true,
          userName: req.session.userName,
          cartCount: req.session.cartCount,
        });
      } else {
        return res.render("allProducts", {
          userType: req.session.userType,
          loggedIn: req.session.loggedIn,
          userName: req.session.userName,
          cartCount: req.session.cartCount,
          message: "No Products Found",
        });
      }
    } else {
      return res.render("allProducts", {
        products: result,
        userType: req.session.userType,
        loggedIn: loggedIn,
        userName: req.session.userName,
        cartCount: req.session.cartCount,
        message: null,
      });
    }
  });
});

app.get("/product_details/:product_id", (req, res) => {
  console.log(req.session.loggedIn);
  const productId = req.params.product_id;
  pool.query(
    "select * from product where product_id = ?",
    [productId],
    (err, product) => {
      if (err) {
        res.json({ error: err });
      } else {
        pool.query(
          "SELECT COUNT(*) AS total_items FROM cart WHERE buyer_id = ?;",
          [req.session.buyer_id],
          (err, result) => {
            if (err) {
              console.log(err);
            } else {
              cartCount = result[0].total_items;
              req.session.cartCount = cartCount;
              res.render("product", {
                product: product[0],
                userType: req.session.userType,
                loggedIn: req.session.loggedin,
                userName: req.session.userName,
                cartCount: req.session.cartCount,
              });
            }
          }
        );
      }
    }
  );
});

app.get("/add_cart/:product_id", (req, res) => {
  if (req.session.loggedin === true || req.session.userType === "buyer") {
    const buyer_email = req.session.email;
    let product_id = req.params.product_id;
    product_id = Number(product_id);
    let quantity;
    if (req.query.quantity) {
      quantity = req.query.quantity;
      quantity = parseInt(quantity);
    } else {
      quantity = 1;
    }

    pool.query(
      `SELECT buyer_id FROM buyer WHERE buyer_email = ?`,
      [buyer_email],
      (err, result) => {
        if (err) {
          console.log(err);
          return res.status(500).send("Internal Server Error");
        } else {
          const buyer_id = result[0].buyer_id;
          pool.query(
            `CALL addToCart(?,?,?)`,
            [buyer_id, product_id, quantity],
            (err, result) => {
              if (err) {
                console.log(err);
                return res.status(500).send("Internal Server Error");
              } else {
                return res.json({ message: "Product added successfully" });
              }
            }
          );
        }
      }
    );
  } else {
    // If user is not logged in, store product in localStorage
    const product_id = req.params.product_id;
    let cart = req.session.cart || []; // Retrieve cart from session or initialize empty array
    let quantity = req.query.quantity ? parseInt(req.query.quantity) : 1;

    // Check if the product is already in the cart, update quantity if so, otherwise add it to the cart
    let existingProductIndex = cart.findIndex(
      (item) => item.product_id === product_id
    );
    if (existingProductIndex !== -1) {
      cart[existingProductIndex].quantity += quantity;
    } else {
      cart.push({ product_id, quantity });
    }

    req.session.cart = cart; // Update the cart in session

    return res.json({ message: "Product added successfully" });
  }
});

// get cart details
app.get("/cart", async (req, res) => {
  const buyer_email = req.session.email;

  // Fetch buyer_id from the database
  pool.query(
    `SELECT buyer_id FROM buyer WHERE buyer_email = ?`,
    [buyer_email],
    (err, buyerResult) => {
      if (err) {
        console.error("Error fetching buyer_id:", err);
        return res.status(500).send("Internal Server Error");
      }

      // Check if buyerResult is empty or not
      if (!buyerResult || !buyerResult[0] || !buyerResult[0].buyer_id) {
        console.error("Buyer not found or buyer_id is missing");
        return res.status(404).send("Buyer not found");
      }

      const buyer_id = buyerResult[0].buyer_id;

      // Call the stored procedure 'cart' with the buyer_id
      const query = "CALL cart(?)";
      pool.query(query, [buyer_id], (err, cartResult) => {
        if (err) {
          console.error("Error fetching cart data:", err);
          return res.status(500).send("Internal Server Error");
        }

        // Extract cart data from the result
        const cartItems = cartResult[0];
        pool.query(
          "SELECT COUNT(*) AS total_items FROM cart WHERE buyer_id = ?;",
          [buyer_id],
          (err, result) => {
            result = result[0];
            if (err) {
              console.log(err);
            } else {
              pool.query(
                `SELECT SUM(c.quantity * p.product_price) AS total_cart_price
              FROM cart c
              JOIN product p ON c.product_id = p.product_id
              WHERE c.buyer_id = ?;
              `,
                [buyer_id],
                (err, total) => {
                  if (err) {
                    console.log(err);
                  } else {
                    total = total[0];
                    res.render("cart", {
                      cartItems,
                      result,
                      total,
                      userType: req.session.userType,
                      loggedIn: req.session.loggedin,
                      userName: req.session.userName,
                      cartCount: req.session.cartCount,
                    });
                  }
                }
              );
            }
          }
        );
        // Render the 'cart' view with cart data
      });
    }
  );
});

// delete from the cart
app.post("/cart/:itemId", async (req, res) => {
  const cart_id = req.params.itemId; // Use req.params.itemId to get the cart_id
  // console.log(cart_id);
  const buyer_email = req.session.email;

  pool.query(
    `SELECT buyer_id FROM buyer WHERE buyer_email = ?`,
    [buyer_email],
    (err, buyerResult) => {
      if (err) {
        console.error("Error fetching buyer_id:", err);
        return res.status(500).send("Internal Server Error");
      }

      // Check if buyerResult is empty or not
      if (!buyerResult || !buyerResult[0] || !buyerResult[0].buyer_id) {
        console.error("Buyer not found or buyer_id is missing");
        return res.status(404).send("Buyer not found");
      }

      const buyer_id = buyerResult[0].buyer_id;

      // Perform deletion operation in the database
      pool.query("SET foreign_key_checks = 0;", (err, result) => {
        if (err) {
          console.log(err);
        } else {
          pool.query(
            "DELETE FROM cart WHERE cart_id = ? and buyer_id = ?;",
            [cart_id, buyer_id],
            (err, result) => {
              if (err) {
                console.error("Error deleting item from cart:", err);
                return res.status(500).send("Internal Server Error");
              }

              // Check if any rows were affected by the deletion
              if (result.affectedRows === 0) {
                console.error("Item not found in cart");
                return res.status(404).send("Item not found in cart");
              }
              // Item deleted successfully
              res.status(200).redirect("/cart");
            }
          );
        }
      });
    }
  );
});

app.get("/address_payment", (req, res) => {
  const buyer_email = req.session.email;
  if (req.session.loggedin && req.session.userType) {
    // Check if logged in and has userType
    pool.query(
      "select buyer_address from buyer where buyer_email = ?",
      [buyer_email],
      (err, result) => {
        if (err) {
          console.log(err);
        } else {
          res.render("address_payment", { result });
        }
      }
    );
  } else {
    res.redirect("/user_login", { error: "no" }); // Redirect to login if not logged in
  }
});

app.post("/address_payment", (req, res) => {
  const buyer_email = req.session.email;
  if (req.session.loggedin && req.session.userType) {
    // Check if logged in and has userType
    db.query("insert into address(buyer_email, buyer_address");
  } else {
    res.redirect("/user_login", { error: "no" }); // Redirect to login if not logged in
  }
});

// Address confirmation from product page
app.get("/address/:context/:product_id/:quantity", (req, res) => {
  const buyer_email = req.session.email;
  const productId = req.params.product_id;
  const context = req.params.context;
  const quantity = req.params.quantity;
  // console.log(quantity);

  if (req.session.loggedin && req.session.userType) {
    pool.query(
      "SELECT buyer_address FROM address WHERE buyer_email = ?",
      [buyer_email],
      (err, result) => {
        if (err) {
          console.error(err);
          res.status(500).send("Internal Server Error");
        } else {
          // console.log(result);
          res.render("address", {
            addresses: result,
            product_id: productId,
            context: context,
            quantity: quantity,
            userType: req.session.userType,
            loggedIn: req.session.loggedin,
            userName: req.session.userName,
          });
        }
      }
    );
  } else {
    res.redirect("/user_login", { error: "no" });
  }
});

// Address confirmation from add to cart
app.get("/address", (req, res) => {
  const buyer_email = req.session.email;
  const productId = 1;
  const context = "cart";
  const quantity = 2;

  if (req.session.loggedin && req.session.userType) {
    pool.query(
      "SELECT buyer_address FROM address WHERE buyer_email = ?",
      [buyer_email],
      (err, result) => {
        if (err) {
          console.error(err);
          res.status(500).send("Internal Server Error");
        } else {
          // console.log(result);
          res.render("address", {
            addresses: result,
            product_id: productId,
            context: context,
            quantity: quantity,
            loggedIn: req.session.loggedin,
            userType: req.session.userType,
            userName: req.session.userName,
          });
        }
      }
    );
  } else {
    res.redirect("/user_login", { error: "no" });
  }
});

// add new Address
app.post("/address", (req, res) => {
  const buyer_email = req.session.email;

  if (req.session.loggedin && req.session.userType) {
    const newAddress = req.body.newAddress;
    // console.log(newAddress);
    if (newAddress) {
      // Add the new address to the database for the logged-in buyer
      pool.query(
        "INSERT INTO address (buyer_email, buyer_address) VALUES (?, ?)",
        [buyer_email, newAddress],
        (err, result) => {
          if (err) {
            console.error(err);
            res.status(500).send("Internal Server Error");
          } else {
            // console.log("New address added:", newAddress);
            // Redirect to the order summary page with the selected address as a query parameter
            res.redirect(`/address`);
          }
        }
      );
    } else {
      res.status(400).send("Please provide a new address");
    }
  } else {
    res.redirect("/user_login", { error: "no" });
  }
});

// order summary
app.get("/order_summary/:context/:product_id/:quantity", (req, res) => {
  const buyer_email = req.session.email;
  const selectedAddress = req.query.selectedAddress;

  if (!buyer_email) {
    return res.redirect("/user_login", { error: "no" });
  }

  const context = req.params.context; // Retrieve the context from URL parameter

  if (context === "product_page") {
    const product_id = req.params.product_id; // Retrieve product_id from query parameters
    const quantity = req.params.quantity;

    // Fetch the product information based on the product_id
    pool.query(
      "SELECT product_id, product_image, product_price, product_name, ? AS quantity FROM product WHERE product_id = ?",
      [quantity, product_id],
      (err, productResult) => {
        if (err) {
          console.error(err);
          return res.status(500).send("Internal Server Error");
        }
        // Render the order_summary view with only the selected product
        res.render("order_summary", {
          context: context,
          products: productResult,
          selectedAddress: selectedAddress,
          product_id: product_id,
          quantity: quantity,
          product_price: productResult[0].product_price,
          loggedIn: req.session.loggedin,
          userType: req.session.userType,
          userName: req.session.userName,
        });
      }
    );
  } else {
    // If the context is not 'product_page', handle accordingly (e.g., fetching products from the cart)
    pool.query(
      "SELECT p.product_image, p.product_price, p.product_name, c.quantity FROM cart c JOIN product p ON p.product_id = c.product_id WHERE c.buyer_id = (SELECT buyer_id FROM buyer WHERE buyer_email = ?)",
      [buyer_email],
      (err, cartResult) => {
        if (err) {
          console.error(err);
          return res.status(500).send("Internal Server Error");
        }
        pool.query(
          `SELECT SUM(total_cart_price) AS total_cart_price FROM (SELECT SUM(c.quantity * p.product_price) AS total_cart_price FROM cart c JOIN product p ON p.product_id = c.product_id WHERE c.buyer_id = (SELECT buyer_id FROM buyer WHERE buyer_email = ?) GROUP BY c.buyer_id, p.product_id) AS subquery
      `,
          [buyer_email],
          (err, total_price) => {
            if (err) {
              console.log(err);
            } else {
              res.render("order_summary", {
                context: "cart",
                products: cartResult,
                selectedAddress: selectedAddress,
                loggedIn: req.session.loggedin,
                userType: req.session.userType,
                userName: req.session.userName,
              });
            }
          }
        );
        // Render the order_summary view with all the products in the cart
      }
    );
  }
});

// go to payment Page
app.get("/payment", (req, res) => {
  const buyer_email = req.session.email;
  const context = req.query.context;
  const product_id = req.query.product_id;
  const price = req.query.product_price;
  const quantity = req.query.quantity;
  // console.log("context", context);
  // console.log("product_id", product_id);
  // console.log("quantity", quantity);

  if (context == "product_page") {
    // console.log("hi");
    pool.query(
      `SELECT buyer_id FROM buyer WHERE buyer_email = ?`,
      [buyer_email],
      (err, buyerResult) => {
        if (err) {
          console.error("Error fetching buyer_id:", err);
          return res.status(500).send("Internal Server Error");
        }
        const total_cart_price = parseInt(quantity) * parseInt(price);
        // console.log(result)
        res.render("payment", {
          total: total_cart_price,
          loggedIn: req.session.loggedin,
          userType: req.session.userType,
          userName: req.session.userName,
          context: context,
          product_id: product_id,
          quantity: quantity,
          error: null,
        });
      }
    );
  } else {
    pool.query(
      `SELECT buyer_id FROM buyer WHERE buyer_email = ?`,
      [buyer_email],
      (err, buyerResult) => {
        if (err) {
          console.error("Error fetching buyer_id:", err);
          return res.status(500).send("Internal Server Error");
        }

        // Check if buyerResult is empty or not
        if (!buyerResult || !buyerResult[0] || !buyerResult[0].buyer_id) {
          console.error("Buyer not found or buyer_id is missing");
          return res.status(404).send("Buyer not found");
        }

        const buyer_id = buyerResult[0].buyer_id;

        // Call the stored procedure 'cart' with the buyer_id
        const query = "CALL cart(?)";
        pool.query(query, [buyer_id], (err, cartResult) => {
          if (err) {
            console.error("Error fetching cart data:", err);
            return res.status(500).send("Internal Server Error");
          }

          // Extract cart data from the result
          const cartItems = cartResult[0];
          pool.query(
            `SELECT SUM(c.quantity * p.product_price) AS total_cart_price
                FROM cart c
                JOIN product p ON c.product_id = p.product_id
                WHERE c.buyer_id = ?;
                `,
            [buyer_id],
            (err, total) => {
              if (err) {
                console.log(err);
              } else {
                total = total[0];
                res.render("payment", {
                  total: total,
                  loggedIn: req.session.loggedin,
                  userType: req.session.userType,
                  userName: req.session.userName,
                  context: null,
                  product_id: null,
                  quantity: null,
                  error: null,
                });
              }
            }
          );
        });
      }
    );
  }
});

function sendEmail(email) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "kushalpadhiyar030@gmail.com",
      pass: "fcwe ygxm tcnd qlrk",
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  // Get the current date
  const orderDate = new Date();
  // Clone the current date and add 4 days for the delivery date
  const deliveryDate = new Date(orderDate);
  deliveryDate.setDate(deliveryDate.getDate() + 4);

  // Format the delivery date to a readable string
  const formattedDeliveryDate = deliveryDate.toLocaleDateString();

  // Set up the email options
  const mailOptions = {
    from: "kushalpadhiyar030@gmail.com",
    to: email,
    subject: "Delivery Address Date",
    text: `The expected delivery date of your product is: ${formattedDeliveryDate}`,
  };

  // Send the email
  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });
}

app.post("/payment", async (req, res) => {
  const paymentMethod = req.body.paymentMethod;
  const buyer_email = req.session.email;
  console.log(buyer_email);
  const product_id = req.query.product_id;
  const quantity = req.query.quantity;
  // const product_price = req.query.product_price;
  const context = req.query.context;
  console.log(product_id);

  try {
    const connection = await pool.promise().getConnection();

    if (context === "product_page") {
      const [buyerResult] = await connection.query(
        "SELECT buyer_id FROM buyer WHERE buyer_email = ?",
        [buyer_email]
      );
      const buyer_id = buyerResult[0].buyer_id;
      await connection.query("SET foreign_key_checks = 0;");

      await connection.query(
        "INSERT INTO orders (buyer_id, product_id, quantity) VALUES (?, ?, ?)",
        [buyer_id, product_id, quantity]
      );

      const [productResult] = await connection.query(
        "SELECT product_name, discount_price FROM product WHERE product_id = ?",
        [product_id]
      );
      // console.log(product_name, discount_price)
      
      await sendEmail(buyer_email);
      connection.release();
      return res.redirect("/");
    }

    const [buyerResult] = await connection.query(
      "SELECT buyer_id FROM buyer WHERE buyer_email = ?",
      [buyer_email]
    );

    if (!buyerResult || !buyerResult[0] || !buyerResult[0].buyer_id) {
      console.error("Buyer not found or buyer_id is missing");
      connection.release();
      return res.status(404).send("Buyer not found");
    }

    const buyer_id = buyerResult[0].buyer_id;
    await connection.query("SET foreign_key_checks = 0;");
    const [productResult] = await connection.query(
      "SELECT p.product_name, p.discount_price FROM product p join cart c on p.product_id = c.product_id where buyer_id = ?",
      [buyer_id]
    );
    const productList = [];

    for (const product of productResult) {
      const { product_name, discount_price } = product;
      productList.push({ product_name, discount_price });
    }

    await connection.query(
      "INSERT INTO orders (cart_id, buyer_id, product_id, quantity) SELECT cart_id, buyer_id, product_id, quantity FROM cart WHERE buyer_id = ?",
      [buyer_id]
    );

    // Update product stock based on the total quantity ordered by the buyer
    await connection.query(
      "UPDATE product SET product_stock = product_stock - ? WHERE product_id = ?",
      [quantity, product_id]
    );

    await connection.query("DELETE FROM cart WHERE buyer_id = ?", [buyer_id]);
    await sendEmail(buyer_email);
    connection.release();
    res.redirect("/");
  } catch (err) {
    console.error("Error processing payment:", err);
    return res.status(500).send("Internal Server Error");
  }
});

app.get("/orders", async (req, res) => {
  const buyer_email = req.session.email;
  // Fetch buyer_id from the database
  pool.query(
    `SELECT buyer_id FROM buyer WHERE buyer_email = ?`,
    [buyer_email],
    (err, buyerResult) => {
      if (err) {
        console.error("Error fetching buyer_id:", err);
        return res.status(500).send("Internal Server Error");
      }

      // Check if buyerResult is empty or not
      if (!buyerResult || !buyerResult[0] || !buyerResult[0].buyer_id) {
        console.error("Buyer not found or buyer_id is missing");
        return res.status(404).send("Buyer not found");
      }

      const buyer_id = buyerResult[0].buyer_id;

      // Call the stored procedure 'cart' with the buyer_id
      const query = "CALL orders(?)";
      pool.query(query, [buyer_id], (err, orderResult) => {
        if (err) {
          console.error("Error fetching cart data:", err);
          return res.status(500).send("Internal Server Error");
        }
        // Extract cart data from the result
        const orderItems = orderResult[0];
        pool.query(
          "SELECT COUNT(*) AS total_items FROM orders WHERE buyer_id = ?;",
          [buyer_id],
          (err, result) => {
            result = result[0];
            if (err) {
              console.log(err);
            } else {
              res.render("myorders", {
                orderItems,
                result,
                loggedIn: req.session.loggedin,
                userType: req.session.userType,
                userName: req.session.userName,
                cartCount: req.session.cartCount,
              });
            }
          }
        );
      });
    }
  );
});

app.post("/rating/:order_id/:product_id", (req, res) => {
  const order_id = parseInt(req.params.order_id);
  const product_id = parseInt(req.params.product_id);
  const rating = parseInt(req.body.rating); // Assuming rating is a float or decimal

  // Check if the user has already rated the product for this order
  pool.query(
    "SELECT * FROM orders WHERE order_id = ? AND product_id = ?",
    [order_id, product_id],
    (err, result) => {
      if (err) {
        console.error("Error checking existing rating:", err);
        return res.status(500).send("Error checking existing rating");
      }

      pool.query(
        "UPDATE orders SET rating = ? WHERE order_id = ? AND product_id = ?",
        [rating, order_id, product_id],
        (err, result) => {
          if (err) {
            console.error("Error updating order rating:", err);
            return res.status(500).send("Error updating order rating");
          } else {
            pool.query(
              "UPDATE product SET product_total_ratings = product_total_ratings + 1 WHERE product_id = ?",
              [product_id],
              (err, result) => {
                if (err) {
                  console.error("Error updating product_total_ratings:", err);
                  return res
                    .status(500)
                    .send("Error updating product_total_ratings");
                } else {
                  pool.query(
                    "UPDATE product SET product_rating = (SELECT AVG(rating) FROM orders WHERE product_id = ?) WHERE product_id = ?",
                    [product_id, product_id],
                    (err, result) => {
                      if (err) {
                        console.error("Error updating product_rating:", err);
                        return res
                          .status(500)
                          .send("Error updating product_rating");
                      } else {
                        res.redirect("/orders");
                      }
                    }
                  );
                }
              }
            );
          }
        }
      );
    }
  );
});

app.post("/add_product", upload.single("product_image"), (req, res) => {
  const seller_email = req.session.email;
  // console.log(seller_email);
  let {
    brand_name,
    category_name,
    product_name,
    product_price,
    product_discount,
    product_details,
    product_stock,
    visibility,
  } = req.body;
  if (visibility == "on") {
    visibility = 1;
  } else {
    visibility = 0;
  }
  const product_image = req.file ? req.file.filename : "";
  // console.log("visibility",visibility);
  // console.log("type of visibility",typeof visibility);
  pool.query(
    "select seller_id from seller where seller_email = ?",
    [seller_email],
    (err, result) => {
      if (err) {
        console.log(err);
      } else {
        result = result[0].seller_id;
        pool.query(
          "INSERT INTO product (brand_name, category_name, product_name, product_price, product_discount, product_details, seller_id, product_image, product_stock, visibility) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
          [
            brand_name,
            category_name,
            product_name,
            product_price,
            product_discount,
            product_details,
            result,
            product_image,
            product_stock,
            visibility,
          ],
          (err, result2) => {
            if (err) {
              console.error(err);
              return res.status(500).json({ message: "Error adding product" }); // Inform client about the error
            } else {
              // console.log("Product added successfully:", result.affectedRows); // Log success message with affected rows
              res.redirect("/"); // Inform client about success
            }
          }
        );
      }
    }
  );
  // res.send('ok');
});

app.get("/addProduct", (req, res) => {
  res.render("addProduct");
});

app.get("/delete_product/:productId", async (req, res) => {
  let product_id = req.params.productId;
  product_id = parseInt(product_id);

  // Perform deletion operation in the database
  pool.query("SET FOREIGN_KEY_CHECKS = 0;", (err, result) => {
    if (err) {
      console.log(err);
    } else {
      pool.query(
        `DELETE FROM product WHERE product_id = ?;`,
        [product_id],
        (err, result) => {
          if (err) {
            console.error("Error deleting item from cart:", err);
            return res.status(500).send("Internal Server Error");
          }
          // Item deleted successfully
          return res.redirect("/");
        }
      );
    }
  });
});

app.get("/editProduct/:productId", (req, res) => {
  const productId = req.params.productId;
  pool.query(
    "SELECT * FROM product WHERE product_id = ?",
    [productId],
    (err, queryResult) => {
      if (err) {
        console.error("Error querying database:", err);
        return res.status(500).json({ error: "Internal Server Error" });
      }

      if (queryResult.length === 0) {
        return res.status(404).json({ error: "Product not found" });
      }

      const result = queryResult[0]; // Rename variable to avoid conflict
      // Assuming you want to render a page here
      res.render("edit_product", { result: result });
    }
  );
});

app.post("/update/:product_id", upload.none(), (req, res) => {
  const product_id = req.params.product_id;
  const {
    brand_name,
    category_name,
    product_name,
    product_price,
    product_discount,
    product_details,
    product_stock,
    visibility,
  } = req.body;
  // console.log("abhi bhai", product_id, req.body);
  const visibilityValue = visibility === "true" ? 1 : 0;

  pool.query(
    "UPDATE product SET brand_name = ?, category_name = ?, product_name = ?, product_price = ?, product_discount = ?, product_details = ?, product_stock = ?, visibility = ? WHERE product_id = ?",
    [
      brand_name,
      category_name,
      product_name,
      product_price,
      product_discount,
      product_details,
      product_stock,
      visibilityValue,
      product_id,
    ],
    (error, results) => {
      if (error) {
        console.error("Error updating product:", error);
        return res.status(500).json({ message: "Internal Server Error" });
      }

      res.redirect("/");
    }
  );
});

app.get("/forgotPassword", (req, res) => {
  res.render("forgotPassword", { error: null });
});

app.get("/forgotPasswordseller", (req, res) => {
  res.render("forgotpasswordseller", { error: null });
});

const otps = {}; // Map to store OTPs

// Generate OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000);
}

// Send OTP to user's email
function sendOTP(email, otp) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "kushalpadhiyar030@gmail.com",
      pass: "fcwe ygxm tcnd qlrk",
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  const mailOptions = {
    from: "kushalpadhiyar030@gmail.com",
    to: email,
    subject: "Reset Password OTP",
    text: `Your OTP for resetting the password is: ${otp}`,
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });
}

// Forgot Password for Buyer
app.post("/api/forgot_password", (req, res) => {
  const { email } = req.body;

  const sql = `SELECT * FROM buyer WHERE buyer_email = ?`;
  pool.query(sql, [email], (err, result) => {
    if (err) {
      throw err;
    }
    if (result.length === 0) {
      return res.redirect("/buyer_registration");
    }

    const otp = generateOTP();
    console.log("for:", otp);
    otps[email] = otp; // Store OTP in the map
    console.log(otps);

    sendOTP(email, otp);
    res.render("newPassword", { email, error: null });
  });
});

// Forgot Password for Seller
app.post("/api/forgot_password_seller", (req, res) => {
  const { email } = req.body;

  const sql = `SELECT * FROM seller WHERE seller_email = ?`;
  pool.query(sql, [email], (err, result) => {
    if (err) {
      throw err;
    }
    if (result.length === 0) {
      return res.redirect("/seller_registration");
    }

    const otp = generateOTP();
    console.log("for:", otp);
    otps[email] = otp;
    console.log(otps);

    sendOTP(email, otp);
    res.render("newPasswordSeller", { email, error: null });
  });
});
// Reset Password for Seller
app.post("/api/reset_password", async (req, res) => {
  const { otp, password, confirmPassword } = req.body;
  const email = req.query.email;

  if (otp != otps[email]) {
    return res
      .status(400)
      .render("newPassword", { error: "Invalid OTP", email });
  }

  if (password !== confirmPassword) {
    return res
      .status(400)
      .render("newPassword", { error: "Passwords do not match", email });
  }

  const hashPassword = await bcrypt.hash(password, 10);
  const query = `UPDATE buyer SET buyer_password = '${hashPassword}' WHERE buyer_email = ?`;

  pool.query(query, [email], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    delete otps[email]; // Clear OTP from the map
    res.redirect("/");
  });
});

// Reset Password for Seller
app.post("/api/reset_password_seller", async (req, res) => {
  const { otp, password, confirmPassword } = req.body;

  const email = req.query.email;

  if (otp != otps[email]) {
    return res
      .status(400)
      .render("newPasswordSeller", { error: "Invalid OTP", email });
  }

  if (password !== confirmPassword) {
    return res
      .status(400)
      .render("newPasswordSeller", { error: "Passwords do not match", email });
  }

  const hashPassword = await bcrypt.hash(password, 10);
  const query = `UPDATE seller SET seller_password = '${hashPassword}' WHERE seller_email = ?`;

  pool.query(query, [email], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    delete otps[email]; // Clear OTP from the map
    res.redirect("/");
  });
});
// ... Rest of your code

// Generate a random CAPTCHA string
function generateCaptcha() {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let captcha = "";
  for (let i = 0; i < 6; i++) {
    captcha += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return captcha;
}

// Store the generated CAPTCHA in session
app.get("/generateCaptcha", (req, res) => {
  const captcha = generateCaptcha();
  req.session.captcha = captcha;
  res.json({ captcha });
});

// Verify CAPTCHA
app.post("/verifyCaptcha", (req, res) => {
  const userCaptcha = req.body.userCaptcha;
  const storedCaptcha = req.session.captcha;
  if (userCaptcha === storedCaptcha) {
    res.json({ success: true });
  } else {
    res.json({ success: false, message: "CAPTCHA verification failed" });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port http://localhost:${PORT}`);
});
