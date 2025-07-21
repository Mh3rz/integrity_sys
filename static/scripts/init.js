function updateSiteList() {
    const listArea = document.getElementById("siteList");
    const sites = Array.from(extractedSites);
    sites.sort();
    const summaryText = "Alerts Processed and Tracked:\n" + sites.map(s => `Site: ${s}`).join('\n');
    listArea.value = summaryText;
    localStorage.setItem("summarySites", summaryText);
}
