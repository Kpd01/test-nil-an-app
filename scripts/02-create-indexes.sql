-- Create indexes for better performance
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX idx_spin_results_timestamp ON spin_results(timestamp DESC);
CREATE INDEX idx_performances_timestamp ON performances(timestamp DESC);
CREATE INDEX idx_votes_performance_id ON votes(performance_id);
CREATE INDEX idx_photos_created_at ON photos(created_at DESC);
CREATE INDEX idx_user_sessions_session_id ON user_sessions(session_id);
CREATE INDEX idx_quiz_results_timestamp ON quiz_results(timestamp DESC);
