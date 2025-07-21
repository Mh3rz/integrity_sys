function showTab(tabId, btn) {
    document.querySelectorAll(".tab-content").forEach(tab => tab.classList.add("hidden"));
    document.querySelectorAll(".tab-button").forEach(button => {
        button.classList.remove("text-blue-600", "border-blue-600");
        button.classList.add("text-gray-600");
    });

    document.getElementById(tabId).classList.remove("hidden");
    btn.classList.remove("text-gray-600");
    btn.classList.add("text-blue-600", "border-blue-600");
    }

    document.addEventListener("DOMContentLoaded", () => {
    const firstTab = document.querySelector(".tab-button");
    showTab("iocAnalysisTab", firstTab);
});
