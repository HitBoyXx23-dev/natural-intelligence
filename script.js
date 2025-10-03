const API_URL = "https://api.voidai.app/v1/chat/completions";
const API_KEY = "sk-voidai-A_deJiEm5lImmyrDWdFI3cA_YskQUEORXLOeDwXvHTZJmxNnHV2vZAm3YGwazezFLk4sZVa0kpVPZzH7KAisSXms18Lk24HEMtBttXM9ANDIEkXsmwtEydAkiQQ6XUxc5yRD8Q";

const prompts = {
    "college-student": "You are a normal college student with IQ ~110. Talk casually like a regular human.",
    "coder": "You are a coder with IQ ~150. Explain clearly like a normal person.",
    "storyteller": "You are a storyteller with IQ ~125. Write naturally, like humans do."
};

let currentType = "college-student";
let currentModel = "gpt-4o";
let messages = [];
let customPrompt = "";
let savedChats = JSON.parse(localStorage.getItem("savedChats")) || [];
let currentChatIndex = null;

// ===== CHAT MANAGEMENT =====
function setChatType(type) {
    currentType = type;
    customPrompt = "";
    newChat();
}
function newChat() {
    const promptInput = prompt("Enter custom prompt (leave blank for preset):");
    customPrompt = promptInput || "";
    startChat(customPrompt, "New Chat");
}
function customChat() {
    const chatName = prompt("Enter a name for your custom chat:");
    if(!chatName) return alert("Chat name required.");
    const chatPrompt = prompt("Enter custom prompt for this chat:");
    startChat(chatPrompt || "", chatName);
}
function startTemplate(templateName){
    let templatePrompt="";
    switch(templateName){
        case "Anime Hero": templatePrompt="You are an anime hero, talk like a courageous character."; break;
        case "Mystic Mage": templatePrompt="You are a mystical mage, respond like a wise spellcaster."; break;
        case "Cute Companion": templatePrompt="You are a cute companion, always cheerful and friendly."; break;
    }
    startChat(templatePrompt, templateName);
}
function startChat(promptText, chatName){
    const isTemp = document.getElementById("tempToggle").checked;
    messages=[];
    document.getElementById("messages").innerHTML="";
    customPrompt=promptText;
    if(!isTemp){
        savedChats.push({name:chatName,messages:[]});
        currentChatIndex=savedChats.length-1;
        saveChats();
        updateHistory();
    } else currentChatIndex=null;
    addMessage("assistant", promptText?`New chat: ${chatName}`:`New ${currentType} chat started.`);
}
function addMessage(role, content){
    const msgDiv=document.createElement("div");
    msgDiv.className="message "+role;
    msgDiv.textContent=content;
    document.getElementById("messages").appendChild(msgDiv);
    msgDiv.scrollIntoView({behavior:"smooth"});
}
async function sendMessage(){
    const input=document.getElementById("userInput");
    const text=input.value.trim();
    if(!text) return;
    input.value="";
    addMessage("user", text);
    messages.push({role:"user", content:text});
    const systemPrompt=customPrompt || prompts[currentType];
    const payload={model:currentModel, messages:[{role:"system", content:systemPrompt}, ...messages]};
    try{
        const res=await fetch(API_URL,{method:"POST", headers:{"Content-Type":"application/json","Authorization":`Bearer ${API_KEY}`}, body:JSON.stringify(payload)});
        const data=await res.json();
        if(data.choices && data.choices.length>0){
            const reply=data.choices[0].message.content;
            addMessage("assistant", reply);
            messages.push({role:"assistant", content:reply});
            if(currentChatIndex!==null){
                savedChats[currentChatIndex].messages=messages;
                saveChats();
                updateHistory();
            }
        } else addMessage("assistant","⚠️ No response from API.");
    } catch(err){ addMessage("assistant","⚠️ Error: "+err.message);}
}
function updateHistory(){
    const historyUl=document.getElementById("chatHistory");
    historyUl.innerHTML="";
    savedChats.forEach((chat,index)=>{
        const li=document.createElement("li");
        const lastMsg=chat.messages.length?chat.messages[chat.messages.length-1].content.slice(0,30):"Empty chat";
        li.innerHTML=`<span onclick="loadChat(${index})">${chat.name}: ${lastMsg}</span> <button class="deleteBtn" onclick="deleteChat(${index})">x</button>`;
        historyUl.appendChild(li);
    });
}
function deleteChat(index){
    savedChats.splice(index,1);
    if(currentChatIndex===index) messages=[];
    if(currentChatIndex>index) currentChatIndex--;
    saveChats();
    updateHistory();
    document.getElementById("messages").innerHTML="";
}
function loadChat(index){
    currentChatIndex=index;
    messages=savedChats[index].messages;
    document.getElementById("messages").innerHTML="";
    messages.forEach(m=>addMessage(m.role,m.content));
}
function searchMessages(query){
    const allMessages=document.querySelectorAll(".message");
    allMessages.forEach(msg=>{
        msg.style.display=msg.textContent.toLowerCase().includes(query.toLowerCase())?"block":"none";
    });
}
function changeModel(){currentModel=document.getElementById("modelSelect").value;}
function saveChats(){localStorage.setItem("savedChats",JSON.stringify(savedChats));}

// ===== SETTINGS =====
function openSettings(){document.getElementById("settingsModal").style.display="block";}
function closeSettings(){document.getElementById("settingsModal").style.display="none";}
document.getElementById("darkModeToggle").addEventListener("change", e=>{
    document.body.style.backgroundColor=e.target.checked?"#000":"#0a0a0a";
    document.body.style.color=e.target.checked?"#fff":"#f5f5f5";
});
document.getElementById("fontSizeSelect").addEventListener("change", e=>{
    document.getElementById("messages").style.fontSize=e.target.value;
});
function clearAllChats(){
    if(confirm("Are you sure you want to delete all chats?")){
        savedChats=[];
        messages=[];
        currentChatIndex=null;
        saveChats();
        updateHistory();
        document.getElementById("messages").innerHTML="";
    }
}

document.getElementById("userInput").addEventListener("keydown", e=>{if(e.key==="Enter") sendMessage();});
updateHistory();
