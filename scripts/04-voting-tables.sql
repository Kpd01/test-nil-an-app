-- Create performances table if it doesn't exist
CREATE TABLE IF NOT EXISTS performances (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  performer TEXT NOT NULL,
  task TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('funny', 'silly', 'embarrassing')),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  total_votes INTEGER DEFAULT 0
);

-- Create votes table if it doesn't exist
CREATE TABLE IF NOT EXISTS votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  performance_id UUID REFERENCES performances(id) ON DELETE CASCADE,
  voter_name TEXT NOT NULL,
  vote_type TEXT NOT NULL DEFAULT 'up',
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(performance_id, voter_name)
);

-- Enable RLS
ALTER TABLE performances ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Public access" ON performances;
DROP POLICY IF EXISTS "Public access" ON votes;

-- Create comprehensive policies for performances
CREATE POLICY "Allow public select on performances" 
ON performances FOR SELECT 
USING (true);

CREATE POLICY "Allow public insert on performances" 
ON performances FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow public update on performances" 
ON performances FOR UPDATE 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Allow public delete on performances" 
ON performances FOR DELETE 
USING (true);

-- Create comprehensive policies for votes
CREATE POLICY "Allow public select on votes" 
ON votes FOR SELECT 
USING (true);

CREATE POLICY "Allow public insert on votes" 
ON votes FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow public update on votes" 
ON votes FOR UPDATE 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Allow public delete on votes" 
ON votes FOR DELETE 
USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_performances_timestamp ON performances(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_votes_performance_id ON votes(performance_id);
CREATE INDEX IF NOT EXISTS idx_votes_voter_name ON votes(voter_name);
