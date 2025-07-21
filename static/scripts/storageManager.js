const extractedSites = new Set();

window.addEventListener("DOMContentLoaded", () => {
    const savedSummary = localStorage.getItem("summarySites");
    const savedDarknet = localStorage.getItem("darknetReport");
    const savedFirewall = localStorage.getItem("firewallReport");

    if (savedSummary) {
        document.getElementById("siteList").value = savedSummary;
        savedSummary.split('\n')
        .filter(line => line.startsWith("Site: "))
        .forEach(line => extractedSites.add(line.replace("Site: ", "").trim()));
    }

    if (savedDarknet) document.getElementById("darknetInput").value = savedDarknet;
    if (savedFirewall) document.getElementById("firewallInput").value = savedFirewall;
    });

    setInterval(() => {
        localStorage.setItem("summarySites", document.getElementById("siteList").value);
        localStorage.setItem("darknetReport", document.getElementById("darknetInput").value);
        localStorage.setItem("firewallReport", document.getElementById("firewallInput").value);
    }, 2000);

    function clearReports() {
        localStorage.removeItem("summarySites");
        localStorage.removeItem("darknetReport");
        localStorage.removeItem("firewallReport");

        document.getElementById("siteList").value = "";
        document.getElementById("darknetInput").value = "";
        document.getElementById("firewallInput").value = "";
    extractedSites.clear();
}
