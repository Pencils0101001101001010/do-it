USER TABLE:

CREATE TABLE users (
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
name VARCHAR(100),
username VARCHAR(100),
email VARCHAR(100) UNIQUE NOT NULL,
password VARCHAR(100)
);

CREATE TABLE todo_list (
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
name VARCHAR(255) NOT NULL DEFAULT 'My TODO',
created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE todo_items (
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
list_id uuid NOT NULL REFERENCES todo_list(id) ON DELETE CASCADE,
description VARCHAR(255) NOT NULL,
is_done BOOLEAN NOT NULL DEFAULT FALSE,
created_at TIMESTAMP DEFAULT NOW()
);

-- Sharing: links a list to a user who has access, plus what they can do
CREATE TABLE todo_list_shares (
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
list_id uuid NOT NULL REFERENCES todo_list(id) ON DELETE CASCADE,
user_id uuid REFERENCES users(id) ON DELETE CASCADE, -- null until invite is accepted
invited_email VARCHAR(100) NOT NULL,
role VARCHAR(20) NOT NULL DEFAULT 'editor', -- e.g. 'owner', 'editor', 'viewer'
status VARCHAR(20) NOT NULL DEFAULT 'pending', -- 'pending', 'accepted'
created_at TIMESTAMP DEFAULT NOW(),
UNIQUE (list_id, invited_email)
);

CREATE INDEX idx_todo_list_user_id ON todo_list(user_id);
CREATE INDEX idx_todo_items_list_id ON todo_items(list_id);
CREATE INDEX idx_shares_list_id ON todo_list_shares(list_id);
CREATE INDEX idx_shares_user_id ON todo_list_shares(user_id);
CREATE INDEX idx_shares_email ON todo_list_shares(invited_email);

ALTER TABLE todo_list_shares
ADD CONSTRAINT valid_role CHECK (role IN ('owner', 'editor', 'viewer'));
