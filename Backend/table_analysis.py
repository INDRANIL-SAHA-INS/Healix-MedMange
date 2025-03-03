import logging
import requests
import pandas as pd
import numpy as np
from PIL import Image
from io import BytesIO
from supabase_client import supabase
from groq import Groq
import os
from sklearn.preprocessing import StandardScaler
from sklearn.impute import SimpleImputer
import json
import time

os.environ["GROQ_API_KEY"] = "add your own key"
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

# Configure logging
logging.basicConfig(level=logging.INFO)

def fetch_health_records(region_id):
    """Fetch specific health record columns for a region"""
    try:
        columns = [
            "digestion_appetite",
            "chronic_conditions",
            "lifestyle_habits",
            "womens_health",
            "family_community_health",
            "mental_health",
            "heart_rate",
            "blood_pressure",
            "respiratory_rate",
            "body_temperature",
            "bmi",
            "blood_glucose",
            "oxygen_saturation",
            "heart_health",
            "gender"
        ]
        columns_str = ",".join(columns)
        response = supabase.table('patient_health_records')\
            .select(columns_str)\
            .eq('region_id', region_id)\
            .execute()
            
        if response.data:
            logging.info(f"Fetched {len(response.data)} records with {len(columns)} health indicators")
        else:
            logging.warning(f"No records found for region {region_id}")
            
        return response.data
        
    except Exception as e:
        logging.error(f"Error fetching health records: {str(e)}")
        return None

def preprocess_data(records):
    """
    Preprocess data by flattening JSONB columns, handling missing values, encoding,
    and then producing two versions:
      - raw_df: data after imputation and encoding (clinically interpretable values)
      - scaled_df: data after applying StandardScaler (for risk score calculations)
    """
    df = pd.DataFrame(records)
    
    # Flatten JSONB columns
    def flatten_jsonb_column(df, column_name):
        if df[column_name].notna().any():
            expanded = pd.json_normalize(df[column_name])
            expanded.columns = [f"{column_name}_{k}" for k in expanded.columns]
            return pd.concat([df.drop(column_name, axis=1), expanded], axis=1)
        return df
    
    jsonb_columns = [
        'digestion_appetite',
        'chronic_conditions',
        'lifestyle_habits',
        'womens_health',
        'family_community_health',
        'mental_health',
        'heart_health'
    ]
    
    for col in jsonb_columns:
        df = flatten_jsonb_column(df, col)
    
    # Process blood pressure into systolic and diastolic columns
    df[['systolic_bp', 'diastolic_bp']] = df['blood_pressure'].str.split('/', expand=True).apply(pd.to_numeric, errors='coerce')
    df = df.drop('blood_pressure', axis=1)
    
    # Handle missing values
    numerical_cols = df.select_dtypes(include=np.number).columns
    categorical_cols = df.select_dtypes(include='object').columns

    if not numerical_cols.empty:
        num_imputer = SimpleImputer(strategy='median')
        df[numerical_cols] = num_imputer.fit_transform(df[numerical_cols])
    
    if not categorical_cols.empty:
        cat_imputer = SimpleImputer(strategy='most_frequent')
        df[categorical_cols] = cat_imputer.fit_transform(df[categorical_cols])
        df = pd.get_dummies(df, columns=categorical_cols.tolist(), drop_first=True)
    
    # Save a copy of the raw data (after imputation and encoding) for clinical stats
    raw_df = df.copy()
    
    # Apply StandardScaler to create a scaled version for computations (e.g., risk scores)
    scaler = StandardScaler()
    num_cols = df.select_dtypes(include=np.number).columns
    df[num_cols] = scaler.fit_transform(df[num_cols])
    scaled_df = df.copy()
    
    return scaled_df, raw_df

