-- V2 shipped seed users whose BCrypt hashes do not actually verify against
-- 'password123' (login failed for every seed account). Re-hash the passwords
-- at migration time so the documented seed credentials work.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

UPDATE users
SET password = crypt('password123', gen_salt('bf', 10)),
    updated_at = CURRENT_TIMESTAMP
WHERE email IN ('devendra@nexus.com', 'achal@nexus.com', 'vidhi@nexus.com', 'palak@nexus.com');
