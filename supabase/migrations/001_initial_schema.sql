-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create mailboxes table
CREATE TABLE mailboxes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    email_address VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create emails table
CREATE TABLE emails (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mailbox_id UUID NOT NULL REFERENCES mailboxes(id) ON DELETE CASCADE,
    message_id VARCHAR(255) UNIQUE NOT NULL,
    from_address VARCHAR(255) NOT NULL,
    from_name VARCHAR(255),
    to_address VARCHAR(255) NOT NULL,
    subject TEXT NOT NULL,
    body_text TEXT,
    body_html TEXT,
    received_at TIMESTAMP WITH TIME ZONE NOT NULL,
    is_read BOOLEAN DEFAULT false,
    is_starred BOOLEAN DEFAULT false,
    attachments JSONB DEFAULT '[]'::jsonb,
    headers JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_mailboxes_user_id ON mailboxes(user_id);
CREATE INDEX idx_mailboxes_email_address ON mailboxes(email_address);
CREATE INDEX idx_emails_mailbox_id ON emails(mailbox_id);
CREATE INDEX idx_emails_message_id ON emails(message_id);
CREATE INDEX idx_emails_received_at ON emails(received_at DESC);
CREATE INDEX idx_emails_from_address ON emails(from_address);
CREATE INDEX idx_emails_subject ON emails USING gin(to_tsvector('english', subject));
CREATE INDEX idx_emails_is_read ON emails(is_read);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mailboxes_updated_at BEFORE UPDATE ON mailboxes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_emails_updated_at BEFORE UPDATE ON emails
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE mailboxes ENABLE ROW LEVEL SECURITY;
ALTER TABLE emails ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can only see their own data
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

-- Users can only see their own mailboxes
CREATE POLICY "Users can view own mailboxes" ON mailboxes
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own mailboxes" ON mailboxes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own mailboxes" ON mailboxes
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own mailboxes" ON mailboxes
    FOR DELETE USING (auth.uid() = user_id);

-- Users can only see emails in their mailboxes
CREATE POLICY "Users can view emails in own mailboxes" ON emails
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM mailboxes 
            WHERE mailboxes.id = emails.mailbox_id 
            AND mailboxes.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert emails in own mailboxes" ON emails
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM mailboxes 
            WHERE mailboxes.id = emails.mailbox_id 
            AND mailboxes.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update emails in own mailboxes" ON emails
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM mailboxes 
            WHERE mailboxes.id = emails.mailbox_id 
            AND mailboxes.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete emails in own mailboxes" ON emails
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM mailboxes 
            WHERE mailboxes.id = emails.mailbox_id 
            AND mailboxes.user_id = auth.uid()
        )
    );
