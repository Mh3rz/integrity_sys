const extractedSites = new Set();

window.addEventListener("DOMContentLoaded", () => {
    const savedSummary = localStorage.getItem("summarySites");
    const savedDarknet = localStorage.getItem("darknetReport");
    const savedFirewall = localStorage.getItem("firewallReport");
    const savedTicketClosed = localStorage.getItem("ticketClosedReport");
    const savedClientCalled = localStorage.getItem("clientCalledReport");

    if (savedSummary) {
        document.getElementById("siteList").value = savedSummary;
        savedSummary.split('\n')
            .filter(line => line.startsWith("Site: "))
            .forEach(line => extractedSites.add(line.replace("Site: ", "").trim()));
    }

    if (savedDarknet) document.getElementById("darknetInput").value = savedDarknet;
    if (savedFirewall) document.getElementById("firewallInput").value = savedFirewall;
    if (savedTicketClosed) document.getElementById("ticketClosedInput").value = savedTicketClosed;
    if (savedClientCalled) document.getElementById("clientCalledInput").value = savedClientCalled;
});

setInterval(() => {
    localStorage.setItem("summarySites", document.getElementById("siteList").value);
    localStorage.setItem("darknetReport", document.getElementById("darknetInput").value);
    localStorage.setItem("firewallReport", document.getElementById("firewallInput").value);
    localStorage.setItem("ticketClosedReport", document.getElementById("ticketClosedInput").value);
    localStorage.setItem("clientCalledReport", document.getElementById("clientCalledInput").value);
}, 2000);


function clearReports() {
    // Clear local storage
    localStorage.removeItem("summarySites");
    localStorage.removeItem("darknetReport");
    localStorage.removeItem("firewallReport");
    localStorage.removeItem("ticketClosed");
    localStorage.removeItem("clientCalled");

    // Clear textarea values
    document.getElementById("siteList").value = "";
    document.getElementById("darknetInput").value = "";
    document.getElementById("firewallInput").value = "";
    document.getElementById("ticketClosedInput").value = "";
    document.getElementById("clientCalledInput").value = "";

    // Clear extractedSites set
    extractedSites.clear();
}

