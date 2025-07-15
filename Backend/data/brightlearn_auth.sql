-- SQL schema for BrightLearn authentication (users table)
-- This file can be used with SQLite, MySQL, or PostgreSQL (minor tweaks may be needed)

CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert example user (for testing, remove in production)
-- INSERT INTO users (full_name, email, password_hash) VALUES ('Test User', 'test@example.com', 'hashedpassword');

-- To use for signup: INSERT INTO users (full_name, email, password_hash) VALUES (?, ?, ?);
-- To use for login: SELECT * FROM users WHERE email = ?;
-- To use for profile: SELECT full_name, email, created_at FROM users WHERE id = ?;
