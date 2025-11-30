USE project2;

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
  "SELECT 'Column donation_amount does not exist - already using amount'"
));
PREPARE alterIfExists FROM @preparedStatement;
EXECUTE alterIfExists;
DEALLOCATE PREPARE alterIfExists;

