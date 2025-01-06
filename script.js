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
  "Rebranded and REFRESHED!",
  "Back in black.",
  "Out with the old, in with the new.",
  "dude i bought this for 25 bucks haha.",
  "BRANDONX45 ON TOP HAHA",
  "made and built in CORPUS CHRISTI!"
];

randomMessage();

function randomMessage() {
  document.getElementById("randMessage").innerHTML =
    messages[Math.floor(Math.random() * messages.length)];
}
