-- Create regions table
CREATE TABLE IF NOT EXISTS regions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    region_id text UNIQUE NOT NULL,
    name text NOT NULL,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Create trigger function
CREATE OR REPLACE FUNCTION update_regions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger
DROP TRIGGER IF EXISTS trigger_regions_updated_at ON regions;
CREATE TRIGGER trigger_regions_updated_at
    BEFORE UPDATE ON regions
    FOR EACH ROW
    EXECUTE FUNCTION update_regions_updated_at();

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_regions_region_id ON regions(region_id);
CREATE INDEX IF NOT EXISTS idx_regions_name ON regions(name);

-- Grant permissions
GRANT ALL ON TABLE regions TO authenticated;
GRANT ALL ON TABLE regions TO anon;