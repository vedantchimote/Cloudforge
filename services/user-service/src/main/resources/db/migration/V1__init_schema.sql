-- V1__init_schema.sql
-- CloudForge User Service Database Schema

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255),
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    role VARCHAR(20) NOT NULL DEFAULT 'USER',
    enabled BOOLEAN NOT NULL DEFAULT true,
    ldap_dn VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- Insert default admin user (password: admin123 - BCrypt hashed)
INSERT INTO users (username, email, password_hash, first_name, last_name, role)
VALUES (
    'admin',
    'admin@cloudforge.io',
    '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi',
    'Admin',
    'User',
    'ADMIN'
);

-- Insert sample user (password: user123 - BCrypt hashed)
INSERT INTO users (username, email, password_hash, first_name, last_name, role)
VALUES (
    'user',
    'user@cloudforge.io',
    '$2a$10$EblZqNptyYvcLm/VwDCVAuBjzZOI7khzdPH2d.VlB3LNJSXeRJd2.',
    'Regular',
    'User',
    'USER'
);
