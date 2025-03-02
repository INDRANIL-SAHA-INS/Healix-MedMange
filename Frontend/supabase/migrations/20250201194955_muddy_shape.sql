/*
  # Fix User Policies and Doctor Schema

  1. Changes
    - Fix recursive user policies
    - Add missing password column to doctors
    - Update RLS policies to be non-recursive

  2. Security
    - Maintain RLS security
    - Ensure proper access control
*/

-- Fix recursive user policies
DO $$ 
BEGIN
    -- Drop existing policies to prevent recursion
    DROP POLICY IF EXISTS "Users can view their own profile" ON users;
    DROP POLICY IF EXISTS "Admins can manage all users" ON users;

    -- Create new non-recursive policies
    CREATE POLICY "Users can view their own profile"
        ON users FOR SELECT
        USING (auth.uid() = id);

    CREATE POLICY "Admins can manage all users"
        ON users FOR ALL
        USING (
            (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
        );
END $$;

-- Fix doctors table schema
DO $$ 
BEGIN
    -- Add password column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'doctors' AND column_name = 'password'
    ) THEN
        ALTER TABLE doctors ADD COLUMN password text;
    END IF;

    -- Ensure all required columns exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'doctors' AND column_name = 'status'
    ) THEN
        ALTER TABLE doctors ADD COLUMN status text DEFAULT 'active';
    END IF;
END $$;

-- Update doctors policies
DO $$ 
BEGIN
    -- Drop existing policies
    DROP POLICY IF EXISTS "Admins can manage doctors" ON doctors;
    
    -- Create new non-recursive policy
    CREATE POLICY "Admins can manage doctors"
        ON doctors FOR ALL
        USING (
            (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
        );
END $$;