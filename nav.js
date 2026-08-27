fetch("/nav.html")
    .then(response => {
        if (!response.ok) {
            throw new Error(`Navigation failed to load: ${response.status}`);
        }

        return response.text();
    })
    .then(html => {
        document.getElementById("sharedNav").innerHTML = html;

        highlightCurrentPage();
    })
    .catch(error => {
        console.error(error);
    });

function highlightCurrentPage() {
    const currentPath = window.location.pathname.replace(/\/$/, "/index.html");

    document.querySelectorAll("#sharedNav a").forEach(link => {
        const linkPath = new URL(link.href).pathname;

        if (linkPath === currentPath) {
            link.classList.add("active");
            link.setAttribute("aria-current", "page");
        }
    });
}