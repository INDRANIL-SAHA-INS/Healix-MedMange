from dotenv import load_dotenv
import os
import logging

# Load environment variables from .env if available
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# Load Groq API key from environment
groq_api_key = os.getenv("GROQ_API_KEY")
if not groq_api_key:
    raise ValueError("GROQ_API_KEY not set in environment.")

# Initialize Groq client
from groq import Groq
client = Groq(api_key=groq_api_key)

# Import supabase client
from supabase_client import supabase

def get_analysis_and_recommendations(record):
    """Get temporal analysis and recommendations in a single API call"""
    try:
        combined_prompt = f"""You are a healthcare data analyst specializing in longitudinal health data analysis.

Analyze the following patient health records chronologically and provide both analysis and recommendations in two sections:

SECTION 1 - TEMPORAL ANALYSIS:
1. Temporal patterns in vital signs and health metrics
2. Trends in chronic conditions or symptoms
3. Changes in overall health status over time
4. Notable improvements or deteriorations
5. Key health events or significant changes

Patient Health Records (Time Series): {record}

Analysis should highlight:
- Short-term changes (recent visits)
- Long-term trends (across all visits)
- Patterns in vital signs
- Changes in symptoms or conditions
- Risk factor progression

SECTION 2 - RECOMMENDATIONS:
1. Time-sensitive recommendations:
   - Immediate interventions needed
   - Short-term monitoring requirements
   - Long-term management strategies

2. Progressive care plan:
   - Frequency of follow-up visits
   - Monitoring schedule for vital signs
   - Timeline for preventive screenings
   - Adjustments to current treatments

3. Risk mitigation strategies:
   - Lifestyle modifications
   - Preventive measures
   - Early intervention triggers
   - Regular assessment points

Please provide your response in two clearly separated sections marked as 'ANALYSIS:' and 'RECOMMENDATIONS:'"""

        messages = [{"role": "user", "content": combined_prompt}]

        # Single API call for both analysis and recommendations
        completion = client.chat.completions.create(
            messages=messages,
            model="mixtral-8x7b-32768",
            temperature=0.7,
            max_tokens=2000
        )
        
        response_text = completion.choices[0].message.content
        
        # Split response into analysis and recommendations
        try:
            analysis_part = response_text.split("RECOMMENDATIONS:")[0].replace("ANALYSIS:", "").strip()
            recommendations_part = response_text.split("RECOMMENDATIONS:")[1].strip()
        except:
            logging.error("Failed to split response into analysis and recommendations")
            return None, None

        return analysis_part, recommendations_part

    except Exception as e:
        logging.error(f"Error in analysis: {e}")
        return None, None

def main(visit_patient_id):
    """Get analysis for a specific visit_patient_id"""
    try:
        # Fetch data from patient_health_records for the given visit_patient_id
        response = supabase.table("patient_health_records")\
            .select("*")\
            .eq("visit_patient_id", visit_patient_id)\
            .execute()
        
        records = response.data
        if not records:
            logging.info(f"No records found for visit_patient_id {visit_patient_id}")
            return None, None

        logging.info(f"Fetched {len(records)} records for visit_patient_id: {visit_patient_id}")
        
        # Get combined analysis for all records
        combined_record = {
            "visit_patient_id": visit_patient_id,
            "records": records
        }
        
        # Get both analysis and recommendations
        analysis, recommendations = get_analysis_and_recommendations(combined_record)

        if not analysis or not recommendations:
            logging.error("Failed to generate analysis or recommendations")
            return None, None

        return analysis, recommendations

    except Exception as e:
        logging.error(f"Error in main: {str(e)}")
        return None, None

if __name__ == "__main__":
    visit_patient_id = input("Enter visit patient ID: ")
    analysis, recommendations = main(visit_patient_id)
    if analysis and recommendations:
        print("\n" + "="*50)
        print("INITIAL ANALYSIS:")
        print(analysis)
        print("\n" + "="*50)
        print("RECOMMENDATIONS:")
        print(recommendations)