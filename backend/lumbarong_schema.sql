-- LumBarong Database Export
-- Generated for MySQL (XAMPP)
-- Database: lumbarong

CREATE DATABASE IF NOT EXISTS `lumbarong`;
USE `lumbarong`;

-- ------------------------------------------------------
-- Table structure for table `Users`
-- ------------------------------------------------------
CREATE TABLE IF NOT EXISTS `Users` (
  `id` CHAR(36) BINARY NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `role` ENUM('admin', 'seller', 'customer') DEFAULT 'customer',
  `shopName` VARCHAR(255),
  `shopDescription` TEXT,
  `gcashNumber` VARCHAR(255),
  `profileImage` VARCHAR(255),
  `address` TEXT,
  `isVerified` BOOLEAN DEFAULT false,
  `createdAt` DATETIME NOT NULL,
  `updatedAt` DATETIME NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `users_email_idx` (`email`),
  INDEX `users_role_idx` (`role`)
) ENGINE=InnoDB;

-- ------------------------------------------------------
-- Table structure for table `Products`
-- ------------------------------------------------------
CREATE TABLE IF NOT EXISTS `Products` (
  `id` CHAR(36) BINARY NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `description` TEXT NOT NULL,
  `price` DECIMAL(10,2) NOT NULL,
  `stock` INTEGER NOT NULL DEFAULT 0,
  `category` VARCHAR(255) NOT NULL,
  `sellerId` CHAR(36) BINARY NOT NULL,
  `createdAt` DATETIME NOT NULL,
  `updatedAt` DATETIME NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `products_category_idx` (`category`),
  INDEX `products_price_idx` (`price`),
  CONSTRAINT `products_sellerId_fk` FOREIGN KEY (`sellerId`) REFERENCES `Users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ------------------------------------------------------
-- Table structure for table `ProductImages`
-- ------------------------------------------------------
CREATE TABLE IF NOT EXISTS `ProductImages` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `url` VARCHAR(255) NOT NULL,
  `ProductId` CHAR(36) BINARY,
  `createdAt` DATETIME NOT NULL,
  `updatedAt` DATETIME NOT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `productimages_productId_fk` FOREIGN KEY (`ProductId`) REFERENCES `Products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ------------------------------------------------------
-- Table structure for table `ProductSizes`
-- ------------------------------------------------------
CREATE TABLE IF NOT EXISTS `ProductSizes` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `size` VARCHAR(255) NOT NULL,
  `ProductId` CHAR(36) BINARY,
  `createdAt` DATETIME NOT NULL,
  `updatedAt` DATETIME NOT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `productsizes_productId_fk` FOREIGN KEY (`ProductId`) REFERENCES `Products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ------------------------------------------------------
-- Table structure for table `ProductRatings`
-- ------------------------------------------------------
CREATE TABLE IF NOT EXISTS `ProductRatings` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `rating` INTEGER NOT NULL,
  `review` TEXT,
  `userId` CHAR(36) BINARY NOT NULL,
  `ProductId` CHAR(36) BINARY NOT NULL,
  `createdAt` DATETIME NOT NULL,
  `updatedAt` DATETIME NOT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `productratings_userId_fk` FOREIGN KEY (`userId`) REFERENCES `Users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `productratings_productId_fk` FOREIGN KEY (`ProductId`) REFERENCES `Products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ------------------------------------------------------
-- Table structure for table `Orders`
-- ------------------------------------------------------
CREATE TABLE IF NOT EXISTS `Orders` (
  `id` CHAR(36) BINARY NOT NULL,
  `customerId` CHAR(36) BINARY NOT NULL,
  `totalAmount` DECIMAL(10,2) NOT NULL,
  `status` VARCHAR(255) DEFAULT 'Pending',
  `shippingAddress` TEXT NOT NULL,
  `paymentMethod` VARCHAR(255) DEFAULT 'GCash',
  `referenceNumber` VARCHAR(255),
  `receiptImage` VARCHAR(255),
  `isPaymentVerified` BOOLEAN DEFAULT false,
  `paymentVerifiedAt` DATETIME,
  `rating` INTEGER,
  `reviewComment` TEXT,
  `reviewImages` JSON,
  `reviewCreatedAt` DATETIME,
  `createdAt` DATETIME NOT NULL,
  `updatedAt` DATETIME NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `orders_customer_idx` (`customerId`),
  INDEX `orders_status_idx` (`status`),
  CONSTRAINT `orders_customerId_fk` FOREIGN KEY (`customerId`) REFERENCES `Users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ------------------------------------------------------
-- Table structure for table `OrderItems`
-- ------------------------------------------------------
CREATE TABLE IF NOT EXISTS `OrderItems` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `quantity` INTEGER NOT NULL DEFAULT 1,
  `price` DECIMAL(10,2) NOT NULL,
  `orderId` CHAR(36) BINARY NOT NULL,
  `productId` CHAR(36) BINARY NOT NULL,
  `createdAt` DATETIME NOT NULL,
  `updatedAt` DATETIME NOT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `orderitems_orderId_fk` FOREIGN KEY (`orderId`) REFERENCES `Orders` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `orderitems_productId_fk` FOREIGN KEY (`productId`) REFERENCES `Products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ------------------------------------------------------
-- Table structure for table `ReturnRequests`
-- ------------------------------------------------------
CREATE TABLE IF NOT EXISTS `ReturnRequests` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `reason` TEXT NOT NULL,
  `proofImages` JSON,
  `proofVideo` VARCHAR(255),
  `status` VARCHAR(255) DEFAULT 'Pending',
  `requestedAt` DATETIME NOT NULL,
  `OrderId` CHAR(36) BINARY NOT NULL,
  `createdAt` DATETIME NOT NULL,
  `updatedAt` DATETIME NOT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `returnrequests_orderId_fk` FOREIGN KEY (`OrderId`) REFERENCES `Orders` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ------------------------------------------------------
-- Table structure for table `Messages`
-- ------------------------------------------------------
CREATE TABLE IF NOT EXISTS `Messages` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `content` TEXT NOT NULL,
  `isRead` BOOLEAN DEFAULT false,
  `senderId` CHAR(36) BINARY NOT NULL,
  `receiverId` CHAR(36) BINARY NOT NULL,
  `createdAt` DATETIME NOT NULL,
  `updatedAt` DATETIME NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `messages_sender_receiver_idx` (`senderId`, `receiverId`),
  CONSTRAINT `messages_senderId_fk` FOREIGN KEY (`senderId`) REFERENCES `Users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `messages_receiverId_fk` FOREIGN KEY (`receiverId`) REFERENCES `Users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ------------------------------------------------------
-- Table structure for table `Notifications`
-- ------------------------------------------------------
CREATE TABLE IF NOT EXISTS `Notifications` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `message` TEXT NOT NULL,
  `type` VARCHAR(255) DEFAULT 'info',
  `isRead` BOOLEAN DEFAULT false,
  `userId` CHAR(36) BINARY NOT NULL,
  `createdAt` DATETIME NOT NULL,
  `updatedAt` DATETIME NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `notifications_user_idx` (`userId`),
  CONSTRAINT `notifications_userId_fk` FOREIGN KEY (`userId`) REFERENCES `Users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;
