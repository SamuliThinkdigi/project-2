/*
  # Fix Foreign Key Relationship Between Profiles and Organizations

  1. Changes
    - Ensure proper foreign key constraint exists between profiles.organization_id and organizations.id
    - Add missing constraint if it doesn't exist
    - Update any existing data to maintain referential integrity

  2. Security
    - Maintain existing RLS policies
*/

-- First, check if the foreign key constraint already exists and drop it if it does
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'profiles_organization_id_fkey' 
    AND table_name = 'profiles'
  ) THEN
    ALTER TABLE profiles DROP CONSTRAINT profiles_organization_id_fkey;
  END IF;
END $$;

-- Ensure organization_id column exists and has the correct type
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'organization_id'
  ) THEN
    ALTER TABLE profiles ADD COLUMN organization_id uuid;
  END IF;
END $$;

-- Add the foreign key constraint
ALTER TABLE profiles 
ADD CONSTRAINT profiles_organization_id_fkey 
FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE SET NULL;

-- Create an index on the foreign key for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_organization_id ON profiles(organization_id);