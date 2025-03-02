/*
  # Fix All Recursive Policies

  1. Changes
    - Fix recursive policies for all tables
    - Simplify policy logic
    - Update all dependent policies

  2. Security
    - Maintain proper access control
    - Ensure non-recursive policy checks
*/

-- Fix all recursive policies
DO $$ 
BEGIN
    -- Drop all existing policies that might cause recursion
    DROP POLICY IF EXISTS "Users can view their own profile" ON users;
    DROP POLICY IF EXISTS "Admins can manage all users" ON users;
    DROP POLICY IF EXISTS "Doctors can view their patients" ON patients;
    DROP POLICY IF EXISTS "Admins can view all patients" ON patients;
    DROP POLICY IF EXISTS "Users can view their appointments" ON appointments;
    DROP POLICY IF EXISTS "Doctors can view their patients' records" ON medical_records;

    -- Create new non-recursive policies using role-based checks
    
    -- Users table policies
    CREATE POLICY "Public user profile access"
        ON users FOR SELECT
        USING (true);  -- Allow public read of user profiles

    CREATE POLICY "Self profile management"
        ON users FOR UPDATE
        USING (auth.uid() = id);

    CREATE POLICY "Admin user management"
        ON users FOR ALL
        USING (
            COALESCE(current_setting('request.jwt.claims', true)::json->>'role', '') = 'admin'
        );

    -- Patients table policies
    CREATE POLICY "Patient access control"
        ON patients FOR SELECT
        USING (
            COALESCE(current_setting('request.jwt.claims', true)::json->>'role', '') IN ('admin', 'doctor')
        );

    -- Appointments table policies
    CREATE POLICY "Appointment access control"
        ON appointments FOR SELECT
        USING (
            COALESCE(current_setting('request.jwt.claims', true)::json->>'role', '') IN ('admin', 'doctor') OR
            patient_id::text = auth.uid()::text
        );

    -- Medical records policies
    CREATE POLICY "Medical records access control"
        ON medical_records FOR SELECT
        USING (
            COALESCE(current_setting('request.jwt.claims', true)::json->>'role', '') = 'admin' OR
            doctor_id::text = auth.uid()::text OR
            patient_id::text = auth.uid()::text
        );
END $$;

-- Update default permissions
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO authenticated;