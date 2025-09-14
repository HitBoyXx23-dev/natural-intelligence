// ===== CONFIG =====
const API_URL = "https://api.voidai.app/v1/chat/completions";
const API_KEY = "sk-voidai-KfIEuDbfbBtmSGVfCwWvqYWtVKbBjmHstZZF0kTu-EUEbhb_g9oc4iynoiF-0ZArm2tlm08mXQSdhkPepBYW7n6qJ-Rj0w9hdPwt6JGj7N69WWNuS5IwIbVgJlcr-if7_PG1DQ";

// ===== PRESET PROMPTS WITH IQs =====
const prompts = {
  "college-student": "You are a normal college student with IQ ~110. Talk casually like a regular human.",
  "coder": "You are a coder with IQ ~150. Explain clearly like a normal person.",
  "storyteller": "You are a storyteller with IQ ~125. Write naturally, like humans do."
};

// ===== STATE =====
let currentType = "college-student";
let currentModel = "gpt-4o";
let messages = [];
let customPrompt = "";
let savedChats = [];

// ===== FUNCTIONS =====
function setChatType(type) {
  currentType = type;
  customPrompt = "";
  newChat();
}

function newChat() {
  const promptInput = prompt("Enter custom prompt (leave blank for preset):");
  customPrompt = promptInput || "";

  if(document.getElementById("tempToggle").checked){
    messages = [];
  } else {
    messages = [];
    savedChats.push([]); // new persistent chat slot
  }

  document.getElementById("messages").innerHTML = "";
  addMessage("assistant", customPrompt ? "New chat started with your custom prompt." : `New ${currentType} chat started.`);
}

function addMessage(role, content){
  const msgDiv = document.createElement("div");
  msgDiv.className = "message " + role;
  msgDiv.textContent = content;
  document.getElementById("messages").appendChild(msgDiv);
  msgDiv.scrollIntoView({behavior:"smooth"});
}

async function sendMessage(){
  const input = document.getElementById("userInput");
  const text = input.value.trim();
  if(!text) return;
  input.value = "";

  addMessage("user", text);
  messages.push({role:"user", content:text});

  const systemPrompt = customPrompt || prompts[currentType];
  const payload = {model:currentModel, messages:[{role:"system", content:systemPrompt}, ...messages]};

  try{
    const res = await fetch(API_URL,{
      method:"POST",
      headers:{"Content-Type":"application/json","Authorization":`Bearer ${API_KEY}`},
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if(data.choices && data.choices.length>0){
      const reply = data.choices[0].message.content;
      addMessage("assistant", reply);
      messages.push({role:"assistant", content:reply});
      if(!document.getElementById("tempToggle").checked){
        savedChats[savedChats.length-1] = messages;
      }
    }else{
      addMessage("assistant","⚠️ No response from API.");
    }
  }catch(err){
    addMessage("assistant","⚠️ Error: "+err.message);
  }
}

function searchMessages(query){
  const allMessages = document.querySelectorAll(".message");
  allMessages.forEach(msg => {
    msg.style.display = msg.textContent.toLowerCase().includes(query.toLowerCase())?"block":"none";
  });
}

function changeModel(){
  currentModel = document.getElementById("modelSelect").value;
}

document.getElementById("userInput").addEventListener("keydown", e=>{
  if(e.key==="Enter") sendMessage();
});
