-- Migration: Add missing columns to projects table
-- Run this in your Supabase Dashboard → SQL Editor

-- Add team_size column (if it doesn't already exist)
ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS team_size integer DEFAULT 3;

-- Add github_url column (if it doesn't already exist)
ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS github_url text;

-- Add image_url column (if it doesn't already exist)
ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS image_url text;

-- Refresh the schema cache so PostgREST picks up the new columns
NOTIFY pgrst, 'reload schema';
