from flask import Flask, request, jsonify
from flask_cors import CORS
import medical_chat
import logging
from supabase_client import supabase
from table_analysis import analyze_health_records, fetch_health_records
from individual_analysis import main as get_individual_analysis
from datetime import datetime

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)

app = Flask(__name__)
CORS(app, resources={
    r"/*": {
        "origins": ["http://localhost:5173"],
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type"]
    }
})

@app.route('/doctor/chat-ai', methods=['POST'])
def get_ai_response():
    try:
        data = request.json
        user_input = data.get("question")
        conversation = data.get("conversationsNew", [])
        option = data.get("option", "")
        img_url = data.get("imgurl", "")
        previous_summary = data.get("summary", "")
        visit_patient_id = data.get("visit_patient_id")
        is_new_chat = data.get("is_new_chat", False)

        if not user_input:
            return jsonify({"error": "No question provided"}), 400

        # Reset summary if it's a new chat
        if is_new_chat:
            previous_summary = ""

        result = medical_chat.medical_assistant(
            user_input, 
            conversation, 
            option, 
            img_url, 
            previous_summary,
            visit_patient_id
        )

        return jsonify({
            "response": result["response"],
            "summary": result["updated_summary"]
        })

    except Exception as e:
        logging.error(f"Error in get_ai_response: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/chronic-disease', methods=['POST'])
def get_chronic_disease_analysis():
    try:
        data = request.json
        region_id = data.get('region_id')
        
        logging.info(f"Processing chronic disease analysis for Region ID: {region_id}")

        if not region_id:
            return jsonify({"error": "No region ID provided"}), 400

        # Fetch records first
        records = fetch_health_records(region_id)
        if not records:
            return jsonify({
                "error": "No health records found",
                "region_id": region_id
            }), 404

        # Get analysis using analyze_health_records from table_analysis
        analysis_result = analyze_health_records(records)
        
        # Update region_analysis table
        try:
            # Check if region exists
            existing_analysis = supabase.table('region_analysis')\
                .select('*')\
                .eq('region_id', region_id)\
                .execute()

            # Prepare analysis data
            analysis_data = {
                'region_id': region_id,
                'health_indicators_relationships': analysis_result.get("relationships_analysis"),
                'healthcare_recommendations': analysis_result.get("recommendations"),
                'health_patterns_identified': analysis_result.get("patterns_analysis"),
                'health_metrics_analysis': analysis_result.get("metrics_analysis"),
                'key_features': analysis_result.get("data_package", {}).get("features", []),
                'total_records': len(records)  # Add total records count
            }

            if existing_analysis.data:
                # Update existing record
                response = supabase.table('region_analysis')\
                    .update(analysis_data)\
                    .eq('region_id', region_id)\
                    .execute()
                print(f"\n✓ Updated analysis for region {region_id} with {len(records)} records")
                logging.info(f"Updated existing analysis for region {region_id}")
            else:
                # Insert new record
                response = supabase.table('region_analysis')\
                    .insert(analysis_data)\
                    .execute()
                print(f"\n✓ Created new analysis for region {region_id} with {len(records)} records")
                logging.info(f"Created new analysis for region {region_id}")

        except Exception as e:
            print(f"\n✗ Failed to update region_analysis table: {str(e)}")
            logging.error(f"Failed to update region_analysis table: {str(e)}")

        # Structure the response for frontend
        response = {
            "analysis_sections": {
                "metrics": {
                    "title": "Health Metrics Analysis",
                    "content": analysis_result.get("metrics_analysis")
                },
                "relationships": {
                    "title": "Health Indicators Relationships",
                    "content": analysis_result.get("relationships_analysis")
                },
                "patterns": {
                    "title": "Health Patterns Identified",
                    "content": analysis_result.get("patterns_analysis")
                },
                "recommendations": {
                    "title": "Healthcare Recommendations",
                    "content": analysis_result.get("recommendations")
                }
            },
            "statistics": {
                "total_records": len(records),
                "features": analysis_result.get("data_package", {}).get("features", []),
                "risk_scores": analysis_result.get("data_package", {}).get("risk_scores", {})
            }
        }

        return jsonify(response), 200

    except Exception as e:
        logging.error(f"Error in get_chronic_disease_analysis: {str(e)}")
        return jsonify({
            "status": "error",
            "error": str(e),
            "region_id": region_id if 'region_id' in locals() else None
        }), 500

@app.route('/analysis', methods=['POST'])
def get_patient_analysis():
    try:
        data = request.json
        visit_patient_id = data.get('visit_patient_id')
        
        logging.info(f"Processing individual analysis for Patient ID: {visit_patient_id}")

        if not visit_patient_id:
            return jsonify({"error": "No patient ID provided"}), 400

        # Get analysis and recommendations using main function
        analysis, recommendations = get_individual_analysis(visit_patient_id)
        
        if not analysis and not recommendations:
            return jsonify({
                "error": "Analysis failed or no data found"
            }), 404

        # Return data in the specified format
        return jsonify({
            "initial_analysis": analysis,
            "recommendations": recommendations
        }), 200

    except Exception as e:
        logging.error(f"Error in get_patient_analysis: {str(e)}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(port=5000, debug=True)