/*
  # Add initial regions

  1. New Data
    - Adds initial regions to the regions table
    - Each region has a unique region_id and name
  2. Changes
    - Inserts sample regions for testing and development
*/

-- Insert initial regions if they don't exist
INSERT INTO regions (region_id, name)
VALUES 
    ('REG001', 'North Wing'),
    ('REG002', 'South Wing'),
    ('REG003', 'East Wing'),
    ('REG004', 'West Wing'),
    ('REG005', 'Central Wing')
ON CONFLICT (region_id) DO NOTHING;