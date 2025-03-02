/*
  # Fix Doctors Table RLS and Permissions

  1. Changes
    - Simplify RLS policies for doctors table
    - Grant proper permissions to authenticated users
    - Enable RLS with proper policies

  2. Security
    - Ensure admins can manage doctors
    - Allow proper access for authenticated users
*/

-- Drop all existing policies on doctors table to start fresh
DROP POLICY IF EXISTS "Admins can manage doctors" ON doctors;
DROP POLICY IF EXISTS "Doctors can view own data" ON doctors;
DROP POLICY IF EXISTS "Allow doctor creation" ON doctors;

-- Create simplified policies
CREATE POLICY "authenticated_users_read"
    ON doctors FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "admin_all_access"
    ON doctors FOR ALL
    TO authenticated
    USING (
        auth.jwt() ->> 'role' = 'admin'
    )
    WITH CHECK (
        auth.jwt() ->> 'role' = 'admin'
    );

-- Ensure RLS is enabled
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;

-- Update permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON TABLE doctors TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Ensure public can use the auth API
GRANT USAGE ON SCHEMA auth TO anon;
GRANT USAGE ON SCHEMA auth TO authenticated;

-- Grant access to auth functions
GRANT EXECUTE ON FUNCTION auth.jwt() TO anon;
GRANT EXECUTE ON FUNCTION auth.jwt() TO authenticated;