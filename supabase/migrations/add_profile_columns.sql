-- Migration: Add missing columns to profiles table
-- Run this in your Supabase Dashboard → SQL Editor

-- Add availability column (if it doesn't already exist)
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS availability text;

-- Add timezone column (if it doesn't already exist)
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS timezone text;

-- Add role column (if it doesn't already exist)
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS role text check (role in ('developer', 'designer', 'manager', 'other'));

-- Refresh the schema cache so PostgREST picks up the new columns
NOTIFY pgrst, 'reload schema';
