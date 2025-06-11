-- Settings table for access control and app configuration
CREATE TABLE settings (
  id TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Messages table for birthday messages
CREATE TABLE messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_approved BOOLEAN DEFAULT true,
  emoji TEXT DEFAULT '🎉'
);

-- Spin wheel results
CREATE TABLE spin_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  player_name TEXT NOT NULL,
  result TEXT NOT NULL,
  category TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed BOOLEAN DEFAULT false
);

-- Performance voting
CREATE TABLE performances (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  performer TEXT NOT NULL,
  task TEXT NOT NULL,
  category TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  total_votes INTEGER DEFAULT 0
);

-- Individual votes
CREATE TABLE votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  performance_id UUID REFERENCES performances(id) ON DELETE CASCADE,
  voter_name TEXT NOT NULL,
  vote_type TEXT NOT NULL, -- 'up' or 'down'
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(performance_id, voter_name)
);

-- Photos for gallery
CREATE TABLE photos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  uploader TEXT NOT NULL,
  url TEXT NOT NULL,
  caption TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_approved BOOLEAN DEFAULT true
);

-- User sessions
CREATE TABLE user_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT UNIQUE NOT NULL,
  user_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Quiz results
CREATE TABLE quiz_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  player_name TEXT NOT NULL,
  score INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
