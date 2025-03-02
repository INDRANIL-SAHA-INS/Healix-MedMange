/*
  # Disable Row Level Security

  1. Changes
    - Disable RLS on all tables
    - Grant full access to authenticated users
    - Grant full access to anon users for public data

  2. Security Note
    - This removes row-level security restrictions
    - All authenticated users will have full access to tables
    - Use with caution in production environments
*/

-- Disable RLS on all tables
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE doctors DISABLE ROW LEVEL SECURITY;
ALTER TABLE departments DISABLE ROW LEVEL SECURITY;
ALTER TABLE patients DISABLE ROW LEVEL SECURITY;
ALTER TABLE appointments DISABLE ROW LEVEL SECURITY;
ALTER TABLE medical_records DISABLE ROW LEVEL SECURITY;
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;

-- Grant necessary permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Grant read access to anon for public data
GRANT SELECT ON TABLE departments TO anon;
GRANT SELECT ON TABLE doctors TO anon;
GRANT USAGE ON SCHEMA public TO anon;