const searchForm = document.getElementById("youtubeSearch");
const searchInput = document.getElementById("searchInput");
const searchResults = document.getElementById("searchResults");
const youtubePlayer = document.getElementById("youtubePlayer");

searchForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const query = searchInput.value.trim();

    if (!query) {
        return;
    }

    showMessage("Searching...");

    try {
        const response = await fetch(
            `http://gangus.serv.gs:8000/api/youtube/search?q=${encodeURIComponent(query)}`
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
            youtubePlayer.src =
                `https://www.youtube.com/embed/${encodeURIComponent(video.videoId)}?autoplay=1`;

            youtubePlayer.title = video.title;
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