USER TABLE:

CREATE TABLE users (
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
name VARCHAR(100),
username VARCHAR(100),
email VARCHAR(100) UNIQUE NOT NULL,
password VARCHAR(100)
);
