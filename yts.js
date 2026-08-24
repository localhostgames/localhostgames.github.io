const searchForm = document.getElementById("youtubeSearch");
const searchInput = document.getElementById("searchInput");
const searchResults = document.getElementById("searchResults");

searchForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const query = searchInput.value.trim();

    if (!query) {
        return;
    }

    showMessage("Searching...");

    try {
        const response = await fetch(
            `https://localhostapi.work/api/youtube/search?q=${encodeURIComponent(query)}`
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

// Initialize once, on page load
const player = new Plyr('#player', {
    controls: [
        'play-large', 'play', 'progress', 'current-time',
        'mute', 'volume', 'settings', 'fullscreen'
    ]
});

// When a user picks a video from search results:
function playVideo(videoId) {
    player.source = {
        type: 'video',
        sources: [
            {
                src: videoId,
                provider: 'youtube',
            },
        ],
    };
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

        const title = document.createElement("span");
        title.textContent = video.title;

        result.append(thumbnail, title);

        result.addEventListener("click", () => {
            playVideo(video.videoId);
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