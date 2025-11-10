var key = localStorage.getItem("multiplayerKey");
var serverUrl = "https://localhostapi.work"
// they key allows the server to identify the user.


// if they user doesnt already have a key, register them.
function getKey() {
    fetch(serverUrl + "/register").then(response => response.json()).then(data => {
        key = data.key;
        console.log("Registered multiplayer with key:", key);

        localStorage.setItem("multiplayerKey", key);
    });
}

// send our cookies and bakery name to the server.
function sendData() {
    // check we have a key
    if (!key) return;

    // get our data
    var cookies = Game.cookies;
    var bakeryName = Game.bakeryName;


    // send the data to the server
    fetch(serverUrl + "/update", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            key: key,
            cookies: cookies,
            bakeryName: bakeryName
        }),
    });
}

// get data from other players
function getData() {
    // check we have a key
    if (!key) return;

    Game.updateLog = "";


    // get data
    fetch(serverUrl + "/getData", {
        method: "GET"
    })
        .then(response => response.json())
        .then(data => {
            console.log("Received multiplayer data:", data);

            // Convert the object to an array of [key, userData] pairs
            const entries = Object.entries(data);

            // Sort by cookies (highest first)
            entries.sort((a, b) => b[1].cookies - a[1].cookies);

            // Clear the previous log before adding new entries
            Game.updateLog = "";

            // Loop through sorted data
            for (const [key, userData] of entries) {
                Game.updateLog += `
            <div class="title">
                ${userData.bakeryName}: ${Math.ceil(userData.cookies)} cookies
            </div>`;
            }
        });

}

//update the screen to show multiplayer stuff
function updateScreenData() {

    // add the multiplayer leaderboard
    var infoButton = document.getElementById("logButton");
    infoButton.innerHTML = `
    <div id="checkForUpdate">New update!</div>
    Ranks
    `
}

// send and get datas
function doDataStuffs() {
    getData();
    sendData();
}

// initialize multiplayer functionality
function init() {
    // ensure we have a key, otherwise register
    if (!key) {
        getKey();
    }

    console.log("multiplayer mod initialized")

    updateScreenData();
    doDataStuffs();

    // send data every 15 seconds
    setInterval(() => {
        doDataStuffs();
    }, 15000);
}

document.addEventListener("DOMContentLoaded", init);