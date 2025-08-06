function updateSiteList() {
    const listArea = document.getElementById("siteList");
    const sites = Array.from(extractedSites);
    sites.sort();
    const summaryText = "Alerts Processed and Tracked:\n" + sites.map(s => `Site: ${s}`).join('\n');
    listArea.value = summaryText;
    localStorage.setItem("summarySites", summaryText);
}
// auto-fill the textarea when the page loads (defaultText)
window.onload = function () {
    loadTemplate();
};

document.addEventListener("DOMContentLoaded", () => {
    const inputBox = document.getElementById("inputText");

    inputBox.addEventListener("paste", () => {
        setTimeout(() => {
            const pastedText = inputBox.value;
            extractOnlyInstructions(pastedText);
        }, 100);
    });
});

