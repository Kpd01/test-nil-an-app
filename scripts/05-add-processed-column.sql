-- Add processed column to spin_results table to track command state
ALTER TABLE spin_results 
ADD COLUMN IF NOT EXISTS processed BOOLEAN DEFAULT FALSE;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_spin_results_processed_timestamp 
ON spin_results(processed, timestamp DESC);

-- Mark all existing records as processed to prevent them from being picked up
UPDATE spin_results 
SET processed = TRUE 
WHERE processed IS NULL OR processed = FALSE;

-- Clean up old processed records (older than 1 hour)
DELETE FROM spin_results 
WHERE processed = TRUE 
AND timestamp < NOW() - INTERVAL '1 hour';
