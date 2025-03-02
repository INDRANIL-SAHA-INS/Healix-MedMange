from datetime import datetime

def group_messages_by_date(messages):
    grouped = {}
    for msg in messages:
        date = datetime.fromisoformat(msg["created_at"]).date()
        date_str = date.strftime("%Y-%m-%d")
        if date_str not in grouped:
            grouped[date_str] = []
        grouped[date_str].append(msg)
    return grouped

def generate_chat_title(messages):
    keywords = ["diagnos", "treat", "symptom", "test", "medic"]
    for msg in messages[:3]:
        content = msg["content"].lower()
        for kw in keywords:
            if kw in content:
                return f"Chat about {kw.capitalize()}"
    return "Medical Discussion" 