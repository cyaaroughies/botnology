// Button Event Handlers
document.getElementById("resumeBtn")?.addEventListener("click", () => {
    console.log("Resuming last session...");
    // Add functionality to resume session
});

document.getElementById("syncNow")?.addEventListener("click", () => {
    console.log("Syncing data...");
    // Add functionality to sync data
});

document.getElementById("goPricing")?.addEventListener("click", () => {
    window.location.href = "/pricing.html";
});

// Navigation Enhancements
function smoothScrollTo(targetId) {
    const target = document.getElementById(targetId);
    if (target) {
        target.scrollIntoView({ behavior: "smooth" });
    }
}

document.getElementById("goDash")?.addEventListener("click", () => {
    smoothScrollTo("dashboard");
});

// API Integration
async function fetchData(endpoint, options = {}) {
    try {
        const response = await fetch(endpoint, options);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Error fetching data:", error);
        alert("An error occurred while fetching data. Please try again.");
    }
}

// Example API call
document.getElementById("doAuth")?.addEventListener("click", async () => {
    const data = await fetchData("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "test@example.com", name: "Test User" })
    });
    console.log("Auth response:", data);
});

// Dynamic Content Updates
function updateElementText(id, text) {
    const element = document.getElementById(id);
    if (element) {
        element.textContent = text;
    }
}

updateElementText("healthLine", "API: Online");

// Error Handling
window.addEventListener("error", (event) => {
    console.error("Global error caught:", event.message);
    alert("An unexpected error occurred. Please refresh the page.");
});

// Modularization
export { fetchData, updateElementText, smoothScrollTo };
