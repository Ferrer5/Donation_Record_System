USE project2;

ALTER TABLE donations 
ADD COLUMN IF NOT EXISTS id BIGINT AUTO_INCREMENT PRIMARY KEY FIRST,
ADD COLUMN IF NOT EXISTS full_name VARCHAR(100) AFTER username,
ADD COLUMN IF NOT EXISTS email VARCHAR(100) AFTER full_name,
ADD COLUMN IF NOT EXISTS donation_type VARCHAR(50) AFTER email,
ADD COLUMN IF NOT EXISTS message TEXT AFTER amount,
ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'PENDING' AFTER message,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP AFTER status;

SET @dbname = DATABASE();
SET @tablename = "donations";
SET @columnname = "donation_amount";
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (table_name = @tablename)
      AND (table_schema = @dbname)
      AND (column_name = @columnname)
  ) > 0,
  "ALTER TABLE donations CHANGE donation_amount amount DECIMAL(10,2) NOT NULL",
  "SELECT 'Column donation_amount does not exist'"
));
PREPARE alterIfExists FROM @preparedStatement;
EXECUTE alterIfExists;
DEALLOCATE PREPARE alterIfExists;

SET @columnname = "donation_date";
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (table_name = @tablename)
      AND (table_schema = @dbname)
      AND (column_name = @columnname)
  ) > 0,
  "ALTER TABLE donations CHANGE donation_date created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP",
  "SELECT 'Column donation_date does not exist'"
));
PREPARE alterIfExists FROM @preparedStatement;
EXECUTE alterIfExists;
DEALLOCATE PREPARE alterIfExists;

SET @columnname = "remarks";
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (table_name = @tablename)
      AND (table_schema = @dbname)
      AND (column_name = @columnname)
  ) > 0,
  "ALTER TABLE donations CHANGE remarks message TEXT",
  "SELECT 'Column remarks does not exist'"
));
PREPARE alterIfExists FROM @preparedStatement;
EXECUTE alterIfExists;
DEALLOCATE PREPARE alterIfExists;

UPDATE donations 
SET 
    full_name = COALESCE(full_name, username),
    email = COALESCE(email, (SELECT email FROM users WHERE users.username = donations.username LIMIT 1)),
    donation_type = COALESCE(donation_type, 'Cash'),
    status = COALESCE(status, 'PENDING'),
    created_at = COALESCE(created_at, CURRENT_TIMESTAMP)
WHERE full_name IS NULL OR email IS NULL OR donation_type IS NULL OR status IS NULL;

