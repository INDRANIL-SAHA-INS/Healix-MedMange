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

-- Create trigger to auto-generate ref_id
CREATE TRIGGER set_assistant_ref_id
    BEFORE INSERT ON assistants
    FOR EACH ROW
    EXECUTE FUNCTION generate_assistant_ref_id(); 