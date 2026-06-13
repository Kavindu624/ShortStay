-- ============================================================
-- ShortStay DB Migration
-- Run this script to support the new booking features
-- ============================================================

-- 1. Add new columns to the booking table
--    (Run each ALTER separately if any column already exists)
ALTER TABLE booking
  ADD COLUMN expires_at          DATETIME       NULL          COMMENT 'Auto-expire time (24h after creation)',
  ADD COLUMN cancellation_reason VARCHAR(255)   NULL          COMMENT 'Guest cancellation reason',
  ADD COLUMN refund_amount        DECIMAL(10,2)  NULL          COMMENT 'Calculated refund amount',
  ADD COLUMN refund_policy        VARCHAR(100)   NULL          COMMENT 'full | partial_50 | no_refund',
  ADD COLUMN rejection_reason     VARCHAR(255)   NULL          COMMENT 'Host rejection reason',
  ADD COLUMN created_at           DATETIME       NULL          DEFAULT NOW() COMMENT 'Record creation timestamp',
  ADD COLUMN updated_at           DATETIME       NULL          DEFAULT NOW() ON UPDATE NOW() COMMENT 'Last update timestamp';

-- 2. Update status ENUM to include rejected and expired
ALTER TABLE booking
  MODIFY COLUMN status ENUM('pending','confirmed','cancelled','rejected','expired') NOT NULL DEFAULT 'pending';

-- 3. Create the notification table
CREATE TABLE IF NOT EXISTS notification (
  notification_id INT           NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_id         INT           NOT NULL,
  type            VARCHAR(50)   NOT NULL COMMENT 'booking_created | booking_approved | booking_rejected | booking_cancelled | booking_expired',
  title           VARCHAR(150)  NOT NULL,
  message         TEXT          NOT NULL,
  is_read         TINYINT(1)    NOT NULL DEFAULT 0,
  reference_id    INT               NULL COMMENT 'booking_id',
  created_at      DATETIME      NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_notification_user FOREIGN KEY (user_id) REFERENCES user(user_id) ON DELETE CASCADE
);

-- 4. Index for fast unread notification lookups
--    (CREATE INDEX does not support IF NOT EXISTS in MySQL — drop first if re-running)
CREATE INDEX idx_notification_user_read ON notification (user_id, is_read);
