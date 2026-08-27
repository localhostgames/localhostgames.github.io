const input = document.getElementById("searchInput");
const games = document.querySelectorAll("#games img");

input.addEventListener("input", () => {
  const searchTerm = input.value.toLowerCase();
  games.forEach((game) => {
    if (game.alt.toLowerCase().includes(searchTerm)) {
      game.style.display = "block";
    } else {
      game.style.display = "none";
    }
  });
});

document.addEventListener("resize",function(){
  console.log("reloaded!")
})

// script.js
document.addEventListener("DOMContentLoaded", function () {
  var passwordBackground = document.getElementById("passwordMain");
  var passwordInput = document.getElementById("passwordInput");
  var passwordSubmit = document.getElementById("passwordSubmitButton");

  var tosPopup = document.getElementById("tosPopup");
  var closeBtn = document.querySelector(".close-btn");
  var acceptBtn = document.getElementById("acceptBtn");

  const today = new Date();
  const dayOfMonth = today.getDate();

  passwordBackground.style.display = "flex";  

  passwordSubmit.onclick = function () {
    if (passwordInput.value == "Testing Password" + dayOfMonth.toString())
    {
      passwordBackground.style.opacity = '0';
  
      passwordInput.value = "";

      // Optionally, after the fade-out completes, hide the element
      setTimeout(() => {
        passwordBackground.style.display = 'none';
      }, 500); // Match the transition duration (0.5s)
    }

    
  };

  // Show the popup when the page loads
  tosPopup.style.display = "flex";

  // Close the popup when the 'X' is clicked
  closeBtn.onclick = function () {
    tosPopup.style.display = "none";
  };

  // Close the popup when 'I Accept' is clicked
  acceptBtn.onclick = function () {
    tosPopup.style.display = "none";
  };

  // Close the popup if the user clicks outside the popup content
  window.onclick = function (event) {
    if (event.target == tosPopup) {
      tosPopup.style.display = "none";
    }
  };
});

messages = [
  "Welcome to LOCALHOSTGAMES!",
  "haha stupid blockers",
  "what is la peace???? what is this some greek thing??",
  "did you know that apple classroom is slow?",
  "so you see",
  "retro bowl is the best game here!",
  "lightspeed cant catch this!",
  "made and built in CORPUS CHRISTI!",
  "did you know? you can request games to be added!",
  "retrobowl was inspired by the classic 8-bit football games!",
  "lurking beneath the bedrock.",
  "it wasn't their fault",
  "i made them like this because i wanted to.",
  "vrrm skirtt bang skreet doom pow",
  "who is bro",
  "bro stated a fun fact",
  "the end is nigh, the end is null",
  "they have been reborn",
  "im captain clark, welcome to the backrooms!",
  "he's so bad at cooking, he cant even grill a cheeze.",
  "MobismissingID",
  "insert cool message here",
  "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  "the obliteration",
  "'pills in the morning sleep till the evening, life is a dream!' - someone",
  "bread tastes better than key!",
  "its not rocket science!",
  "92.1 khz",
  "votv",
  "darkxwolf17",
  "''''''''''''",
  "m",
  "Record 15; Betray",
  "__Blackout__ v.s xXram2dieXx",
  "lard"
];

randomMessage();

function randomMessage() {
  document.getElementById("randMessage").innerHTML =
    messages[Math.floor(Math.random() * messages.length)];
}
