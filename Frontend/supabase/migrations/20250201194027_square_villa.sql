/*
  # Create doctors table and policies

  1. New Tables
    - `doctors`
      - `id` (uuid, primary key)
      - `ref_id` (text, unique)
      - `username` (text)
      - `department` (text)
      - `specialization` (text)
      - `phone_number` (text)
      - `email` (text, unique)
      - `password_hash` (text)
      - `assigned_regions` (text array)
      - `created_by_admin` (uuid, references users.id)
      - `created_at` (timestamptz)
      - `joining_date` (text)

  2. Security
    - Enable RLS on `doctors` table
    - Add policy for admins to manage doctors
    - Add policy for doctors to view their own data

  3. Indexes
    - Email index for faster lookups
    - Reference ID index for faster searches
*/

-- Create doctors table if it doesn't exist
CREATE TABLE IF NOT EXISTS doctors (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    ref_id text UNIQUE NOT NULL,
    username text NOT NULL,
    department text NOT NULL,
    specialization text NOT NULL,
    phone_number text,
    email text UNIQUE NOT NULL,
    password_hash text NOT NULL,
    assigned_regions text[] DEFAULT '{}',
    created_by_admin uuid REFERENCES users(id),
    created_at timestamptz DEFAULT now(),
    joining_date text NOT NULL
);

-- Enable Row Level Security
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;

-- Create policies
DO $$ 
BEGIN
    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "Admins can manage doctors" ON doctors;
    DROP POLICY IF EXISTS "Doctors can view own data" ON doctors;
    
    -- Create new policies
    CREATE POLICY "Admins can manage doctors"
        ON doctors FOR ALL
        USING (
            EXISTS (
                SELECT 1 FROM users
                WHERE users.id = auth.uid() 
                AND role = 'admin'
            )
        );

    CREATE POLICY "Doctors can view own data"
        ON doctors FOR SELECT
        USING (id::text = auth.uid()::text);
END $$;

-- Create indexes if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'idx_doctors_email'
    ) THEN
        CREATE INDEX idx_doctors_email ON doctors(email);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'idx_doctors_ref_id'
    ) THEN
        CREATE INDEX idx_doctors_ref_id ON doctors(ref_id);
    END IF;
END $$;

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION update_doctors_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'trigger_doctors_updated_at'
    ) THEN
        CREATE TRIGGER trigger_doctors_updated_at
            BEFORE UPDATE ON doctors
            FOR EACH ROW
            EXECUTE FUNCTION update_doctors_updated_at();
    END IF;
END $$;