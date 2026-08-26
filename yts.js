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

loadPopularSearches();

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
        loadPopularSearches();
    } catch (error) {
        showMessage(error.message);
        console.error(error);
    }
});

const popularSearches =
    document.getElementById("popularSearches");

async function loadPopularSearches() {
    if (!popularSearches) {
        return;
    }

    try {
        const response = await fetch(
            `${API_URL}/api/youtube/popular-searches?limit=8`
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.error || "Could not load trends."
            );
        }

        displayPopularSearches(data.items);
    } catch (error) {
        console.error(error);

        popularSearches.textContent =
            "Trends are currently unavailable.";
    }
}


function displayPopularSearches(searches) {
    popularSearches.replaceChildren();

    if (!searches || searches.length === 0) {
        const emptyMessage = document.createElement("span");
        emptyMessage.className = "popular-loading";
        emptyMessage.textContent = "No searches yet.";

        popularSearches.appendChild(emptyMessage);
        return;
    }

    searches.forEach((search, index) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "popular-search";

        const ranking = document.createElement("span");
        ranking.className = "popular-ranking";
        ranking.textContent = `#${index + 1}`;

        const query = document.createElement("span");
        query.className = "popular-query";
        query.textContent = search.query;

        const count = document.createElement("span");
        count.className = "popular-count";
        count.textContent =
            `${search.count} ${search.count === 1 ? "search" : "searches"}`;

        button.append(ranking, query, count);

        button.addEventListener("click", () => {
            searchInput.value = search.query;
            searchForm.requestSubmit();
        });

        popularSearches.appendChild(button);
    });
}

let currentVideoUrl = null;

async function playVideo(video) {
    try {
        player.pause();

        showPlayerMessage("Downloading video (this is slow, be patient; you're getting unblocked youtube)...");

        const response = await fetch(
            `${API_URL}/api/youtube/play/${encodeURIComponent(video.videoId)}`
        );

        if (!response.ok) {
            let message = "The video could not be downloaded.";

            try {
                const errorData = await response.json();
                message = errorData.error || message;
            } catch {
                // The response was not JSON.
            }

            throw new Error(message);
        }

        const videoBlob = await response.blob();

        // Remove the previous in-browser file.
        if (currentVideoUrl) {
            URL.revokeObjectURL(currentVideoUrl);
        }

        currentVideoUrl = URL.createObjectURL(videoBlob);

        player.source = {
            type: "video",
            title: video.title,
            poster: video.thumbnail,
            sources: [
                {
                    src: currentVideoUrl,
                    type: videoBlob.type || "video/mp4"
                }
            ]
        };

        await player.play();
    } catch (error) {
        console.error(error);
        showPlayerMessage(error.message);
    }
}

function showPlayerMessage(message) {
    const playerMessage = document.getElementById("playerMessage");

    if (playerMessage) {
        playerMessage.textContent = message;
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