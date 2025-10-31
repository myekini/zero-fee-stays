-- Create conversations table
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  guest_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  host_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Metadata
  last_message_at TIMESTAMPTZ DEFAULT NOW(),
  guest_unread_count INTEGER DEFAULT 0,
  host_unread_count INTEGER DEFAULT 0,
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'archived', 'blocked')),

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Ensure unique conversation per property/guest/host combo
  UNIQUE(property_id, guest_id, host_id)
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Message content
  content TEXT NOT NULL,
  message_type VARCHAR(50) DEFAULT 'text' CHECK (message_type IN ('text', 'system', 'booking_request', 'booking_update')),

  -- Attachments
  attachments JSONB DEFAULT '[]'::jsonb,

  -- Status
  read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  deleted_by_sender BOOLEAN DEFAULT FALSE,
  deleted_by_recipient BOOLEAN DEFAULT FALSE,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add conversation_id column if it doesn't exist (for existing messages table)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'messages' AND column_name = 'conversation_id'
    ) THEN
        ALTER TABLE messages ADD COLUMN conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Create notifications table if not exists
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type VARCHAR(100) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_conversations_guest_id ON conversations(guest_id);
CREATE INDEX idx_conversations_host_id ON conversations(host_id);
CREATE INDEX idx_conversations_property_id ON conversations(property_id);
CREATE INDEX idx_conversations_last_message_at ON conversations(last_message_at DESC);

-- Create index only if conversation_id column exists
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'messages' AND column_name = 'conversation_id'
    ) THEN
        CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
    END IF;
END $$;
-- Create indexes only if columns exist
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'messages' AND column_name = 'sender_id'
    ) THEN
        CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
    END IF;
    
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'messages' AND column_name = 'recipient_id'
    ) THEN
        CREATE INDEX IF NOT EXISTS idx_messages_recipient_id ON messages(recipient_id);
    END IF;
    
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'messages' AND column_name = 'created_at'
    ) THEN
        CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);
    END IF;
    
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'messages' AND column_name = 'read'
    ) THEN
        CREATE INDEX IF NOT EXISTS idx_messages_read ON messages(read) WHERE NOT read;
    END IF;
END $$;

-- Create notification indexes only if columns exist
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'notifications' AND column_name = 'user_id'
    ) THEN
        CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
    END IF;
    
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'notifications' AND column_name = 'read'
    ) THEN
        CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read) WHERE NOT read;
    END IF;
    
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'notifications' AND column_name = 'created_at'
    ) THEN
        CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
    END IF;
END $$;

-- Create trigger to update conversation on new message
CREATE OR REPLACE FUNCTION update_conversation_on_message()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE conversations
    SET
        last_message_at = NEW.created_at,
        guest_unread_count = CASE
            WHEN NEW.recipient_id = (SELECT guest_id FROM conversations WHERE id = NEW.conversation_id)
            THEN guest_unread_count + 1
            ELSE guest_unread_count
        END,
        host_unread_count = CASE
            WHEN NEW.recipient_id = (SELECT host_id FROM conversations WHERE id = NEW.conversation_id)
            THEN host_unread_count + 1
            ELSE host_unread_count
        END,
        updated_at = NOW()
    WHERE id = NEW.conversation_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger only if conversation_id column exists
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'messages' AND column_name = 'conversation_id'
    ) THEN
        DROP TRIGGER IF EXISTS update_conversation_on_new_message ON messages;
        CREATE TRIGGER update_conversation_on_new_message
            AFTER INSERT ON messages
            FOR EACH ROW
            EXECUTE FUNCTION update_conversation_on_message();
    END IF;
END $$;

-- Create trigger to update conversation unread count when message is read
CREATE OR REPLACE FUNCTION update_conversation_on_message_read()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.read = TRUE AND OLD.read = FALSE THEN
        UPDATE conversations
        SET
            guest_unread_count = CASE
                WHEN NEW.recipient_id = (SELECT guest_id FROM conversations WHERE id = NEW.conversation_id)
                THEN GREATEST(guest_unread_count - 1, 0)
                ELSE guest_unread_count
            END,
            host_unread_count = CASE
                WHEN NEW.recipient_id = (SELECT host_id FROM conversations WHERE id = NEW.conversation_id)
                THEN GREATEST(host_unread_count - 1, 0)
                ELSE host_unread_count
            END,
            updated_at = NOW()
        WHERE id = NEW.conversation_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger only if read column exists
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'messages' AND column_name = 'read'
    ) THEN
        DROP TRIGGER IF EXISTS update_conversation_on_message_marked_read ON messages;
        CREATE TRIGGER update_conversation_on_message_marked_read
            AFTER UPDATE ON messages
            FOR EACH ROW
            WHEN (OLD.read IS DISTINCT FROM NEW.read)
            EXECUTE FUNCTION update_conversation_on_message_read();
    END IF;
