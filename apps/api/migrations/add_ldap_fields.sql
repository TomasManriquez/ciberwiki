-- Migration: Add LDAP authentication fields to users table
-- This adds username and auth_provider columns for LDAP/FreeIPA integration

-- Add username column (nullable, we'll add unique index separately)
ALTER TABLE users ADD COLUMN username TEXT;

-- Add auth_provider column with default 'google'
ALTER TABLE users ADD COLUMN auth_provider TEXT DEFAULT 'google';

-- Create unique index on username for faster lookups and uniqueness constraint
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_username ON users(username) WHERE username IS NOT NULL;