def create_features(df):
    """Create composite health indicators on scaled data"""
    # Cardiovascular risk score
    risk_factors = ['heart_rate', 'systolic_bp', 'bmi', 'blood_glucose']
    scaler = StandardScaler()
    scaled_risk = scaler.fit_transform(df[risk_factors])
    df['cv_risk_score'] = scaled_risk.mean(axis=1).round(2)
    
    # Respiratory health index: only compute if columns exist
    if 'respiratory_rate' in df.columns and 'oxygen_saturation' in df.columns:
        df['respiratory_health'] = (df['respiratory_rate'] / 20 + df['oxygen_saturation'] / 100).round(2)
    else:
        df['respiratory_health'] = np.nan
    
    return df

def detect_outliers(series, multiplier=1.5):
    """Return a dictionary with outlier details for a numeric series"""
    Q1 = series.quantile(0.25)
    Q3 = series.quantile(0.75)
    IQR = Q3 - Q1
    lower_bound = Q1 - multiplier * IQR
    upper_bound = Q3 + multiplier * IQR
    outliers = series[(series < lower_bound) | (series > upper_bound)]
    return {
        "outlier_count": int(len(outliers)),
        "total_count": int(len(series)),
        "outlier_percentage": round(len(outliers) / len(series) * 100, 2)
    }

def validate_and_format_data(scaled_df, raw_df):
    """
    Build a data package using:
      - Raw data for summary statistics and correlation matrix (clinically interpretable)
      - Scaled data for risk score statistics.
      - Also include outlier detection for data quality.
    """
    try:
        available_columns = raw_df.columns[raw_df.notna().any()].tolist()
        
        data_package = {
            "features": available_columns,
            "statistics": {},
            "correlations": {},
            "risk_scores": {},
            "data_quality": {}
        }
        
        # Compute statistics on the raw data
        num_cols = raw_df.select_dtypes(include=np.number).columns
        valid_num_cols = [col for col in num_cols if raw_df[col].notna().any()]
        if valid_num_cols:
            data_package["statistics"] = raw_df[valid_num_cols].agg(['mean', 'median', 'std', 'min', 'max']).round(2).to_dict()
        
        # Compute correlation matrix using raw data
        if len(valid_num_cols) > 1:
            corr_matrix = raw_df[valid_num_cols].corr().round(2)
            data_package["correlations"] = corr_matrix.to_dict()
        
        # Compute risk scores from scaled data if available
        if all(col in scaled_df.columns for col in ['heart_rate', 'systolic_bp', 'bmi', 'blood_glucose']):
            if 'cv_risk_score' in scaled_df.columns:
                cv_stats = scaled_df['cv_risk_score'].describe().to_dict()
                data_package["risk_scores"]["cardiovascular"] = cv_stats
                
        if all(col in scaled_df.columns for col in ['respiratory_rate', 'oxygen_saturation']):
            if 'respiratory_health' in scaled_df.columns:
                resp_stats = scaled_df['respiratory_health'].describe().to_dict()
                data_package["risk_scores"]["respiratory"] = resp_stats
        
        # Compute outlier summaries for each numeric column in raw data
        outlier_summary = {}
        for col in valid_num_cols:
            outlier_summary[col] = detect_outliers(raw_df[col])
        data_package["data_quality"]["outliers"] = outlier_summary
                
        return data_package
    except Exception as e:
        logging.error(f"Error in data validation: {str(e)}")
        return None

