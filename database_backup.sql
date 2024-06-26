-- MySQL dump 10.13  Distrib 8.3.0, for Win64 (x86_64)
--
-- Host: localhost    Database: e_commerce
-- ------------------------------------------------------
-- Server version	8.3.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `address`
--

DROP TABLE IF EXISTS `address`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `address` (
  `address_id` int NOT NULL AUTO_INCREMENT,
  `buyer_email` varchar(255) DEFAULT NULL,
  `buyer_address` text,
  PRIMARY KEY (`address_id`),
  KEY `buyer_email` (`buyer_email`),
  CONSTRAINT `address_ibfk_1` FOREIGN KEY (`buyer_email`) REFERENCES `buyer` (`buyer_email`)
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `address`
--

LOCK TABLES `address` WRITE;
/*!40000 ALTER TABLE `address` DISABLE KEYS */;
INSERT INTO `address` VALUES (1,'riyasharma@example.com','Flat 101, Galaxy Apartments, Sector 5'),(2,'karansingh@gmail.com','House 25, Green Avenue, Vasant Kunj'),(3,'priyamehta15@yahoo.com','A-205, Lotus Residency, Banjara Hills'),(4,'rahul.kumar88@hotmail.com','3rd Floor, Diamond Tower, MG Road'),(5,'nehagupta99@outlook.com','B-12, Sunshine Colony, Koregaon Park'),(6,'vinit@gmail.com','navsari'),(7,'pmkh2510@gmail.com','shivaji chowk vijalpor'),(8,'TUY@HG.COM','gjfh'),(16,'vinit@gmail.com','206,Kinal Apartment,Shivaji Chowk,Vijalpor,Navsari'),(17,'vinit@gmail.com','surat'),(18,'vinit@gmail.com','ffgre'),(19,'vinit@gmail.com','gjfh'),(20,'pmkh2510@gmail.com','Navsari'),(21,'kushalpadhiyar030@gmail.com','navsari');
/*!40000 ALTER TABLE `address` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `buyer`
--

DROP TABLE IF EXISTS `buyer`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `buyer` (
  `buyer_id` int NOT NULL AUTO_INCREMENT,
  `buyer_name` text NOT NULL,
  `buyer_email` varchar(100) NOT NULL,
  `buyer_phonenumber` varchar(100) NOT NULL,
  `buyer_password` text NOT NULL,
  `buyer_address` text NOT NULL,
  `city_name` text NOT NULL,
  `pincode` text NOT NULL,
  PRIMARY KEY (`buyer_id`),
  UNIQUE KEY `buyer_email` (`buyer_email`),
  UNIQUE KEY `buyer_phonenumber` (`buyer_phonenumber`)
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `buyer`
--

LOCK TABLES `buyer` WRITE;
/*!40000 ALTER TABLE `buyer` DISABLE KEYS */;
INSERT INTO `buyer` VALUES (1,'Riya Sharma','riyasharma@example.com','9876543210','securepassword1','Flat 101, Galaxy Apartments, Sector 5','New Delhi','110075'),(2,'Karan Singh','karansingh@gmail.com','7894561230','strongpassword2','House 25, Green Avenue, Vasant Kunj','Mumbai','400065'),(3,'Priya Mehta','priyamehta15@yahoo.com','8765432190','mypassword123','A-205, Lotus Residency, Banjara Hills','Hyderabad','500043'),(4,'Rahul Kumar','rahul.kumar88@hotmail.com','6543217890','PaSsWoRd456!','3rd Floor, Diamond Tower, MG Road','Bangalore','560001'),(5,'Neha Gupta','nehagupta99@outlook.com','1234569870','nehasecurepassword','B-12, Sunshine Colony, Koregaon Park','Pune','411001'),(6,'vinit','vinit@gmail.com','1234566780','vinit@123','navsari','surat','345432'),(7,'kushal','pmkh69910@gmail.com','7802043261','123456','shivaji chowk vijalpor','Navsari','396445'),(9,'JHHJG','TUY@HG.COM','1234567888','123','gjfh','654','123456'),(16,'Kushal Padhiyar','kushalpadhiyar030@gmail.com','7802043262','$2b$10$VMCYNb1ZxAC27.NpfJSfReBim2wLCDQI2V6v3hwg4QS8iSWFhFeOi','Navsari','Navsari','396445'),(21,'prince','radadiyaprince493@gmail.com','1546541354','$2b$10$OiRtqAaa5H/uaoRgY7kV2OObeFEY2SIJ9rTHWb/KA0bwkleusPOkG','gjfh','654','123456');
/*!40000 ALTER TABLE `buyer` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cart`
--

DROP TABLE IF EXISTS `cart`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cart` (
  `cart_id` int NOT NULL AUTO_INCREMENT,
  `buyer_id` int DEFAULT NULL,
  `product_id` int DEFAULT NULL,
  `quantity` int DEFAULT '1',
  PRIMARY KEY (`cart_id`),
  KEY `buyer_id` (`buyer_id`),
  KEY `product_id` (`product_id`),
  KEY `idx_quantity` (`quantity`),
  CONSTRAINT `cart_ibfk_1` FOREIGN KEY (`buyer_id`) REFERENCES `buyer` (`buyer_id`),
  CONSTRAINT `cart_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `product` (`product_id`)
) ENGINE=InnoDB AUTO_INCREMENT=158 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cart`
--

LOCK TABLES `cart` WRITE;
/*!40000 ALTER TABLE `cart` DISABLE KEYS */;
INSERT INTO `cart` VALUES (155,16,18,1),(156,16,5,4),(157,16,2,1);
/*!40000 ALTER TABLE `cart` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `orders` (
  `order_id` int NOT NULL AUTO_INCREMENT,
  `cart_id` int DEFAULT NULL,
  `buyer_id` int DEFAULT NULL,
  `product_id` int DEFAULT NULL,
  `quantity` int DEFAULT NULL,
  `rating` int DEFAULT NULL,
  PRIMARY KEY (`order_id`),
  KEY `cart_id` (`cart_id`),
  KEY `buyer_id` (`buyer_id`),
  KEY `product_id` (`product_id`),
  KEY `quantity` (`quantity`),
  CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`cart_id`) REFERENCES `cart` (`cart_id`),
  CONSTRAINT `orders_ibfk_2` FOREIGN KEY (`buyer_id`) REFERENCES `cart` (`buyer_id`),
  CONSTRAINT `orders_ibfk_3` FOREIGN KEY (`product_id`) REFERENCES `cart` (`product_id`),
  CONSTRAINT `orders_ibfk_4` FOREIGN KEY (`quantity`) REFERENCES `cart` (`quantity`)
) ENGINE=InnoDB AUTO_INCREMENT=147 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orders`
--

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
INSERT INTO `orders` VALUES (120,119,6,23,5,5),(121,120,6,6,1,2),(122,121,6,28,2,3),(124,122,6,12,1,3),(125,123,6,6,1,4),(126,124,6,10,1,5),(127,125,6,3,5,5),(128,126,6,10,6,5),(129,127,6,3,2,4),(130,128,6,2,4,10),(131,129,6,6,2,NULL),(132,130,6,10,1,10),(133,131,6,9,1,10),(134,132,6,4,1,NULL),(136,137,6,29,1,2),(137,138,6,3,8,NULL),(138,140,6,2,100014,5),(140,142,6,31,1,4),(141,145,16,32,1,5),(142,146,16,8,1,5),(143,147,16,4,6,NULL),(144,153,16,3,5,NULL),(145,154,16,4,5,NULL);
/*!40000 ALTER TABLE `orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product`
--

DROP TABLE IF EXISTS `product`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product` (
  `product_id` int NOT NULL AUTO_INCREMENT,
  `brand_name` varchar(255) DEFAULT NULL,
  `category_name` varchar(255) DEFAULT NULL,
  `product_name` text,
  `product_price` bigint DEFAULT NULL,
  `product_discount` int DEFAULT NULL,
  `product_details` text,
  `seller_id` int DEFAULT NULL,
  `product_rating` int DEFAULT '0',
  `product_total_ratings` bigint DEFAULT '0',
  `product_image` text,
  `product_stock` bigint DEFAULT NULL,
  `visibility` tinyint(1) DEFAULT NULL,
  PRIMARY KEY (`product_id`)
) ENGINE=InnoDB AUTO_INCREMENT=34 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product`
--

LOCK TABLES `product` WRITE;
/*!40000 ALTER TABLE `product` DISABLE KEYS */;
INSERT INTO `product` VALUES (1,'Acer','laptop','Acer Nitro 5 AN515-57-79TD Gaming Laptop',739,13,'Acer Nitro 5 AN515-57-79TD Gaming Laptop | Intel Core i7-11800H | NVIDIA GeForce RTX 3050 Ti Laptop GPU | 15.6 FHD 144Hz IPS Display | 8GB DDR4 | 512GB NVMe SSD | Killer Wi-Fi 6 | Backlit Keyboard',4,4,19,'https://i.ibb.co/jTMbP5r/nextamazon1.jpg',90,1),(2,'Acer','laptop','Acer Aspire 5 A515-45-R74Z Slim Laptop',399,18,'Acer Aspire 5 A515-45-R74Z Slim Laptop | 15.6 Full HD IPS | AMD Ryzen 5 5500U Hexa-Core Mobile Processor | AMD Radeon Graphics | 8GB DDR4 | 256GB NVMe SSD | WiFi 6 | Backlit KB | Windows 11 Home',1,4,90,'https://i.ibb.co/2vwS6HR/nextamazon2.jpg',54,1),(3,'Apple','Electronics','2020 Apple iPad Pro',747,10,'2020 Apple iPad Pro (12.9-inch, Wi-Fi, 256GB) - Space Gray (Renewed)',1,5,175,'https://i.ibb.co/SybqWjf/nextamazon3.jpg',129,1),(4,'ENOMIR','Smart watch','Smart Watches for Men',56,20,'Smart Watches for Men (Answer/Make Call) 100 Sport Modes Fitness Tracker Heart Rate Blood Oxygen Sleep Monitor IP68 Waterproof Fitness Watch Activity Tracker and Smartwatches iPhone Android Compatible',5,3,17,'https://i.ibb.co/0Gvx3Sk/nextImg.jpg',22,1),(5,'KOORUI','Electronics','KOORUI 24 Inch Computer Monitor -FHD 1080P Gaming Monitor',118,11,'KOORUI 24 Inch Computer Monitor -FHD 1080P Gaming Monitor 165Hz VA 1ms Build-in FreeSyncΓäó, Compatible G-sync, LED Monitors with Ultra-Thin, HDMI X2 /DP, VESA Compatible, Tilt Adjustable, Eye Care 24E4',4,3,37,'https://i.ibb.co/xD7nDq5/nextamazon5.jpg',30,1),(7,'larco','Computer','larco Gaming PC Desktop Computer Intel i7',499,13,'Alarco Gaming PC Desktop Computer Intel i7 3.40GHz,16GB Ram,1TB Hard Drive,Windows 10 pro,WiFi Ready,Video Card Nvidia GTX 750 4GB, 6 RGB Fans with Remote',5,3,130,'https://i.ibb.co/9HPcTJv/nextamazon7.jpg',86,1),(8,'SkyTech','Computer','SkyTech Shadow 3.0 Gaming Computer PC',899,17,'SkyTech Shadow 3.0 Gaming Computer PC Desktop - Ryzen 5 3600 6-Core 3.6GHz, GTX 1660 Super 6G, 1TB SSD, 16GB DDR4 3000, AC WiFi, Windows 10 Home 64-bit, Black',4,5,143,'https://i.ibb.co/DYmhxf8/nextamazon8.jpg',78,1),(9,'Skullcandy','Electronics','Skullcandy Crusher Evo Wireless Over-Ear Bluetooth Headphones',147,13,'Skullcandy Crusher Evo Wireless Over-Ear Bluetooth Headphones for iPhone and Android with Mic / 40 Hour Battery Life / Extra Bass Tech / Best for Music, School, Workouts, and Gaming - Black',5,4,168,'https://i.ibb.co/ZG9t4RL/nextamazon9.jpg',100,1),(10,'Garmin','Smart watch','Garmin 010-02430-01 Venu 2',319,13,'Garmin 010-02430-01 Venu 2, GPS Smartwatch with Advanced Health Monitoring and Fitness Features, Slate Bezel with Black Case and Silicone Band',3,4,15,'https://i.ibb.co/z7yV4zf/nextamazon10.jpg',100,1),(11,'Canon','Electronics','Canon EOS Rebel T100',559,16,'Canon EOS Rebel T100 Digital SLR Camera with 18-55mm Lens Kit, 18 Megapixel Sensor, Wi-Fi, DIGIC4+, SanDisk 32GB Memory Card and Live View Shooting',2,4,31,'https://i.ibb.co/1r28gMk/1.webp',144,1),(12,'DJI','Electronics','DJI Air',999,13,'DJI Mini 2 Fly More Combo - Ultralight Foldable Drone, 3-Axis Gimbal with 4K Camera, 12MP Photos, 31 Min Flight Time',3,3,82,'https://i.ibb.co/qdfB3s6/2.webp',100,1),(13,'Apple','Electronics','Apple 10.2-inch iPad',269,15,'2021 Apple 10.2-inch iPad Wi-Fi 64GB - Space Gray (9th Generation)',4,4,4,'https://i.ibb.co/VL1Dnv1/4.webp',97,1),(14,'Apple','Electronics','iPhone 14',1200,16,'AT&T iPhone 14 128GB Midnight',3,3,197,'https://i.ibb.co/5F3nWv6/7.webp',163,1),(15,'Apple','Smart watch','Apple Watch SE',249,10,'Apple Watch SE (2nd Gen) GPS 40mm Midnight Aluminum Case with Midnight Sport Band - S/M',5,3,101,'https://i.ibb.co/xgZWmdq/8.jpg',119,1),(16,'Beats by Dr. Dre','Electronics','Beats Solo3',130,10,'Beats Solo3 Wireless On-Ear Headphones with Apple W1 Headphone Chip, Black, MX432LL/A',4,4,196,'https://i.ibb.co/rQKjVC2/5.webp',43,1),(17,'uhomepro','Home Decoration','uhomepro TV Stand Cabinet',125,15,'uhomepro TV Stand Cabinet for Living Room up to 55 Television, Entertainment Center with RGB LED Lights and Storage Shelves Furniture, Black High Gloss TV Cabinet Console Table, Q15709',2,4,136,'https://i.ibb.co/Ycz8hkV/6.webp',73,1),(18,'Pupuskyer','Smart watch','Pupuskyer Smart Watch',55,13,'Pupuskyer Smart Watch, 1.7inchs Fitness Tracker with Heart Rate Monitor,Blood Oxygen Tracking, Sleep Tracking for Android iPhone Samsung,Water Resistant Smart Watches for Men Women with Watch Talking',4,1,133,'https://i.ibb.co/VC2VWGL/nextamazon11.jpg',38,1),(19,'SAMSUNG','Smart Phones','SAMSUNG Galaxy S23 Ultra Cell Phone',1500,19,'SAMSUNG Galaxy S23 Ultra Cell Phone, Factory Unlocked Android Smartphone, 512GB Storage, 200MP Camera, Night Mode, Long Battery Life, S Pen, US Version, 2023, Cream',1,4,89,'https://i.ibb.co/THwjSTK/nextamazon12.jpg',100,1),(20,'Apple','Smart Phones','Apple iPhone 12 Mini 5G',365,18,'Apple iPhone 12 Mini 5G, US Version, 128GB, Blue - Unlocked (Renewed)',5,3,129,'https://i.ibb.co/nry7WRZ/nextamazon13.jpg',100,1),(32,'samsung','Smart Phones','galaxy m21',12000,12,'jshoihrgihjkfnbsfkjjksgh fjhbsjhsjf',3,5,1,'product_image-1712736938317.jpg',1200,1);
/*!40000 ALTER TABLE `product` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `seller`
--

DROP TABLE IF EXISTS `seller`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `seller` (
  `seller_id` int NOT NULL AUTO_INCREMENT,
  `seller_name` text,
  `seller_email` varchar(255) DEFAULT NULL,
  `seller_phonenumber` bigint DEFAULT NULL,
  `seller_password` text,
  `seller_shopname` text,
  PRIMARY KEY (`seller_id`),
  UNIQUE KEY `seller_email` (`seller_email`),
  UNIQUE KEY `seller_phonenumber` (`seller_phonenumber`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `seller`
--

LOCK TABLES `seller` WRITE;
/*!40000 ALTER TABLE `seller` DISABLE KEYS */;
INSERT INTO `seller` VALUES (1,'John Smith','john.smith@email.com',1234567890,'password123','John\'s Books'),(2,'Alice Johnson','alice.johnson@shop.com',9876543210,'secretpass','Alice\'s Crafts'),(3,'Michael Lee','michael.lee@store.com',1122334455,'secure123','Mike\'s Music'),(4,'David Young','david.young@ecommerce.com',987654321,'password456','Dave\'s Electronics'),(5,'Emily Chen','emily.chen@shop.com',5678901234,'strongpass','Emily\'s Art Studio'),(6,'Kushal Padhiyar','pmkh69910@gmail.com',7802043261,'Kushal@030','myDigital'),(7,'het','het@123gamil.com',1234554321,'het@123','hetshop'),(8,'JGLJJHGOUYG','KHGJHV@GMAIL.COM',8759866547,'123','12546'),(9,'abhi','abhi@gmail.com',1234566656,'abhi@123','abhi'),(12,'sahil','sahildayala92@gmail.com',1234567544,'123456','mevawale'),(13,'Kushal','kushalpadhiyar030@gmail.com',7802043262,'$2b$10$AAstSacn7cJ8Ug//C6e1eOJ3bfi550f3b10WAdOkZss4TPkrmNMhm','kushalshop');
/*!40000 ALTER TABLE `seller` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2024-04-16 10:10:41
