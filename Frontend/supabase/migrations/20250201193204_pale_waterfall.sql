/*
  # Add doctors table

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
      - `assigned_regions` (text[])
      - `created_by_admin` (uuid)
      - `created_at` (timestamptz)
      - `joining_date` (text)

  2. Security
    - Enable RLS on `doctors` table
    - Add policies for admin access
*/

-- Create doctors table
CREATE TABLE doctors (
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
CREATE POLICY "Admins can manage doctors"
    ON doctors FOR ALL
    USING (EXISTS (
        SELECT 1 FROM users
        WHERE users.id = auth.uid() AND role = 'admin'
    ));

-- Create indexes
CREATE INDEX idx_doctors_email ON doctors(email);
CREATE INDEX idx_doctors_ref_id ON doctors(ref_id);