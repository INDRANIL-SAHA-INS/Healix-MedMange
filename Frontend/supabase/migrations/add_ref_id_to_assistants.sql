-- Add ref_id column to existing assistants table
ALTER TABLE assistants 
ADD COLUMN IF NOT EXISTS ref_id text UNIQUE;

-- Create function to generate assistant ref_id
CREATE OR REPLACE FUNCTION generate_assistant_ref_id()
RETURNS TRIGGER AS $$
DECLARE
    new_ref_id TEXT;
    counter INTEGER := 1;
BEGIN
    -- Generate initial ref_id
    new_ref_id := 'AST-' || TO_CHAR(NOW(), 'YYMM') || '-' || LPAD(counter::TEXT, 4, '0');
    
    -- Keep trying until we find a unique ref_id
    WHILE EXISTS (SELECT 1 FROM assistants WHERE ref_id = new_ref_id) LOOP
        counter := counter + 1;
        new_ref_id := 'AST-' || TO_CHAR(NOW(), 'YYMM') || '-' || LPAD(counter::TEXT, 4, '0');
    END LOOP;
    
    -- Set the new ref_id
    NEW.ref_id := new_ref_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for auto-generating ref_id
DROP TRIGGER IF EXISTS set_assistant_ref_id ON assistants;
CREATE TRIGGER set_assistant_ref_id
    BEFORE INSERT ON assistants
    FOR EACH ROW
    EXECUTE FUNCTION generate_assistant_ref_id();

-- Create index for ref_id if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_assistants_ref_id ON assistants(ref_id);

-- Generate ref_ids for existing records that don't have one
UPDATE assistants 
SET ref_id = 'AST-' || TO_CHAR(created_at, 'YYMM') || '-' || LPAD(CAST(ctid::text AS INTEGER)::text, 4, '0')
WHERE ref_id IS NULL;