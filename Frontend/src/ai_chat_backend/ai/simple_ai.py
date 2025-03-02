import random
import asyncio
from datetime import datetime

class SimpleAIChat:
    def __init__(self):
        self.responses = [
            "Please tell me more about that.",
            "How does that make you feel?",
            "Let's explore this further."
        ]
        
    async def generate_response(self, message: str) -> str:
        await asyncio.sleep(0.3)  # Simulate processing time
        return random.choice(self.responses)

    def generate_chat_title(self, messages: list) -> str:
        keywords = ["symptoms", "diagnosis", "treatment", "medication", "test"]
        for msg in messages[:3]:
            if any(keyword in msg.lower() for keyword in keywords):
                return next((f"{kw.capitalize()} Discussion" 
                           for kw in keywords if kw in msg.lower()), "Medical Consultation")
        return "New Chat" 