import os
import requests
from PIL import Image
from io import BytesIO
from supabase_client import supabase
from groq import Groq

os.environ["GROQ_API_KEY"] = "add your own key"
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

model_a=model_b=model_c=model_d=model_e="llama-3.3-70b-versatile"
img_model = "llama-3.2-90b-vision-preview"
default_model = "mixtral-8x7b-32768"

def groq_chat_completion(model, messages):
    """
    Send a request to Groq API for chat completion
    """
    try:
        chat_completion = client.chat.completions.create(
            messages=[
                {
                    "role": msg["role"],
                    "content": msg["content"],
                } for msg in messages
            ],
            model=model
        )
        
        return chat_completion.choices[0].message.content
        
    except Exception as e:
        return None

def analyze_medical_image(image, image_url):
    """
    Analyze medical image using img_model and return analysis
    """
    try:
        content = """You are a medical image analysis assistant. 
        Analyze this medical image and provide key medical observations, 
        potential findings, and relevant medical context that would be 
        helpful for a medical professional. Be specific and concise.
        
        Image URL: {url}""".format(url=image_url)
        
        messages = [
            {
                "role": "user",
                "content": content
            }
        ]
        
        analysis = groq_chat_completion(img_model, messages)
        return analysis
    except Exception as e:
        return None

def get_image_from_supabase(img_url):
    """
    Fetch image from Supabase storage if URL is valid
    """
    try:
        if img_url == "NA" or not img_url:
            return None
            
        # Extract path from Supabase URL
        path = img_url.split('/public/')[1]
        bucket = path.split('/')[0]
        file_path = '/'.join(path.split('/')[1:])
        
        # Get image from Supabase storage
        response = supabase.storage.from_(bucket).download(file_path)
        if response:
            return Image.open(BytesIO(response))
        return None
    except Exception as e:
        return None

def get_image_from_url(img_url):
    """Fetch and process image from URL"""
    try:
        if not img_url:
            return None
        response = requests.get(img_url)
        response.raise_for_status()
        image = Image.open(BytesIO(response.content))
        return image
    except Exception as e:
        return None

def determine_specialist_and_prompt(user_input, conversation, image_analysis=None):
    """
    Determine specialist and generate appropriate prompt based on the query
    """
    try:
        content = """You are a medical query classifier.
        Analyze this medical query, conversation history, and any image analysis.
        
        Your task is to analyze user questions and route them to the appropriate specialist:

        Symptoms Specialist (S) → Questions about signs of illness and general symptom-related concerns.
        Diagnosis Specialist (D) → Questions about medical tests and identifying conditions.
        Treatment Specialist (T) → Questions about treatments, medications, and recovery processes.
        Precaution Specialist (P) → Questions about medication safety and drug interactions.
        Complex Cases Specialist (R) → Questions about rare diseases and complex conditions.

        Query: {query}

        Respond only with:
        Category: [S/D/T/P/R/DEFAULT]
        """.format(query=user_input)
        
        messages = [
            {
                "role": "user",
                "content": content
            }
        ]
        
        classification = groq_chat_completion(default_model, messages)
        
        # Parse response
        category = classification.split('\n')[0].split(': ')[1].strip() if classification else "DEFAULT"
        custom_prompt = None
        
        return category, custom_prompt

    except Exception as e:
        return "DEFAULT", None

def create_conversation_summary(conversation, previous_summary=""):
    """Generate a progressive medical summary of the conversation history"""
    if not conversation:
        return previous_summary or "No previous context."

    try:
        summary_prompt = """
        Based on the previous summary and new conversation, create an updated medical summary.
        
        Previous Summary:
        {prev_summary}
        
        New Conversation:
        {new_messages}
        
        Rules for updating summary:
        - Maintain key information from previous summary
        - Add new relevant medical information
        - Remove outdated or superseded information
        - Keep format as bullet points
        - Focus on:
          * Symptoms progression
          * New findings
          * Test results
          * Treatment responses
          * Current concerns
        
        Format: Bullet points only
        Focus: Medical relevance and progression of conversation
        """.format(
            prev_summary=previous_summary,
            new_messages="\n".join(
                f"{msg.get('sender', 'unknown')}: {str(msg.get('text', ''))}" 
                for msg in conversation[-3:]  # Last 3 messages
            )
        )

        messages = [{"role": "user", "content": summary_prompt}]
        updated_summary = groq_chat_completion(default_model, messages)
        
        return updated_summary

    except Exception as e:
        return previous_summary or "Error updating context."

