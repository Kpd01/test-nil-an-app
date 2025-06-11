-- Insert default access control settings
INSERT INTO settings (id, value) VALUES (
  'access-control',
  '{
    "messagesEnabled": true,
    "gamesEnabled": true,
    "galleryEnabled": true,
    "lastUpdated": "2024-01-01T00:00:00.000Z"
  }'::jsonb
) ON CONFLICT (id) DO NOTHING;

-- Insert default app settings
INSERT INTO settings (id, value) VALUES (
  'app-config',
  '{
    "partyStarted": false,
    "birthdayDate": "2024-12-08",
    "maxMessagesPerUser": 5,
    "enableMusicAutoplay": false
  }'::jsonb
) ON CONFLICT (id) DO NOTHING;
