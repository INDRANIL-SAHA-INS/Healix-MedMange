/*
  # Fix Policies and Add Assistant Role

  1. Changes
    - Add 'assistant' to user_role enum
    - Update doctors table RLS policies
    - Fix permissions for authenticated users

  2. Security
    - Maintain proper access control
    - Update policies safely with existence checks
*/

-- Add 'assistant' to user_role enum
DO $$ 
BEGIN
    -- Add new enum value if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_type t
        JOIN pg_enum e ON t.oid = e.enumtypid
        WHERE t.typname = 'user_role'
        AND e.enumlabel = 'assistant'
    ) THEN
        ALTER TYPE user_role ADD VALUE 'assistant';
    END IF;
END $$;

-- Fix doctors table RLS policies
DO $$ 
BEGIN
    -- Drop existing policies
    DROP POLICY IF EXISTS "Admins can manage doctors" ON doctors;
    DROP POLICY IF EXISTS "Doctors can view own data" ON doctors;
    DROP POLICY IF EXISTS "Allow doctor creation" ON doctors;
    
    -- Create new policies with proper access control
    CREATE POLICY "Admins can manage doctors"
        ON doctors FOR ALL
        USING (
            EXISTS (
                SELECT 1 FROM users
                WHERE users.id = auth.uid()
                AND users.role = 'admin'
            )
        )
        WITH CHECK (
            EXISTS (
                SELECT 1 FROM users
                WHERE users.id = auth.uid()
                AND users.role = 'admin'
            )
        );

    -- Only recreate these policies if they don't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'doctors' 
        AND policyname = 'Doctors can view own data'
    ) THEN
        CREATE POLICY "Doctors can view own data"
            ON doctors FOR SELECT
            USING (id::text = auth.uid()::text);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'doctors' 
        AND policyname = 'Allow doctor creation'
    ) THEN
        CREATE POLICY "Allow doctor creation"
            ON doctors FOR INSERT
            WITH CHECK (
                EXISTS (
                    SELECT 1 FROM users
                    WHERE users.id = auth.uid()
                    AND users.role = 'admin'
                )
            );
    END IF;
END $$;

-- Update permissions safely
DO $$
BEGIN
    -- Revoke all permissions first to ensure clean state
    REVOKE ALL ON TABLE doctors FROM authenticated;
    REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM authenticated;
    
    -- Grant necessary permissions
    GRANT ALL ON TABLE doctors TO authenticated;
    GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;
END $$;