def medical_assistant(user_input, conversation, option="", img_url=None, previous_summary="", visit_patient_id=None):
    """Process user input with dynamic routing and prompt generation"""
    
    # Initialize variables
    current_model = default_model
    image_analysis = None
    patient_analysis = None
    BOT_PROMPT = ""

    # Only get patient analysis if visit_patient_id is a valid value
    if visit_patient_id and visit_patient_id not in ["null", "undefined", None, ""]:
        try:
            from individual_analysis import get_patient_analysis
            patient_analysis = get_patient_analysis(visit_patient_id)
        except Exception as e:
            pass

    # Process image if provided
    if img_url and img_url != "NA":
        image = get_image_from_supabase(img_url)
        if image:
            image_analysis = analyze_medical_image(image, img_url)

    # Only create or update summary if there is a valid patient ID or conversation history
    if visit_patient_id and visit_patient_id not in ["null", "undefined", None, ""]:
        context = create_conversation_summary(conversation, previous_summary)
    else:
        context = previous_summary  # Keep the previous summary if no valid patient ID

    # Select model based on option
    if option == 'S':
        current_model = model_a
        BOT_PROMPT = """
        You are a Symptom specialist. Your role is to:
        
        If insufficient information:
        - First provide your initial assessment of symptoms
        - Then ask ONE specific follow-up question if needed
        - Limited to 1 follow-up question only
        
        If sufficient information:
        - List top 3 likely conditions
        - Brief reasoning for each
        - Key next steps
        
        Format your response in paragraphs:
        1. Your assessment of current information
        2. A clear follow-up question if needed
        OR
        1. List of conditions with reasoning
        2. Suggested next steps
        
        Do not use labels like 'ANALYSIS:' or 'QUESTION:' - integrate naturally into text.
        """

    elif option == 'D':
        current_model = model_b
        BOT_PROMPT = """
        You are a Diagnosis specialist. Your role is to:
        
        1. Begin with your current understanding based on available information
        2. If critical info missing:
           - Add ONE specific question within your response
           - Explain briefly why you need this information
        3. Always include:
           - Current diagnostic indicators
           - Potential diagnoses based on available info
        
        Format your response as natural paragraphs without labels.
        Integrate any questions smoothly into your response.
        """
    
    elif option == 'T':
        current_model = model_c
        BOT_PROMPT = """
        You are a Treatment specialist. Your role is to:
        
        1. Focus on specific treatment approaches for known conditions
        2. Provide information about:
           - First-line treatments
           - Alternative options
           - Treatment timelines
           - Expected outcomes
        
        3. Keep responses:
           - Evidence-based
           - Direct and practical
           - Focused on actionable steps
        """
    
    elif option == 'P':
        current_model = model_d
        BOT_PROMPT = """
        You are a Precaution & Drug Interaction specialist. Your role is to:
        
        1. Explain specific drug interactions between:
           - Medications
           - Foods
           - Supplements
        
        2. Provide clear information about:
           - Timing of medications
           - Storage requirements
           - Common side effects
           - Warning signs
        
        3. Keep responses:
           - Factual and specific
           - Focused on practical guidance
           - Direct and clear
        """
    
    elif option == 'R':
        current_model = model_e
        BOT_PROMPT = """
        You are a Rare Conditions specialist. Your role is to:
        
        1. Provide specific information about:
           - Rare disease characteristics
           - Typical progression patterns
           - Key indicators and markers
        
        2. Focus on:
           - Latest research findings
           - Treatment approaches
           - Management strategies
        
        3. Keep responses:
           - Evidence-based
           - Specific to the condition
           - Clear and structured
        """
    else:
        current_model = default_model
        BOT_PROMPT = f"""
            Based on the query: "{user_input}"
            
            Your role is to:
            . Ask only ONE question at a time if you are asking question
            1. Understand the medical concern comprehensively
            2. Consider the conversation history for context
            3. Incorporate any image analysis if available
            4. Provide clear, structured responses
            5. Ask relevant follow-up questions when needed
        """

    # Add patient analysis if available and valid
    if patient_analysis and visit_patient_id and visit_patient_id != "null" and visit_patient_id != "undefined":
        BOT_PROMPT += f"""
        PATIENT HISTORICAL DATA AND ANALYSIS:
        The following information represents the patient's historical medical data and analysis:
        {patient_analysis}
        
        Important:
        - This is verified historical medical data for this specific patient
        - Consider these historical patterns and conditions in your response
        - Ensure your response aligns with the patient's documented medical history
        - Use this historical context to provide more personalized and relevant advice
        """

    # Add image analysis if available
    if image_analysis:
        BOT_PROMPT += f"\nCURRENT IMAGE ANALYSIS:\n{image_analysis}\n"
        BOT_PROMPT += "Consider these current findings in your response.\n"
        
    # Count questions by checking for question marks in bot responses
    question_count = sum(1 for msg in conversation[-6:] 
                        if msg.get('sender') == 'bot' 
                        and '?' in str(msg.get('text', '')))
    
    if question_count >= 2:
        BOT_PROMPT += """
        CRITICAL INSTRUCTION:
        You have asked enough questions. Now provide a complete analysis based on all available information:
        - Summarize what you've learned
        - Provide your assessment
        - Give clear recommendations
        Do not ask any more questions.
        """
        question_count = 0  # Reset counter after analysis
    else:
        BOT_PROMPT += """
        If you need more information:
        - Ask only ONE clear question
        - Wait for the user's response before asking another
        """

    # Add conversation context
    BOT_PROMPT += """
    IMPORTANT GUIDELINES:
    1. Ask only ONE question at a time
    2. Do not add medical disclaimers about consulting professionals
    3. Keep responses focused and direct
    4. If multiple questions are needed, wait for user's response before asking the next one
    
    Previous conversation context:
    {context}
    
    User Query: {user_input}
    """

    try:
        # Format the content with updated summary
        combined_content = f"""System: {BOT_PROMPT}

Conversation History Summary:
{context}

Current Query: {user_input}"""

        messages = [{"role": "user", "content": combined_content}]
        response = groq_chat_completion(current_model, messages)
        
        # Return both the response and updated summary
        return {
            "response": response,
            "updated_summary": context
        }

    except Exception as e:
        return {
            "response": "I apologize, but I'm having trouble processing your request.",
            "updated_summary": previous_summary
        }
