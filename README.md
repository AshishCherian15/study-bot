# 📚 Study Bot — AI Powered Study Assistant

An AI-powered chatbot API that answers study-related questions and maintains conversation memory using MongoDB.

🔗 **Live API:**  
https://study-bot-bs6x.onrender.com/docs

---

## 🚀 Overview

Study Bot is a REST API built using FastAPI that integrates a Large Language Model (LLM) to answer academic queries.  
The system stores user conversations in MongoDB and retrieves previous messages to provide context-aware responses.

This project demonstrates:

- LLM API integration
- Conversational memory implementation
- REST API development
- Cloud deployment

---

## ✨ Features

- 🤖 AI-powered academic chatbot
- 🧠 Context-aware responses using MongoDB memory
- 📡 RESTful API architecture
- 🔄 Session-based conversation tracking
- ☁️ Deployed on Render

---

## 🛠 Tech Stack

| Category | Technology |
|----------|------------|
| Language | Python 3.11 |
| Framework | FastAPI |
| Server | Uvicorn |
| LLM Integration | LangChain + Groq |
| Database | MongoDB Atlas |
| Deployment | Render |

---

## 📁 Project Structure
study-bot/

│

├── app.py

├── requirements.txt

├── runtime.txt

├── README.md

├── .gitignore

└── screenshots/

├── swagger.png

├── chat-response.png

└── mongodb-history.png


---

1️⃣ Clone the repository
git clone https://github.com/AshishCherian15/study-bot.git
cd study-bot

2️⃣ Create virtual environment

python -m venv venv
venv\Scripts\activate   # Windows

3️⃣ Install dependencies

pip install -r requirements.txt

4️⃣ Create a .env file and add:

GROQ_API_KEY=your_key_here
MONGO_URI=your_mongo_uri_here

5️⃣ Run the server

uvicorn app:app --reload

Open:
http://localhost:8000/docs

📡 API Endpoints
Method	Endpoint	Description
GET	/	Health check
POST	/chat	Send message to chatbot
GET	/history/{session_id}	Retrieve chat history
DELETE	/history/{session_id}	Clear chat history

