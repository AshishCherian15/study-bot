# 📚 Study Bot — AI-Powered Study Assistant

An AI chatbot that answers academic questions and remembers previous conversations using MongoDB.

## Tech Stack
- **FastAPI** — Web framework
- **LangChain + Groq (LLaMA 3)** — LLM integration
- **MongoDB Atlas** — Cloud database for chat history
- **Render** — Deployment platform

## 📁 Project Structure

study-bot/
│
├── app.py
├── requirements.txt
├── runtime.txt
├── README.md
└── .gitignore

## How to Run Locally

```bash
pip install -r requirements.txt
uvicorn app:app --reload
```

Then open: http://localhost:8000/docs

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Health check |
| POST | `/chat` | Send a message to the bot |
| GET | `/history/{session_id}` | Get chat history |
| DELETE | `/history/{session_id}` | Clear chat history |

## Example Request

```json
POST /chat
{
  "session_id": "student123",
  "message": "Explain Newton's second law"
}
```
