-- Add mode column to ai_conversations table
ALTER TABLE ai_conversations
ADD COLUMN IF NOT EXISTS mode TEXT DEFAULT 'chat';

-- Create index for faster filtering by mode
CREATE INDEX IF NOT EXISTS idx_ai_conversations_mode ON ai_conversations(mode);

-- Add comment to column
COMMENT ON COLUMN ai_conversations.mode IS 'Mode of AI conversation: chat, study, or file';
