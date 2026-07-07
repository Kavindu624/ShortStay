CREATE DATABASE  IF NOT EXISTS `shortstay` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `shortstay`;
-- MySQL dump 10.13  Distrib 8.0.46, for Win64 (x86_64)
--
-- Host: localhost    Database: shortstay
-- ------------------------------------------------------
-- Server version	8.0.46

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `activity_log`
--

DROP TABLE IF EXISTS `activity_log`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `activity_log` (
  `log_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL COMMENT 'NULL for system events',
  `action` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'e.g. LOGIN, BOOKING_CREATED, PROPERTY_APPROVED',
  `entity` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'e.g. booking, property, user',
  `entity_id` int DEFAULT NULL,
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `details` text COLLATE utf8mb4_unicode_ci COMMENT 'JSON extra context',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`log_id`),
  KEY `idx_activity_user` (`user_id`),
  KEY `idx_activity_action` (`action`),
  KEY `idx_activity_date` (`created_at`),
  CONSTRAINT `fk_activity_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `booking`
--

DROP TABLE IF EXISTS `booking`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `booking` (
  `booking_id` int NOT NULL AUTO_INCREMENT,
  `guest_id` int DEFAULT NULL,
  `property_id` int DEFAULT NULL,
  `checkin_date` date DEFAULT NULL,
  `checkout_date` date DEFAULT NULL,
  `total_price` decimal(10,2) DEFAULT NULL,
  `status` enum('pending','confirmed','cancelled','rejected','expired','completed') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `num_adults` int NOT NULL DEFAULT '1',
  `num_children` int NOT NULL DEFAULT '0',
  `cleaning_fee` decimal(10,2) NOT NULL DEFAULT '0.00',
  `security_deposit` decimal(10,2) NOT NULL DEFAULT '0.00',
  `expires_at` datetime DEFAULT NULL,
  `cancellation_reason` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `refund_amount` decimal(10,2) DEFAULT NULL,
  `refund_policy` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'full | partial_50 | no_refund',
  `rejection_reason` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`booking_id`),
  KEY `idx_booking_guest` (`guest_id`),
  KEY `idx_booking_property` (`property_id`),
  KEY `idx_booking_status` (`status`),
  KEY `idx_booking_dates` (`checkin_date`,`checkout_date`),
  CONSTRAINT `fk_booking_guest` FOREIGN KEY (`guest_id`) REFERENCES `user` (`user_id`) ON DELETE SET NULL,
  CONSTRAINT `fk_booking_property` FOREIGN KEY (`property_id`) REFERENCES `property` (`property_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `complain`
--

DROP TABLE IF EXISTS `complain`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `complain` (
  `complaint_id` int NOT NULL AUTO_INCREMENT,
  `booking_id` int DEFAULT NULL,
  `subject` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `description` text COLLATE utf8mb4_unicode_ci,
  `status` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'open | in_progress | resolved | closed',
  `priority` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'low | medium | high',
  `category` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Property Issue | Payment Issue | Host Behavior | Other',
  `resolution_note` text COLLATE utf8mb4_unicode_ci COMMENT 'Admin resolution text',
  `host_response` text COLLATE utf8mb4_unicode_ci COMMENT 'Host response to complaint',
  PRIMARY KEY (`complaint_id`),
  KEY `idx_complaint_booking` (`booking_id`),
  CONSTRAINT `fk_complaint_booking` FOREIGN KEY (`booking_id`) REFERENCES `booking` (`booking_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `dispute`
--

DROP TABLE IF EXISTS `dispute`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `dispute` (
  `dispute_id` int NOT NULL AUTO_INCREMENT,
  `payment_id` int NOT NULL,
  `raised_by` int NOT NULL COMMENT 'user_id of guest or staff',
  `reason` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('open','under_review','resolved','closed') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'open',
  `resolution` text COLLATE utf8mb4_unicode_ci,
  `resolved_by` int DEFAULT NULL COMMENT 'user_id of accountant',
  `resolved_at` datetime DEFAULT NULL,
  `stripe_dispute_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`dispute_id`),
  KEY `idx_dispute_payment` (`payment_id`),
  KEY `idx_dispute_raised_by` (`raised_by`),
  CONSTRAINT `fk_dispute_payment` FOREIGN KEY (`payment_id`) REFERENCES `payment` (`payment_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_dispute_raised_by` FOREIGN KEY (`raised_by`) REFERENCES `user` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `guest`
--

DROP TABLE IF EXISTS `guest`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `guest` (
  `user_id` int NOT NULL,
  `address` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`user_id`),
  CONSTRAINT `fk_guest_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `host`
--

DROP TABLE IF EXISTS `host`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `host` (
  `user_id` int NOT NULL,
  `bank_details` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'JSON string of bank/payout info',
  `routing_number` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Bank routing/sort code',
  `swift_code` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'SWIFT/BIC code',
  `payout_method` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'bank_transfer | paypal | stripe',
  PRIMARY KEY (`user_id`),
  CONSTRAINT `fk_host_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `inspection`
--

DROP TABLE IF EXISTS `inspection`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `inspection` (
  `inspection_id` int NOT NULL AUTO_INCREMENT,
  `property_id` int DEFAULT NULL,
  `inspector_id` int DEFAULT NULL,
  `scheduled_date` date DEFAULT NULL,
  `completed_date` date DEFAULT NULL,
  `overall_score` decimal(3,2) DEFAULT NULL,
  `recommendation` text COLLATE utf8mb4_unicode_ci,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `status` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'scheduled | completed | cancelled',
  `inspection_images` text COLLATE utf8mb4_unicode_ci COMMENT 'JSON array of filenames ["img1.jpg","img2.jpg"]',
  PRIMARY KEY (`inspection_id`),
  KEY `idx_inspection_property` (`property_id`),
  KEY `idx_inspection_inspector` (`inspector_id`),
  CONSTRAINT `fk_inspection_inspector` FOREIGN KEY (`inspector_id`) REFERENCES `user` (`user_id`) ON DELETE SET NULL,
  CONSTRAINT `fk_inspection_property` FOREIGN KEY (`property_id`) REFERENCES `property` (`property_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `notification`
--

DROP TABLE IF EXISTS `notification`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notification` (
  `notification_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `type` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'booking_created | booking_approved | booking_rejected | booking_cancelled | complaint_new | ...',
  `title` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `message` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_read` tinyint(1) NOT NULL DEFAULT '0',
  `reference_id` int DEFAULT NULL COMMENT 'Related entity ID (e.g. booking_id)',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`notification_id`),
  KEY `idx_notification_user_read` (`user_id`,`is_read`),
  CONSTRAINT `fk_notification_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `payment`
--

DROP TABLE IF EXISTS `payment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payment` (
  `payment_id` int NOT NULL AUTO_INCREMENT,
  `booking_id` int NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `currency` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'USD',
  `payment_method` enum('stripe','manual') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'manual',
  `payment_status` enum('pending','completed','failed','refunded') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'completed',
  `transaction_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Stripe payment intent ID',
  `client_secret` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Stripe client_secret for frontend confirmCardPayment',
  `payment_date` date DEFAULT NULL,
  `refunded_at` datetime DEFAULT NULL,
  `refund_transaction_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `notes` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`payment_id`),
  KEY `idx_payment_booking` (`booking_id`),
  CONSTRAINT `fk_payment_booking` FOREIGN KEY (`booking_id`) REFERENCES `booking` (`booking_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `payout`
--

DROP TABLE IF EXISTS `payout`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payout` (
  `payout_id` int NOT NULL AUTO_INCREMENT,
  `host_id` int NOT NULL,
  `payment_id` int NOT NULL,
  `booking_id` int NOT NULL,
  `gross_amount` decimal(10,2) NOT NULL COMMENT 'Full booking amount paid by guest',
  `commission_rate` decimal(5,2) NOT NULL DEFAULT '10.00' COMMENT 'Platform commission %',
  `commission_amount` decimal(10,2) NOT NULL COMMENT 'Amount kept by platform',
  `payout_amount` decimal(10,2) NOT NULL COMMENT 'Net amount sent to host',
  `currency` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'USD',
  `status` enum('pending','processing','completed','failed') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `payout_method` enum('bank_transfer','manual') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'manual',
  `stripe_transfer_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `processed_by` int DEFAULT NULL COMMENT 'user_id of accountant',
  `notes` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `processed_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`payout_id`),
  KEY `idx_payout_host` (`host_id`),
  KEY `idx_payout_payment` (`payment_id`),
  KEY `idx_payout_booking` (`booking_id`),
  CONSTRAINT `fk_payout_booking` FOREIGN KEY (`booking_id`) REFERENCES `booking` (`booking_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_payout_host` FOREIGN KEY (`host_id`) REFERENCES `user` (`user_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_payout_payment` FOREIGN KEY (`payment_id`) REFERENCES `payment` (`payment_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `property`
--

DROP TABLE IF EXISTS `property`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `property` (
  `property_id` int NOT NULL AUTO_INCREMENT,
  `host_id` int DEFAULT NULL,
  `title` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `address` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `city` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `state` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `zip_code` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `country` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `price_per_night` decimal(10,2) DEFAULT NULL,
  `cleaning_fee` decimal(10,2) NOT NULL DEFAULT '0.00',
  `security_deposit` decimal(10,2) NOT NULL DEFAULT '0.00',
  `max_guests` int DEFAULT NULL,
  `bedrooms` int NOT NULL DEFAULT '1',
  `bathrooms` int NOT NULL DEFAULT '1',
  `amenities` text COLLATE utf8mb4_unicode_ci,
  `house_rules` text COLLATE utf8mb4_unicode_ci,
  `verification_badge` tinyint(1) NOT NULL DEFAULT '0',
  `is_approved` tinyint(1) NOT NULL DEFAULT '0',
  `available_dates` text COLLATE utf8mb4_unicode_ci,
  `overall_score` decimal(3,2) DEFAULT NULL,
  `recommendations` text COLLATE utf8mb4_unicode_ci,
  `image` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Legacy single image field',
  `verification_requested` tinyint(1) NOT NULL DEFAULT '0',
  `verification_status` enum('none','requested','inspecting','approved','rejected') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'none',
  `property_type` enum('apartment','house','villa','room','bungalow','cabin') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'apartment',
  `latitude` decimal(10,8) DEFAULT NULL,
  `longitude` decimal(11,8) DEFAULT NULL,
  PRIMARY KEY (`property_id`),
  KEY `idx_property_host` (`host_id`),
  KEY `idx_property_type` (`property_type`),
  KEY `idx_property_status` (`is_approved`,`verification_status`),
  KEY `idx_property_city` (`city`),
  CONSTRAINT `fk_property_host` FOREIGN KEY (`host_id`) REFERENCES `user` (`user_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `property_availability`
--

DROP TABLE IF EXISTS `property_availability`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `property_availability` (
  `availability_id` int NOT NULL AUTO_INCREMENT,
  `property_id` int DEFAULT NULL,
  `available_date` date DEFAULT NULL,
  `is_booked` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`availability_id`),
  UNIQUE KEY `uq_property_date` (`property_id`,`available_date`),
  CONSTRAINT `fk_avail_property` FOREIGN KEY (`property_id`) REFERENCES `property` (`property_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `property_images`
--

DROP TABLE IF EXISTS `property_images`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `property_images` (
  `image_id` int NOT NULL AUTO_INCREMENT,
  `property_id` int DEFAULT NULL,
  `image_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_primary` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`image_id`),
  KEY `idx_propimg_property` (`property_id`),
  CONSTRAINT `fk_propimg_property` FOREIGN KEY (`property_id`) REFERENCES `property` (`property_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `review`
--

DROP TABLE IF EXISTS `review`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `review` (
  `review_id` int NOT NULL AUTO_INCREMENT,
  `booking_id` int DEFAULT NULL,
  `property_id` int DEFAULT NULL,
  `rating` int DEFAULT NULL COMMENT '1–5',
  `comment` text COLLATE utf8mb4_unicode_ci,
  `review_date` date DEFAULT NULL,
  `host_response` text COLLATE utf8mb4_unicode_ci,
  `response_date` date DEFAULT NULL,
  PRIMARY KEY (`review_id`),
  KEY `idx_review_property` (`property_id`),
  KEY `idx_review_booking` (`booking_id`),
  CONSTRAINT `fk_review_booking` FOREIGN KEY (`booking_id`) REFERENCES `booking` (`booking_id`) ON DELETE SET NULL,
  CONSTRAINT `fk_review_property` FOREIGN KEY (`property_id`) REFERENCES `property` (`property_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `staff`
--

DROP TABLE IF EXISTS `staff`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `staff` (
  `user_id` int NOT NULL,
  `hire_date` date DEFAULT NULL,
  `role` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `department` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `area_assigned` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'For verifier — their coverage area',
  `transaction_limit` decimal(10,2) DEFAULT NULL COMMENT 'For accountant — max transaction they can approve',
  `employee_code` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`user_id`),
  CONSTRAINT `fk_staff_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user` (
  `user_id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `role` enum('guest','host','admin','accountant','verifier') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `membership_level` enum('basic','silver','gold') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'basic',
  `is_suspended` tinyint(1) NOT NULL DEFAULT '0',
  `suspended_reason` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `google_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `auth_provider` enum('local','google') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'local',
  `is_verified` tinyint(1) NOT NULL DEFAULT '0',
  `verification_token` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `verification_token_expires` datetime DEFAULT NULL,
  `reset_token` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `reset_token_expires` datetime DEFAULT NULL,
  `profile_picture` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tokens_valid_after` datetime DEFAULT NULL COMMENT 'JWT invalidation — tokens issued before this date are rejected',
  `failed_login_count` int NOT NULL DEFAULT '0',
  `last_failed_login` datetime DEFAULT NULL,
  `locked_until` datetime DEFAULT NULL,
  `notification_preferences` text COLLATE utf8mb4_unicode_ci COMMENT 'JSON: {"email_booking":true,"inapp_payment":false,...}',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `uq_user_email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-06-18 14:32:30
