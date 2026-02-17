-- Add address fields to users table
ALTER TABLE users
    ADD COLUMN phone VARCHAR(20),
    ADD COLUMN address_line1 VARCHAR(255),
    ADD COLUMN address_line2 VARCHAR(255),
    ADD COLUMN city VARCHAR(100),
    ADD COLUMN state VARCHAR(100),
    ADD COLUMN postal_code VARCHAR(20),
    ADD COLUMN country VARCHAR(100);

-- Add index on postal_code for faster lookups
CREATE INDEX idx_users_postal_code ON users(postal_code);
