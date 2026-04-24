-- Migration: Add projects table
-- Run this against your existing D1 database:
--   npx wrangler d1 execute open-essex-db --local --file=./schema_projects.sql
--   npx wrangler d1 execute open-essex-db --remote --file=./schema_projects.sql

CREATE TABLE IF NOT EXISTS projects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  author TEXT NOT NULL,
  status TEXT DEFAULT 'planning',
  likes INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
