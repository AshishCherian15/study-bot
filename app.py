from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from pymongo import MongoClient
from langchain_groq import ChatGroq
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage
from datetime import datetime

app = FastAPI(title="Study Bot API", description="AI Study Assistant with Memory")

# ── Credentials ───────────────────────────────────────────────────────────────
GROQ_API_KEY = "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"
MONGO_URI = "mongodb+srv://ashstarfall01_db_user:MA3l1wq3YEkJJ1cO@cluster0.m36wsbl.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"

# MongoDB Setup
client = MongoClient(MONGO_URI)
db = client["study_bot"]
chat_collection = db["chat_history"]

# LLM Setup
llm = ChatGroq(
    groq_api_key=GROQ_API_KEY,
   model_name="llama-3.3-70b-versatile",
    temperature=0.7
)

SYSTEM_PROMPT = """You are StudyBot, a helpful and knowledgeable AI Study Assistant.
Your role is to:
- Answer academic and learning-related questions clearly and concisely
- Explain complex concepts in simple terms with examples
- Help students with subjects like Math, Science, History, English, Programming, etc.
- Provide study tips, summaries, and explanations
- Encourage learning and curiosity

Always be supportive, patient, and educational in your responses.
If a question is not related to studying or learning, politely redirect the conversation back to academic topics."""

class ChatRequest(BaseModel):
    session_id: str
    message: str

def get_chat_history(session_id: str):
    records = chat_collection.find({"session_id": session_id}).sort("timestamp", 1)
    messages = [SystemMessage(content=SYSTEM_PROMPT)]
    for record in records:
        messages.append(HumanMessage(content=record["user_message"]))
        messages.append(AIMessage(content=record["bot_response"]))
    return messages

def save_message(session_id, user_message, bot_response):
    chat_collection.insert_one({
        "session_id": session_id,
        "user_message": user_message,
        "bot_response": bot_response,
        "timestamp": datetime.utcnow()
    })

@app.get("/")
def root():
    return {"message": "Study Bot API is running! Visit /docs to test the API."}

@app.post("/chat")
def chat(request: ChatRequest):
    try:
        messages = get_chat_history(request.session_id)
        messages.append(HumanMessage(content=request.message))
        response = llm.invoke(messages)
        bot_response = response.content
        save_message(request.session_id, request.message, bot_response)
        return {
            "session_id": request.session_id,
            "user_message": request.message,
            "bot_response": bot_response,
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/history/{session_id}")
def get_history(session_id: str):
    records = list(chat_collection.find(
        {"session_id": session_id},
        {"_id": 0}
    ).sort("timestamp", 1))
    for r in records:
        if isinstance(r.get("timestamp"), datetime):
            r["timestamp"] = r["timestamp"].isoformat()
    return {"session_id": session_id, "history": records}

@app.delete("/history/{session_id}")
def clear_history(session_id: str):
    result = chat_collection.delete_many({"session_id": session_id})
    return {"message": f"Deleted {result.deleted_count} messages for session '{session_id}'"}