END $$;

-- Row Level Security Policies

-- Conversations policies
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

-- Users can view conversations they're part of
DROP POLICY IF EXISTS "Users can view their own conversations" ON conversations;
CREATE POLICY "Users can view their own conversations"
    ON conversations FOR SELECT
    USING (
        auth.uid() IN (
            SELECT user_id FROM profiles WHERE id = guest_id
            UNION
            SELECT user_id FROM profiles WHERE id = host_id
        )
    );

-- Guests can create conversations
DROP POLICY IF EXISTS "Guests can create conversations" ON conversations;
CREATE POLICY "Guests can create conversations"
    ON conversations FOR INSERT
    WITH CHECK (
        auth.uid() = (SELECT user_id FROM profiles WHERE id = guest_id)
    );

-- Users can update their own conversations (archive, etc.)
DROP POLICY IF EXISTS "Users can update their own conversations" ON conversations;
CREATE POLICY "Users can update their own conversations"
    ON conversations FOR UPDATE
    USING (
        auth.uid() IN (
            SELECT user_id FROM profiles WHERE id = guest_id
            UNION
            SELECT user_id FROM profiles WHERE id = host_id
        )
    );

-- Messages policies
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Users can view messages in their conversations
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON messages;
CREATE POLICY "Users can view messages in their conversations"
    ON messages FOR SELECT
    USING (
        auth.uid() IN (
            SELECT user_id FROM profiles
            WHERE id IN (sender_id, recipient_id)
        )
    );

-- Users can send messages in their conversations
DROP POLICY IF EXISTS "Users can send messages in their conversations" ON messages;
CREATE POLICY "Users can send messages in their conversations"
    ON messages FOR INSERT
    WITH CHECK (
        auth.uid() = (SELECT user_id FROM profiles WHERE id = sender_id)
        AND
        EXISTS (
            SELECT 1 FROM conversations
            WHERE id = conversation_id
            AND (
                auth.uid() = (SELECT user_id FROM profiles WHERE id = guest_id)
                OR
                auth.uid() = (SELECT user_id FROM profiles WHERE id = host_id)
            )
        )
    );

-- Users can update their own messages (mark as read, delete, etc.)
DROP POLICY IF EXISTS "Users can update messages they received" ON messages;
CREATE POLICY "Users can update messages they received"
    ON messages FOR UPDATE
    USING (
        auth.uid() = (SELECT user_id FROM profiles WHERE id = recipient_id)
    );

-- Notifications policies
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own notifications" ON notifications;
CREATE POLICY "Users can view their own notifications"
    ON notifications FOR SELECT
    USING (auth.uid() = (SELECT user_id FROM profiles WHERE id = user_id));

DROP POLICY IF EXISTS "Users can update their own notifications" ON notifications;
CREATE POLICY "Users can update their own notifications"
    ON notifications FOR UPDATE
    USING (auth.uid() = (SELECT user_id FROM profiles WHERE id = user_id));

DROP POLICY IF EXISTS "System can create notifications" ON notifications;
CREATE POLICY "System can create notifications"
    ON notifications FOR INSERT
    WITH CHECK (true); -- Service role only

-- Create view for conversation details
CREATE OR REPLACE VIEW conversation_details AS
SELECT
    c.*,
    p.title as property_title,
    p.address as property_address,
    (
        SELECT array_agg(pi.image_url ORDER BY pi.sort_order, pi.created_at)
        FROM property_images pi
        WHERE pi.property_id = p.id
        LIMIT 5
    ) as property_images,
    guest_profile.first_name as guest_first_name,
    guest_profile.last_name as guest_last_name,
    guest_profile.avatar_url as guest_avatar,
    host_profile.first_name as host_first_name,
    host_profile.last_name as host_last_name,
    host_profile.avatar_url as host_avatar,
    (
        SELECT content
        FROM messages
        WHERE conversation_id = c.id
        ORDER BY created_at DESC
        LIMIT 1
    ) as last_message_content
FROM conversations c
JOIN properties p ON c.property_id = p.id
JOIN profiles guest_profile ON c.guest_id = guest_profile.id
JOIN profiles host_profile ON c.host_id = host_profile.id;

COMMENT ON TABLE conversations IS 'Stores messaging conversations between guests and hosts';
COMMENT ON TABLE messages IS 'Stores individual messages within conversations';
COMMENT ON TABLE notifications IS 'Stores user notifications for various events';
