const chatbox = document.getElementById("chatbox");
const messageInput = document.getElementById("messageInput");
const sendButton = document.querySelector(".send-button");
const clearButton = document.querySelector(".clear-button");
const chatId = crypto.randomUUID();
let websocket = null;

let receiving = false;
const systemPrompt = "You are Dominic Toretto, a street racer and skilled mechanic known for your loyalty to family and friends.";

function createMessageElement(text, alignment) {
  const messageElement = document.createElement("div");
  
  messageElement.className = `inline-block my-2.5 p-2.5 rounded border ${
    alignment === "left" ? "self-start bg-white" : "self-end bg-[#f77f00]"
  }`;
  messageElement.textContent = text;
  return messageElement;
}

function connectWebSocket(message, initChat) {
  receiving = true;
  sendButton.textContent = "Cancel";
  const url = "wss://backend.buildpicoapps.com/api/chatbot/chat";
  websocket = new WebSocket(url);

  websocket.addEventListener("open", () => {
    console.log("WebSocket connection opened");
    websocket.send(
      JSON.stringify({
        chatId: chatId,
        appId: "real-school",
        systemPrompt: systemPrompt,
        message: initChat ? "A very short welcome message from Dominic Toretto" : message,
      })
    );
  });

  const messageElement = createMessageElement("", "left");
  chatbox.appendChild(messageElement);

  websocket.onmessage = (event) => {
    console.log("Message received from server:", event.data);
    messageElement.textContent += event.data;
    chatbox.scrollTop = chatbox.scrollHeight;
  };

  websocket.onerror = (error) => {
    console.error("WebSocket error:", error);
    messageElement.textContent += "Error getting response from server. Refresh the page and try again.";
    chatbox.scrollTop = chatbox.scrollHeight;
    receiving = false;
    sendButton.textContent = "Ask Dom!";
  };

  websocket.onclose = (event) => {
    console.log("WebSocket connection closed:", event);
    if (event.code === 1000) {
      receiving = false;
      sendButton.textContent = "Ask Dom!";
    } else {
      messageElement.textContent += "Error getting response from server. Refresh the page and try again.";
      chatbox.scrollTop = chatbox.scrollHeight;
      receiving = false;
      sendButton.textContent = "Ask Dom!";
    }
  };
}

function createWelcomeMessage() {
  connectWebSocket("", true);
}

sendButton.addEventListener("click", () => {
  if (!receiving && messageInput.value.trim() !== "") {
    const messageText = messageInput.value.trim();
    messageInput.value = "";
    const messageElement = createMessageElement(messageText, "right");
    chatbox.appendChild(messageElement);
    chatbox.scrollTop = chatbox.scrollHeight;

    connectWebSocket(messageText, false);
  } else if (receiving && websocket) {
    websocket.close(1000);
    receiving = false;
    sendButton.textContent = "Ask Dom!";
  }
});

messageInput.addEventListener("keydown", (event) => {
  if (
    event.key === "Enter" &&
    !receiving &&
    messageInput.value.trim() !== ""
  ) {
    event.preventDefault();
    sendButton.click();
  }
});

clearButton.addEventListener("click", () => {
  chatbox.innerHTML = "";
});

createWelcomeMessage();
