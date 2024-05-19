
const mysql = require("mysql2")
const dotenv = require("dotenv")

dotenv.config();
const pool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});
pool.getConnection((err, connection) => {
  if (err) {
    console.error("Error connecting to the database:", err);
  } else {
    console.log("Connected to the database");
    connection.release(); 
  }
});

module.exports = pool;




// INSERT INTO product (brand_name, category_name, product_name, product_price, product_discount, product_details, seller_id, product_image, product_stock, visibility) VALUES 
// ('Boat', 'Earphones', 'Boat Rockerz 255 Pro', 2249, 10, 'Neckband design, Bluetooth v5.0, IPX5 sweat and water resistance, 10mm dynamic drivers, 40mAh battery', 6, 'boat_rockerz_255_pro.jpg', 200, 1),
// ('Boat', 'Speaker', 'Boat Stone 1400', 6749, 15, '30W output, Bluetooth v4.2, 2500mAh battery, TWS feature, IPX5 water resistance, built-in mic', 6, 'boat_stone_1400.jpg', 100, 1),
// ('Boat', 'Smartwatch', 'Boat Storm', 3749, 5, '1.3-inch IPS touch display, Heart Rate Monitor, Blood oxygen monitor, 7 sports modes, 10 days battery life', 6, 'boat_storm.webp', 150, 1),
// ('Boat', 'Headphones', 'Boat Rockerz 450', 2999, 20, '40mm dynamic drivers, Bluetooth v5.0, 300mAh battery, foldable design, dual connectivity', 6, 'boat_rockerz_450.webp', 120, 1),
// ('Boat', 'Speaker', 'Boat Stone 200', 2249, 0, '3W output, Bluetooth v4.1, 1500mAh battery, TWS feature, IPX6 water resistance, built-in mic', 6, 'boat_stone_200.jpg', 300, 1),
// ('Boat', 'Earphones', 'Boat Airdopes 441', 2999, 10, 'True wireless earbuds, Bluetooth v5.0, IPX7 water resistance, 6mm dynamic drivers, 500mAh charging case', 6, 'boat_airdopes_441.webp', 250, 1),
// ('Boat', 'Soundbar', 'Boat AAVANTE Bar 1500', 6749, 15, '120W output with subwoofer, Bluetooth v5.0, HDMI ARC, AUX, USB, 2.1 channel surround sound', 6, 'boat_aavante_bar_1500.jpg', 50, 1),
// ('Boat', 'PowerBank', 'Boat 10000mAh Powerbank', 2249, 0, '10000mAh capacity, dual USB output, Type-C input, LED indicators, multi-protection circuits', 6, 'boat_10000mah_powerbank.jpg', 200, 1),
// ('Boat', 'Earphones', 'Boat BassHeads 100', 749, 5, 'In-ear wired earphones, 10mm drivers, passive noise cancellation, tangle-free cable, built-in mic', 6, 'boat_bassheads_100.webp', 400, 1),
// ('Boat', 'Speaker', 'Boat Stone 700', 3749, 10, '10W output, Bluetooth v4.2, 2000mAh battery, TWS feature, IPX7 water resistance, built-in mic', 6, 'boat_stone_700.jpg', 150, 1);


// INSERT INTO product (brand_name, category_name, product_name, product_price, product_discount, product_details, seller_id, product_image, product_stock, visibility) VALUES 
// ('Mi', 'Smartphone', 'Mi 11', 44999, 10, '6.81-inch AMOLED display, Snapdragon 888 chipset, 108MP quad-camera setup, 8GB RAM, 128GB storage, 4600mAh battery with 55W fast charging', 1, 'mi_11.jpg', 100, 1),
// ('Mi', 'Smartphone', 'Mi 10T Pro', 37499, 15, '6.67-inch IPS LCD display, Snapdragon 865 chipset, 108MP triple-camera setup, 8GB RAM, 256GB storage, 5000mAh battery with 33W fast charging', 1, 'mi_10t_pro.jpg', 80, 1),
// ('Mi', 'Smartwatch', 'Mi Watch Revolve', 7499, 5, '1.39-inch AMOLED display, Heart Rate Monitor, Sleep tracking, 14 days battery life, 5ATM water resistance, Bluetooth 5.0', 1, 'mi_watch_revolve.jpg', 150, 1),
// ('Mi', 'Television', 'Mi TV 4X', 37499, 20, '55-inch 4K HDR display, PatchWall 3.0, 20W speakers, Dolby Audio, Google Assistant built-in, Chromecast built-in', 1, 'mi_tv_4x.jpg', 50, 1),
// ('Mi', 'Laptop', 'Mi Notebook Pro', 67499, 10, '15.6-inch Full HD display, Intel Core i7 10th gen, NVIDIA GeForce MX350, 16GB RAM, 512GB SSD, Windows 10 Home', 1, 'mi_notebook_pro.jpg', 30, 1),
// ('Mi', 'Tablet', 'Mi Pad 5', 22499, 0, '11-inch 2K display, Snapdragon 870 chipset, 6GB RAM, 128GB storage, 8600mAh battery, 13MP rear camera, 8MP front camera', 1, 'mi_pad_5.jpg', 100, 1),
// ('Mi', 'Audio Product', 'Mi True Wireless Earbuds', 3749, 5, 'Bluetooth 5.0, 4 hours playback on a single charge, IPX4 sweat and water resistance, touch controls, compact charging case', 1, 'mi_earbuds.jpg', 200, 1),
// ('Mi', 'Smartphone', 'Mi Note 10', 29999, 10, '6.47-inch AMOLED display, Snapdragon 730G chipset, 108MP penta-camera setup, 6GB RAM, 128GB storage, 5260mAh battery with 30W fast charging', 1, 'mi_note_10.jpg', 70, 1),
// ('Mi', 'Smartwatch', 'Mi Band 6', 3374, 0, '1.56-inch AMOLED display, Heart Rate Monitor, Blood oxygen monitor, Sleep tracking, 14 days battery life, 5ATM water resistance', 1, 'mi_band_6.jpg', 300, 1),
// ('Mi', 'Audio Product', 'Mi Soundbar', 7499, 15, '30W output with 8 speakers, Dolby Audio, Bluetooth 5.0, HDMI ARC, AUX-in, S/PDIF, wall mountable', 1, 'mi_soundbar.jpg', 40, 1);
