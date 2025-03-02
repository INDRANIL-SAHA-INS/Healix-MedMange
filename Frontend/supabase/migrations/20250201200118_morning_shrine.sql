/*
  # Simplify Doctor Management

  1. Changes
    - Remove authentication requirements
    - Simplify doctors table schema
    - Update policies for open access

  2. Security
    - Remove auth dependencies
    - Enable basic RLS
*/

-- Modify doctors table to remove auth-related columns
ALTER TABLE doctors 
    DROP COLUMN IF EXISTS password_hash,
    DROP COLUMN IF EXISTS created_by_admin;

-- Drop all existing policies
DROP POLICY IF EXISTS "enable_all_access" ON doctors;
DROP POLICY IF EXISTS "authenticated_users_read" ON doctors;
DROP POLICY IF EXISTS "admin_all_access" ON doctors;
DROP POLICY IF EXISTS "Admins can manage doctors" ON doctors;
DROP POLICY IF EXISTS "Doctors can view own data" ON doctors;
DROP POLICY IF EXISTS "Allow doctor creation" ON doctors;

-- Create simple open access policy
CREATE POLICY "allow_all_access" ON doctors
    FOR ALL 
    USING (true)
    WITH CHECK (true);

-- Ensure RLS is enabled but with open access
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;

-- Grant necessary permissions
GRANT ALL ON TABLE doctors TO anon;
GRANT ALL ON TABLE doctors TO authenticated;
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;