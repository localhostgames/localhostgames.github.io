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

document.addEventListener("resize", function () {
  console.log("reloaded!")
})

console.log(window.location.href);

function isInsideIframe() {
    return window.self !== window.top;
}

function openInBlank() {
  if (isInsideIframe())
    return;

  const win = window.open('about:blank', '_blank');
  const iframe = win.document.createElement('iframe');
  iframe.style.width = '100%';
  iframe.style.height = '100%';
  iframe.style.border = 'none';
  iframe.src = "https://localhostgames.github.io";
  win.document.body.appendChild(iframe);
}


document.addEventListener("DOMContentLoaded", function () {
  const passwordBackground =
    document.getElementById("passwordMain");

  const passwordInput =
    document.getElementById("passwordInput");

  const passwordSubmit =
    document.getElementById("passwordSubmitButton");

  const tosPopup =
    document.getElementById("tosPopup");

  const closeBtn =
    tosPopup?.querySelector(".close-btn");

  const acceptBtn =
    document.getElementById("acceptBtn");


  // Only initialize the password screen if this page has one
  if (
    passwordBackground &&
    passwordInput &&
    passwordSubmit
  ) {
    const dayOfMonth = new Date().getDate();

    passwordBackground.style.display = "flex";

    passwordSubmit.addEventListener("click", function () {
      const correctPassword =
        `Testing Password${dayOfMonth}`;

      if (passwordInput.value === correctPassword) {
        passwordBackground.style.opacity = "0";
        passwordInput.value = "";

        setTimeout(() => {
          passwordBackground.style.display = "none";
        }, 500);
      }
    });
  }


  // Only initialize the TOS popup if this page has one
  if (tosPopup) {
    tosPopup.style.display = "flex";

    closeBtn?.addEventListener("click", function () {
      tosPopup.style.display = "none";
    });

    acceptBtn?.addEventListener("click", function () {
      tosPopup.style.display = "none";
      openInBlank();
    });

    tosPopup.addEventListener("click", function (event) {
      if (event.target === tosPopup) {
        openInBlank();
        tosPopup.style.display = "none";
      }
    });
  }
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
