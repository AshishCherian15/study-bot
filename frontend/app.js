const apiBaseUrlInput = document.getElementById("apiBaseUrl");
const sessionIdInput = document.getElementById("sessionId");
const questionInput = document.getElementById("question");
const askBtn = document.getElementById("askBtn");
const clearBtn = document.getElementById("clearBtn");
const historyBtn = document.getElementById("historyBtn");
const closeHistoryBtn = document.getElementById("closeHistoryBtn");
const historyPanel = document.getElementById("historyPanel");
const historyList = document.getElementById("historyList");
const messagesEl = document.getElementById("messages");
const envLocalBtn = document.getElementById("envLocal");
const envProdBtn = document.getElementById("envProd");
const envHint = document.getElementById("envHint");

const LOCAL_URL = "http://127.0.0.1:8000";
const PROD_URL = "https://study-bot-bs6x.onrender.com";

function getTimestamp() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function setEnvironment(mode) {
  if (mode === "local") {
    apiBaseUrlInput.value = LOCAL_URL;
    apiBaseUrlInput.style.display = "none";
    envHint.innerHTML = "Running on <code>localhost:8000</code>";
    envLocalBtn.classList.add("active");
    envProdBtn.classList.remove("active");
  } else {
    apiBaseUrlInput.value = PROD_URL;
    apiBaseUrlInput.style.display = "block";
    envHint.textContent = "Production API URL (editable)";
    envProdBtn.classList.add("active");
    envLocalBtn.classList.remove("active");
  }

  localStorage.setItem("study_bot_mode", mode);
  localStorage.setItem("study_bot_api_url", apiBaseUrlInput.value);
}

function createMessage(role, text, time = getTimestamp()) {
  const wrapper = document.createElement("div");
  wrapper.className = `message ${role === "error" ? "bot error" : role}`;

  const avatar = document.createElement("div");
  avatar.className = "avatar";
  avatar.textContent = role === "user" ? "You" : "📚";

  const bubbleWrap = document.createElement("div");
  bubbleWrap.className = "bubble-wrap";

  const bubble = document.createElement("div");
  bubble.className = "bubble";
  bubble.textContent = text;

  const stamp = document.createElement("span");
  stamp.className = "timestamp";
  stamp.textContent = time;

  bubbleWrap.appendChild(bubble);
  bubbleWrap.appendChild(stamp);

  wrapper.appendChild(avatar);
  wrapper.appendChild(bubbleWrap);

  messagesEl.appendChild(wrapper);
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

function showTyping() {
  const typing = document.createElement("div");
  typing.id = "typing";
  typing.className = "message bot";
  typing.innerHTML = `
    <div class="avatar">📚</div>
    <div class="bubble-wrap">
      <div class="bubble typing"><span class="dot"></span><span class="dot"></span><span class="dot"></span></div>
      <span class="timestamp">${getTimestamp()}</span>
    </div>`;

  messagesEl.appendChild(typing);
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

function hideTyping() {
  const typing = document.getElementById("typing");
  if (typing) typing.remove();
}

async function sendMessage() {
  const baseUrl = (apiBaseUrlInput.value || "").trim().replace(/\/$/, "");
  const sessionId = (sessionIdInput.value || "default").trim() || "default";
  const message = questionInput.value.trim();

  if (!baseUrl) {
    createMessage("error", "API URL is missing. Select Local or add Production URL.");
    return;
  }

  if (!message) return;

  localStorage.setItem("study_bot_session", sessionId);
  localStorage.setItem("study_bot_api_url", baseUrl);

  createMessage("user", message);
  questionInput.value = "";
  questionInput.style.height = "44px";
  askBtn.disabled = true;
  showTyping();

  try {
    const response = await fetch(`${baseUrl}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ session_id: sessionId, message })
    });

    const data = await response.json();
    hideTyping();

    if (!response.ok) {
      const detail = typeof data.detail === "string" ? data.detail : JSON.stringify(data.detail || data);
      createMessage("error", `Error: ${detail}`);
      return;
    }

    createMessage("bot", data.bot_response || "No response returned.");
  } catch (error) {
    hideTyping();
    createMessage("error", `Network error: ${error.message}`);
  } finally {
    askBtn.disabled = false;
    questionInput.focus();
  }
}

async function loadHistory() {
  const baseUrl = (apiBaseUrlInput.value || "").trim().replace(/\/$/, "");
  const sessionId = (sessionIdInput.value || "default").trim() || "default";

  if (!baseUrl) {
    historyList.textContent = "Set API URL first.";
    return;
  }

  historyList.textContent = "Loading…";

  try {
    const response = await fetch(`${baseUrl}/history/${encodeURIComponent(sessionId)}`);
    const data = await response.json();

    if (!response.ok) {
      historyList.textContent = `Error: ${data.detail || "Failed to load history."}`;
      return;
    }

    const items = data.history || [];
    if (!items.length) {
      historyList.textContent = "No history found for this session yet.";
      return;
    }

    historyList.innerHTML = items
      .map((item) => {
        const userText = (item.user_message || "").replace(/</g, "&lt;").replace(/>/g, "&gt;");
        const botText = (item.bot_response || "").replace(/</g, "&lt;").replace(/>/g, "&gt;");
        return `<div style="margin-bottom:10px;padding-bottom:10px;border-bottom:1px solid #e2e8f0;"><strong>You:</strong> ${userText}<br><strong>Bot:</strong> ${botText}</div>`;
      })
      .join("");
  } catch (error) {
    historyList.textContent = `Network error: ${error.message}`;
  }
}

questionInput.addEventListener("input", () => {
  questionInput.style.height = "auto";
  questionInput.style.height = `${Math.min(questionInput.scrollHeight, 140)}px`;
});

questionInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    sendMessage();
  }
});

askBtn.addEventListener("click", sendMessage);

clearBtn.addEventListener("click", () => {
  messagesEl.innerHTML = "";
  createMessage("bot", "Chat cleared! Ask me anything about your studies.");
});

historyBtn.addEventListener("click", async () => {
  historyPanel.style.display = "block";
  await loadHistory();
});

closeHistoryBtn.addEventListener("click", () => {
  historyPanel.style.display = "none";
});

envLocalBtn.addEventListener("click", () => setEnvironment("local"));
envProdBtn.addEventListener("click", () => setEnvironment("prod"));

const isLocalHost = ["localhost", "127.0.0.1"].includes(window.location.hostname);
const defaultMode = isLocalHost ? "local" : "prod";
const savedMode = localStorage.getItem("study_bot_mode") || defaultMode;
const savedSession = localStorage.getItem("study_bot_session");
const savedApi = localStorage.getItem("study_bot_api_url");

if (savedSession) sessionIdInput.value = savedSession;

if (savedMode === "prod") {
  setEnvironment("prod");
  if (savedApi) apiBaseUrlInput.value = savedApi;
} else {
  setEnvironment("local");
}
