// ===== CONFIG =====
const API_URL = "https://api.voidai.app/v1/chat/completions";
const API_KEY = "sk-voidai-KfIEuDbfbBtmSGVfCwWvqYWtVKbBjmHstZZF0kTu-EUEbhb_g9oc4iynoiF-0ZArm2tlm08mXQSdhkPepBYW7n6qJ-Rj0w9hdPwt6JGj7N69WWNuS5IwIbVgJlcr-if7_PG1DQ"; // <-- replace with your VoidAI key

// ===== PRESET PROMPTS =====
const prompts = {
  college-student: "You are a normal college studen with a iq of 110 and is a normal person not a all knowing ai.",
  coder: "You are an expert coder who explains clearly with a iq of 150.",
  storyteller: "You are a creative storyteller who makes engaging tales with a iq of 125."
};

// ===== STATE =====
let currentType = "helper";
let currentModel = "gpt-4o";  // default model
let messages = [];
let customPrompt = ""; // store custom prompt for the current chat

// ===== FUNCTIONS =====

// Change the chat type (preset)
function setChatType(type) {
  currentType = type;
  customPrompt = ""; // clear custom prompt when switching type
  newChat();
}

// Start a new chat (asks for custom prompt)
function newChat() {
  const promptInput = prompt("Enter a custom prompt for this chat (leave empty to use preset):");
  customPrompt = promptInput ? promptInput : "";

  messages = [];
  document.getElementById("messages").innerHTML = "";
  if (customPrompt) {
    addMessage("assistant", `New chat started with your custom prompt.`);
  } else {
    addMessage("assistant", `New ${currentType} chat started.`);
  }
}

// Add message to chat window
function addMessage(role, content) {
  const msgDiv = document.createElement("div");
  msgDiv.className = "message " + role;
  msgDiv.textContent = content;
  document.getElementById("messages").appendChild(msgDiv);
  msgDiv.scrollIntoView({ behavior: "smooth" });
}

// Send user message to API
async function sendMessage() {
  const input = document.getElementById("userInput");
  const text = input.value.trim();
  if (!text) return;
  input.value = "";

  addMessage("user", text);
  messages.push({ role: "user", content: text });

  const systemPrompt = customPrompt ? customPrompt : prompts[currentType];

  // Build payload like curl example
  const payload = {
    model: currentModel,
    messages: [
      { role: "system", content: systemPrompt },
      ...messages
    ]
  };

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_KEY}`
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    const reply = data.choices[0].message.content;
    addMessage("assistant", reply);
    messages.push({ role: "assistant", content: reply });
  } catch (err) {
    addMessage("assistant", "⚠️ Error: " + err.message);
  }
}

// Search messages temporarily
function searchMessages(query) {
  const allMessages = document.querySelectorAll(".message");
  allMessages.forEach(msg => {
    msg.style.display = msg.textContent.toLowerCase().includes(query.toLowerCase())
      ? "block"
      : "none";
  });
}

// Change model from dropdown
function changeModel() {
  const select = document.getElementById("modelSelect");
  currentModel = select.value;
}
