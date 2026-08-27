import { initializeApp } from
    "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";

import {
    getDatabase,
    ref,
    push,
    query,
    limitToLast,
    onChildAdded,
    onValue,
    set,
    remove,
    onDisconnect,
    serverTimestamp
} from
    "https://www.gstatic.com/firebasejs/12.2.1/firebase-database.js";


const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT.firebaseapp.com",
    databaseURL:
        "https://YOUR_PROJECT-default-rtdb.firebaseio.com",
    projectId: "YOUR_PROJECT",
    storageBucket: "YOUR_PROJECT.firebasestorage.app",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};


const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

const messagesElement = document.getElementById("messages");
const loadingMessages = document.getElementById("loadingMessages");
const messageForm = document.getElementById("messageForm");
const messageInput = document.getElementById("messageInput");
const usernameInput = document.getElementById("username");
const sendButton = document.getElementById("sendButton");
const characterCount = document.getElementById("characterCount");
const onlineCount = document.getElementById("onlineCount");
const connectionDot = document.getElementById("connectionDot");
const connectionText = document.getElementById("connectionText");

const clientId =
    sessionStorage.getItem("chatClientId") ||
    crypto.randomUUID();

sessionStorage.setItem("chatClientId", clientId);

usernameInput.value =
    localStorage.getItem("chatUsername") || "";

const messageReference = ref(database, "chatrooms/general/messages");
const recentMessages = query(messageReference, limitToLast(100));
const presenceReference =
    ref(database, `chatrooms/general/online/${clientId}`);

let messagesLoaded = false;


/* Connection and presence */

onValue(ref(database, ".info/connected"), snapshot => {
    const connected = snapshot.val() === true;

    connectionDot.classList.toggle("connected", connected);
    connectionDot.classList.toggle("disconnected", !connected);

    connectionText.textContent =
        connected ? "Connected" : "Disconnected";

    sendButton.disabled = !connected;

    if (!connected) {
        return;
    }

    onDisconnect(presenceReference).remove();

    set(presenceReference, {
        connectedAt: serverTimestamp()
    });
});


onValue(ref(database, "chatrooms/general/online"), snapshot => {
    const users = snapshot.val() || {};
    const count = Object.keys(users).length;

    onlineCount.textContent =
        `${count} ${count === 1 ? "person" : "people"} online`;
});


/* Receive messages */

onChildAdded(recentMessages, snapshot => {
    if (!messagesLoaded) {
        loadingMessages?.remove();
        messagesLoaded = true;
    }

    const message = snapshot.val();

    if (!message) {
        return;
    }

    displayMessage(message);
});


function displayMessage(message) {
    const messageElement = document.createElement("article");
    messageElement.className = "message";

    const avatar = document.createElement("div");
    avatar.className = "message-avatar";
    avatar.textContent =
        message.username.slice(0, 1).toUpperCase();

    avatar.style.background =
        createUserGradient(message.username);

    const body = document.createElement("div");
    body.className = "message-body";

    const heading = document.createElement("div");
    heading.className = "message-heading";

    const name = document.createElement("span");
    name.className = "message-name";
    name.textContent = message.username;

    const time = document.createElement("time");
    time.className = "message-time";
    time.textContent = formatTime(message.createdAt);

    const text = document.createElement("p");
    text.className = "message-text";
    text.textContent = message.text;

    heading.append(name, time);
    body.append(heading, text);
    messageElement.append(avatar, body);
    messagesElement.appendChild(messageElement);

    messagesElement.scrollTop = messagesElement.scrollHeight;
}


function formatTime(timestamp) {
    if (typeof timestamp !== "number") {
        return "just now";
    }

    return new Intl.DateTimeFormat([], {
        hour: "numeric",
        minute: "2-digit"
    }).format(new Date(timestamp));
}


function createUserGradient(username) {
    let hue = 0;

    for (const character of username) {
        hue = (hue * 31 + character.charCodeAt(0)) % 360;
    }

    return `linear-gradient(
        135deg,
        hsl(${hue} 65% 42%),
        hsl(${(hue + 35) % 360} 70% 25%)
    )`;
}


/* Send messages */

messageForm.addEventListener("submit", async event => {
    event.preventDefault();

    const username =
        usernameInput.value.trim().slice(0, 20) || "Guest";

    const text = messageInput.value.trim().slice(0, 500);

    if (!text) {
        return;
    }

    localStorage.setItem("chatUsername", username);

    sendButton.disabled = true;

    try {
        await push(messageReference, {
            username,
            text,
            createdAt: serverTimestamp()
        });

        messageInput.value = "";
        updateMessageInput();
        messageInput.focus();
    } catch (error) {
        console.error("Message could not be sent:", error);
        alert("Your message could not be sent.");
    } finally {
        sendButton.disabled = false;
    }
});


messageInput.addEventListener("input", updateMessageInput);

messageInput.addEventListener("keydown", event => {
    if (
        event.key === "Enter" &&
        !event.shiftKey &&
        !event.isComposing
    ) {
        event.preventDefault();
        messageForm.requestSubmit();
    }
});


function updateMessageInput() {
    characterCount.textContent =
        `${messageInput.value.length} / 500`;

    messageInput.style.height = "auto";
    messageInput.style.height =
        `${Math.min(messageInput.scrollHeight, 140)}px`;
}


window.addEventListener("pagehide", () => {
    remove(presenceReference);
});