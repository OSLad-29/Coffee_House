document.addEventListener("DOMContentLoaded", () => {
  const chatbotBtn = document.getElementById("chat-toggle");
  const chatbotContainer = document.getElementById("chatbot");
  const messages = document.getElementById("chat-messages");
  const input = document.getElementById("chat-input");
  const sendBtn = document.getElementById("send-btn");
  const callBtn = document.getElementById("call-agent");

  chatbotBtn.addEventListener("click", () => {
    chatbotContainer.style.display = chatbotContainer.style.display === "none" ? "flex" : "none";
  });

  const sendMessage = (sender, text) => {
    const msg = document.createElement("div");
    msg.className = sender;
    msg.style.marginBottom = "10px";
    msg.textContent = `${sender === "user" ? "You" : "Agent"}: ${text}`;
    messages.appendChild(msg);
    messages.scrollTop = messages.scrollHeight;
  };

  const reply = (userText) => {
    const lowerText = userText.toLowerCase();
    setTimeout(() => {
      if (lowerText.includes("call")) {
        sendMessage("agent", "You can call us now at +27 11 123 4567");
        callBtn.style.display = "block";
      } else if (lowerText.includes("menu") || lowerText.includes("order")) {
        sendMessage("agent", "You can browse our menu and place orders directly on our website. Would you like me to direct you to our menu section?");
      } else if (lowerText.includes("reservation") || lowerText.includes("book")) {
        sendMessage("agent", "You can make table reservations through our booking section. Would you like me to direct you there?");
      } else if (lowerText.includes("hours") || lowerText.includes("open")) {
        sendMessage("agent", "We're open Monday to Friday from 7:00 AM to 8:00 PM, and weekends from 8:00 AM to 6:00 PM.");
      } else {
        sendMessage("agent", "How else can I assist you today? You can ask about our menu, make a reservation, or request to call us.");
      }
    }, 500);
  };

  sendBtn.addEventListener("click", () => {
    const text = input.value.trim();
    if (!text) return;
    sendMessage("user", text);
    reply(text);
    input.value = "";
  });

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") sendBtn.click();
  });

  callBtn.addEventListener("click", () => {
    window.location.href = "tel:+27111234567";
  });
});