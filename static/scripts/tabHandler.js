function showTab(tabId, btn) {
    // Hide all tab contents
    document.querySelectorAll(".tab-content").forEach(tab => tab.classList.add("hidden"));

    // Reset all tab buttons
    document.querySelectorAll(".tab-button").forEach(button => {
        button.classList.remove("text-blue-600", "border-blue-600");
        button.classList.add("text-gray-600");
    });

    // Show selected tab and highlight button
    document.getElementById(tabId).classList.remove("hidden");
    btn.classList.remove("text-gray-600");
    btn.classList.add("text-blue-600", "border-blue-600");

    // 👇 Hide client instructions if tab is 'reportsTab'
    const instructionsContainer = document.getElementById("clientInstructionsContainer");
    if (instructionsContainer) {
        if (tabId === "reportsTab") {
            instructionsContainer.classList.add("hidden");
        } else {
            instructionsContainer.classList.remove("hidden");
        }
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const firstTab = document.querySelector(".tab-button");
    showTab("iocAnalysisTab", firstTab);
});
