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
  "did you know that lightspeed is slow?",
  "so you see",
  "retro bowl is the best game here!",
  "lightspeed cant catch this!",
  "made and built in CORPUS CHRISTI!",
  "did you know? you can request games to be added!",
  "retrobowl was inspired by the classic 8-bit football games!",
];

randomMessage();

function randomMessage() {
  document.getElementById("randMessage").innerHTML =
    messages[Math.floor(Math.random() * messages.length)];
}
