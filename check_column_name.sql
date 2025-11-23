USE project2;

-- Check what the actual column name is in your donations table
SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'project2'
  AND TABLE_NAME = 'donations'
  AND (COLUMN_NAME = 'amount' OR COLUMN_NAME = 'donation_amount');

