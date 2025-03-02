/*
  # Initial Schema Setup for Medical Management System

  1. New Tables
    - `users`: Stores admin and doctor information
      - `id` (uuid, primary key)
      - `email` (text, unique)
      - `full_name` (text)
      - `role` (enum: admin, doctor)
      - `specialty` (text, for doctors)
      - `license_number` (text, for doctors)
      - `status` (enum: active, inactive)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `departments`
      - `id` (uuid, primary key)
      - `name` (text)
      - `head_doctor_id` (uuid, references users)
      - `description` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `patients`
      - `id` (uuid, primary key)
      - `full_name` (text)
      - `email` (text)
      - `date_of_birth` (date)
      - `gender` (text)
      - `contact_number` (text)
      - `address` (text)
      - `medical_history` (jsonb)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `appointments`
      - `id` (uuid, primary key)
      - `patient_id` (uuid, references patients)
      - `doctor_id` (uuid, references users)
      - `department_id` (uuid, references departments)
      - `scheduled_at` (timestamp)
      - `status` (enum: scheduled, completed, cancelled)
      - `notes` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `medical_records`
      - `id` (uuid, primary key)
      - `patient_id` (uuid, references patients)
      - `doctor_id` (uuid, references users)
      - `appointment_id` (uuid, references appointments)
      - `diagnosis` (text)
      - `prescription` (jsonb)
      - `notes` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `messages`
      - `id` (uuid, primary key)
      - `sender_id` (uuid, references users)
      - `recipient_id` (uuid, references users)
      - `content` (text)
      - `attachments` (jsonb)
      - `read_at` (timestamp)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for admin and doctor access
    - Secure patient data access

  3. Indexes
    - Add indexes for frequently queried columns
    - Optimize for common search patterns
*/

-- Create custom types
CREATE TYPE user_role AS ENUM ('admin', 'doctor');
CREATE TYPE user_status AS ENUM ('active', 'inactive');
CREATE TYPE appointment_status AS ENUM ('scheduled', 'completed', 'cancelled');

-- Create users table
CREATE TABLE users (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    email text UNIQUE NOT NULL,
    full_name text NOT NULL,
    role user_role NOT NULL,
    specialty text,
    license_number text,
    status user_status DEFAULT 'active',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Create departments table
CREATE TABLE departments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    head_doctor_id uuid REFERENCES users(id),
    description text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Create patients table
CREATE TABLE patients (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name text NOT NULL,
    email text,
    date_of_birth date,
    gender text,
    contact_number text,
    address text,
    medical_history jsonb DEFAULT '{}',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Create appointments table
CREATE TABLE appointments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id uuid REFERENCES patients(id),
    doctor_id uuid REFERENCES users(id),
    department_id uuid REFERENCES departments(id),
    scheduled_at timestamptz NOT NULL,
    status appointment_status DEFAULT 'scheduled',
    notes text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Create medical_records table
CREATE TABLE medical_records (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id uuid REFERENCES patients(id),
    doctor_id uuid REFERENCES users(id),
    appointment_id uuid REFERENCES appointments(id),
    diagnosis text,
    prescription jsonb DEFAULT '{}',
    notes text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Create messages table
CREATE TABLE messages (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id uuid REFERENCES users(id),
    recipient_id uuid REFERENCES users(id),
    content text NOT NULL,
    attachments jsonb DEFAULT '{}',
    read_at timestamptz,
    created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_appointments_scheduled_at ON appointments(scheduled_at);
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_medical_records_patient_id ON medical_records(patient_id);
CREATE INDEX idx_messages_recipient_id ON messages(recipient_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);

-- Create RLS Policies

-- Users policies
CREATE POLICY "Users can view their own profile"
    ON users FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Admins can manage all users"
    ON users FOR ALL
    USING (EXISTS (
        SELECT 1 FROM users
        WHERE users.id = auth.uid() AND role = 'admin'
    ));

-- Departments policies
CREATE POLICY "Anyone can view departments"
    ON departments FOR SELECT
    USING (true);

CREATE POLICY "Admins can manage departments"
    ON departments FOR ALL
    USING (EXISTS (
        SELECT 1 FROM users
        WHERE users.id = auth.uid() AND role = 'admin'
    ));

-- Patients policies
CREATE POLICY "Doctors can view their patients"
    ON patients FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM appointments
        WHERE appointments.patient_id = patients.id
        AND appointments.doctor_id = auth.uid()
    ));

CREATE POLICY "Admins can view all patients"
    ON patients FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM users
        WHERE users.id = auth.uid() AND role = 'admin'
    ));

-- Appointments policies
CREATE POLICY "Users can view their appointments"
    ON appointments FOR SELECT
    USING (
        doctor_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid() AND role = 'admin'
        )
    );

-- Medical records policies
CREATE POLICY "Doctors can view their patients' records"
    ON medical_records FOR SELECT
    USING (
        doctor_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM appointments
            WHERE appointments.patient_id = medical_records.patient_id
            AND appointments.doctor_id = auth.uid()
        )
    );

-- Messages policies
CREATE POLICY "Users can view their messages"
    ON messages FOR SELECT
    USING (
        sender_id = auth.uid() OR
        recipient_id = auth.uid()
    );

CREATE POLICY "Users can send messages"
    ON messages FOR INSERT
    WITH CHECK (sender_id = auth.uid());

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_departments_updated_at
    BEFORE UPDATE ON departments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_patients_updated_at
    BEFORE UPDATE ON patients
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at
    BEFORE UPDATE ON appointments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_medical_records_updated_at
    BEFORE UPDATE ON medical_records
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();