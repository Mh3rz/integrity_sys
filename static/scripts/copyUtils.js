function copySummary() {
    const summary = document.getElementById("siteList").value.trim();
    const darknet = document.getElementById("darknetInput").value.trim();
    const firewall = document.getElementById("firewallInput").value.trim();

    let fullText = summary;
    if (darknet) fullText += "\n\nDarknet Report:\n" + darknet;
    if (firewall) fullText += "\n\nFirewall Report:\n" + firewall;

    navigator.clipboard.writeText(fullText)
        .then(() => alert("Summary copied to clipboard!"))
        .catch(err => {
        alert("Failed to copy text.");
        console.error(err);
        });
}
