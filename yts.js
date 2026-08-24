const API_URL = "https://localhostapi.work";

const searchForm = document.getElementById("youtubeSearch");
const searchInput = document.getElementById("searchInput");
const searchResults = document.getElementById("searchResults");

// Initialize the HTML5 video player once.
const player = new Plyr("#player", {
    controls: [
        "play-large",
        "play",
        "progress",
        "current-time",
        "duration",
        "mute",
        "volume",
        "settings",
        "fullscreen"
    ]
});

searchForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const query = searchInput.value.trim();

    if (!query) {
        return;
    }

    showMessage("Searching...");

    try {
        const response = await fetch(
            `${API_URL}/api/youtube/search?q=${encodeURIComponent(query)}`
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Search failed.");
        }

        displayResults(data.items);
    } catch (error) {
        showMessage(error.message);
        console.error(error);
    }
});

async function playVideo(video) {
    const streamUrl =
        `${API_URL}/api/youtube/play/${encodeURIComponent(video.videoId)}`;

    try {
        player.pause();

        player.source = {
            type: "video",
            title: video.title,
            poster: video.thumbnail,
            sources: [
                {
                    src: streamUrl,
                    type: "video/mp4"
                }
            ]
        };

        await player.play();
    } catch (error) {
        // Browsers commonly block playback until another user interaction.
        console.error("Video playback failed:", error);
    }
}

function displayResults(videos) {
    searchResults.replaceChildren();

    if (!videos || videos.length === 0) {
        showMessage("No videos found.");
        return;
    }

    for (const video of videos) {
        const result = document.createElement("button");
        result.type = "button";
        result.className = "video-result";

        const thumbnail = document.createElement("img");
        thumbnail.src = video.thumbnail;
        thumbnail.alt = "";
        thumbnail.loading = "lazy";

        const information = document.createElement("span");

        const title = document.createElement("strong");
        title.textContent = video.title;

        const channel = document.createElement("small");
        channel.textContent = video.channelTitle || "";

        information.append(title, channel);
        result.append(thumbnail, information);

        result.addEventListener("click", () => {
            playVideo(video);
        });

        searchResults.appendChild(result);
    }
}

function showMessage(message) {
    searchResults.replaceChildren();

    const element = document.createElement("p");
    element.className = "search-message";
    element.textContent = message;

    searchResults.appendChild(element);
}