def analyze_health_records(records):
    """Enhanced analysis with sequential Groq API calls"""
    if not records:
        return {"analysis": "No health records found for this region"}
    
    try:
        # Preprocess and get both versions of the data
        scaled_df, raw_df = preprocess_data(records)
        scaled_df = create_features(scaled_df)
        data_package = validate_and_format_data(scaled_df, raw_df)
        
        if not data_package:
            return {"analysis": "Error: Data validation failed"}
        
        # Base data context for all prompts
        base_context = "Region Health Analysis Data Package:\n\n"
        for key, value in data_package.items():
            if value:
                base_context += f"{key.upper()}:\n{json.dumps(value, indent=2)}\n\n"

        # Define the four specialized prompts
        prompts = {
            "metrics_interpretation": {
                "instruction": """Based on the provided health data, provide a detailed interpretation of the available metrics in clinical context:
1. Analyze the statistical distributions
2. Identify any concerning values or trends
3. Evaluate the data quality and reliability
4. Interpret the risk scores in a clinical setting""",
                "result_key": "metrics_analysis"
            },
            "relationships_analysis": {
                "instruction": """Analyze the relationships between health indicators in the provided data:
1. Examine the correlation matrix
2. Identify strong positive and negative correlations
3. Explain the clinical significance of key relationships
4. Highlight any unexpected or concerning associations""",
                "result_key": "relationships_analysis"
            },
            "pattern_identification": {
                "instruction": """Identify and analyze significant patterns in the health data:
1. Detect any clustering or grouping of health indicators
2. Identify common health profiles or risk patterns
3. Analyze temporal or demographic patterns if available
4. Highlight any unusual or concerning patterns""",
                "result_key": "patterns_analysis"
            },
            "recommendations": {
                "instruction": """Provide specific recommendations based on the analyzed health data:
1. Suggest targeted interventions
2. Recommend preventive measures
3. Identify areas requiring immediate attention
4. Propose long-term health monitoring strategies""",
                "result_key": "recommendations"
            }
        }

        # Make separate API calls for each analysis aspect
        analysis_results = {}
        
        # Process prompts sequentially with delay between calls
        for analysis_type, prompt_info in prompts.items():
            try:
                logging.info(f"Starting {analysis_type} analysis...")
                
                messages = [{
                    "role": "user",
                    "content": f"{base_context}\nANALYSIS TASK:\n{prompt_info['instruction']}"
                }]
                
                # Make API call and wait for completion
                chat_completion = client.chat.completions.create(
                    messages=messages,
                    model="mixtral-8x7b-32768",
                    temperature=0.7,
                    max_tokens=5000
                )
                
                analysis_results[prompt_info['result_key']] = chat_completion.choices[0].message.content
                logging.info(f"Completed {analysis_type} analysis")
                
                # Wait for 5 seconds before next call to avoid rate limits
                time.sleep(60)
                
            except Exception as e:
                logging.error(f"Error in {analysis_type} analysis: {e}")
                analysis_results[prompt_info['result_key']] = f"Analysis failed: {str(e)}"
                # Wait longer if we hit an error (likely rate limit)
                time.sleep(10)

        return {
            "metrics_analysis": analysis_results.get("metrics_analysis", "Analysis failed"),
            "relationships_analysis": analysis_results.get("relationships_analysis", "Analysis failed"),
            "patterns_analysis": analysis_results.get("patterns_analysis", "Analysis failed"),
            "recommendations": analysis_results.get("recommendations", "Analysis failed"),
            "data_package": data_package
        }
        
    except Exception as e:
        logging.error(f"Analysis error: {str(e)}")
        return {"analysis": f"Analysis failed: {str(e)}"}

def test_analysis():
    """Test the enhanced analysis pipeline with multiple Groq calls"""
    test_region_id = input("Enter region ID to test: ")
    records = fetch_health_records(test_region_id)
    
    if records:
        try:
            print("\n" + "="*50)
            print("TESTING HEALTH RECORDS ANALYSIS")
            print("="*50)
            
            result = analyze_health_records(records)
            
            # Display validated data package
            if "data_package" in result:
                print("\nVALIDATED DATA PACKAGE:")
                print("-"*50)
                for key, value in result["data_package"].items():
                    if value:
                        print(f"\n{key.upper()}:")
                        print(json.dumps(value, indent=2))
            
            # Display all analysis results
            analysis_sections = [
                ("METRICS INTERPRETATION", "metrics_analysis"),
                ("RELATIONSHIPS ANALYSIS", "relationships_analysis"),
                ("SIGNIFICANT PATTERNS", "patterns_analysis"),
                ("RECOMMENDATIONS", "recommendations")
            ]
            
            for title, key in analysis_sections:
                if key in result:
                    print(f"\n{title}:")
                    print("="*50)
                    print(result[key])
                    print("-"*50)
            
            return True
            
        except Exception as e:
            logging.error(f"Analysis test failed: {e}")
            return False
    return False

if __name__ == "__main__":
    test_analysis()
