-- Add additional indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_patient_health_records_updated_at 
ON patient_health_records(updated_at);

-- Add constraints to ensure data integrity
ALTER TABLE patient_health_records
ADD CONSTRAINT valid_bmi_range 
CHECK (bmi >= 0 AND bmi <= 100);

ALTER TABLE patient_health_records
ADD CONSTRAINT valid_heart_rate 
CHECK (heart_rate >= 0 AND heart_rate <= 300);

ALTER TABLE patient_health_records
ADD CONSTRAINT valid_oxygen_saturation 
CHECK (oxygen_saturation >= 0 AND oxygen_saturation <= 100);

-- Add comments for better documentation
COMMENT ON COLUMN patient_health_records.general_health IS 'Stores main complaint, symptom duration, and previous symptoms';
COMMENT ON COLUMN patient_health_records.pain_discomfort IS 'Stores pain location, level, and triggers';
COMMENT ON COLUMN patient_health_records.digestion_appetite IS 'Stores digestive issues and appetite changes';
COMMENT ON COLUMN patient_health_records.chronic_conditions IS 'Stores chronic conditions and current medications';
COMMENT ON COLUMN patient_health_records.lifestyle_habits IS 'Stores diet, exercise, and substance use information';
COMMENT ON COLUMN patient_health_records.womens_health IS 'Stores menstrual and pregnancy information';
COMMENT ON COLUMN patient_health_records.family_community_health IS 'Stores family history and community health data';
COMMENT ON COLUMN patient_health_records.mental_health IS 'Stores emotional state and stress information';

-- Add example JSONB structure validation triggers
CREATE OR REPLACE FUNCTION validate_health_record_json()
RETURNS TRIGGER AS $$
BEGIN
    -- Validate general_health structure
    IF NOT (NEW.general_health ? 'main_complaint' 
        AND NEW.general_health ? 'symptom_duration'
        AND NEW.general_health ? 'previous_symptoms') THEN
        RAISE EXCEPTION 'Invalid general_health structure';
    END IF;

    -- Validate pain_discomfort structure
    IF NOT (NEW.pain_discomfort ? 'pain_location'
        AND NEW.pain_discomfort ? 'pain_level'
        AND NEW.pain_discomfort ? 'pain_triggers') THEN
        RAISE EXCEPTION 'Invalid pain_discomfort structure';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER validate_health_record_json_trigger
    BEFORE INSERT OR UPDATE ON patient_health_records
    FOR EACH ROW
    EXECUTE FUNCTION validate_health_record_json();