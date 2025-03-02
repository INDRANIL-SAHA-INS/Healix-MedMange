-- Create assistants table
CREATE TABLE IF NOT EXISTS assistants (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    username text NOT NULL,
    password text NOT NULL,
    phone_number text,
    email text UNIQUE NOT NULL,
    region_id text NOT NULL,
    region_name text NOT NULL,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    FOREIGN KEY (region_id) REFERENCES regions(region_id)
);

-- Create trigger function
CREATE OR REPLACE FUNCTION update_assistants_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger
DROP TRIGGER IF EXISTS trigger_assistants_updated_at ON assistants;
CREATE TRIGGER trigger_assistants_updated_at
    BEFORE UPDATE ON assistants
    FOR EACH ROW
    EXECUTE FUNCTION update_assistants_updated_at();

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_assistants_email ON assistants(email);
CREATE INDEX IF NOT EXISTS idx_assistants_region_id ON assistants(region_id);

-- Grant permissions
GRANT ALL ON TABLE assistants TO authenticated;
GRANT ALL ON TABLE assistants TO anon;