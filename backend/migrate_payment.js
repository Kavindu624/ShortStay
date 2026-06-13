const s = require('./config/db');
const sqls = [
  ['payout table', `CREATE TABLE IF NOT EXISTS payout (
    payout_id INT PRIMARY KEY AUTO_INCREMENT,
    host_id INT NOT NULL,
    payment_id INT NOT NULL,
    booking_id INT NOT NULL,
    gross_amount DECIMAL(10,2) NOT NULL,
    commission_rate DECIMAL(5,2) DEFAULT 10.00,
    commission_amount DECIMAL(10,2) NOT NULL,
    payout_amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'USD',
    status ENUM('pending','processing','completed','failed') DEFAULT 'pending',
    payout_method ENUM('bank_transfer','manual') DEFAULT 'manual',
    stripe_transfer_id VARCHAR(255) DEFAULT NULL,
    processed_by INT DEFAULT NULL,
    notes VARCHAR(500) DEFAULT NULL,
    processed_at DATETIME DEFAULT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  )`],
  ['dispute table', `CREATE TABLE IF NOT EXISTS dispute (
    dispute_id INT PRIMARY KEY AUTO_INCREMENT,
    payment_id INT NOT NULL,
    raised_by INT NOT NULL,
    reason TEXT NOT NULL,
    status ENUM('open','under_review','resolved','closed') DEFAULT 'open',
    resolution TEXT DEFAULT NULL,
    resolved_by INT DEFAULT NULL,
    resolved_at DATETIME DEFAULT NULL,
    stripe_dispute_id VARCHAR(255) DEFAULT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  )`],
  ['payment refund_amount col', `ALTER TABLE payment ADD COLUMN refund_amount DECIMAL(10,2) DEFAULT NULL`],
];

(async () => {
  for (const [name, sql] of sqls) {
    try   { await s.query(sql); console.log('OK:', name); }
    catch (e) { console.log('Skip:', name, '-', e.message.split('.')[0]); }
  }
  process.exit(0);
})();
