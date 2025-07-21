async function analyzeIndicators(text) {
    try {
        const response = await fetch("/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text })
        });

        const data = await response.json();
        const abuseBox = document.getElementById("abuseipResults");
        const vtBox = document.getElementById("virustotalResults");

        abuseBox.innerHTML = "";
        vtBox.innerHTML = "";

        // IPs
        data.ips.forEach(entry => {
        const [ip, result] = Object.entries(entry)[0];
        abuseBox.innerHTML += `<strong><span style="color: #DC143C;">IP:</span></strong> ${ip}<br>`;

        if (result.data) {
            abuseBox.innerHTML += `Abuse Score: ${result.data.abuseConfidenceScore}<br>`;
            abuseBox.innerHTML += `Country: ${result.data.countryCode}<br>`;
            abuseBox.innerHTML += `ISP: ${result.data.isp}<br>`;
        } else {
            const message = result?.error?.message || result?.error || "Unknown error";
            abuseBox.innerHTML += `Error: ${message}<br>`;
        }

        abuseBox.innerHTML += `View: <a href="https://www.abuseipdb.com/check/${ip}" target="_blank" class="text-blue-600 underline"><strong>Open in AbuseIPDB</strong></a><br><br>`;
        });

        // Hashes
        data.hashes.forEach(entry => {
        const [hash, result] = Object.entries(entry)[0];
        vtBox.innerHTML += `<strong><span style="color: #0000FF;">Hash:</span></strong> ${hash}<br>`;
        if (result.data) {
            const stats = result.data.attributes.last_analysis_stats;
            vtBox.innerHTML += `Malicious: ${stats.malicious}, Suspicious: ${stats.suspicious}, Harmless: ${stats.harmless}<br>`;
        } else {
            const message = result?.error?.message || result?.error || "Unknown error";
            vtBox.innerHTML += `Error: ${message}<br>`;
        }
        vtBox.innerHTML += `View: <a href="https://www.virustotal.com/gui/file/${hash}" target="_blank" class="text-blue-600 underline"><strong>Open in VirusTotal</strong></a><br><br>`;
        });

        // Domains
        if (data.domains) {
        data.domains.forEach(entry => {
            const [domain, result] = Object.entries(entry)[0];
            vtBox.innerHTML += `<strong><span style="color: #0000FF;">Domain:</span></strong> ${domain}<br>`;
            if (result.data) {
            const stats = result.data.attributes.last_analysis_stats;
            vtBox.innerHTML += `Malicious: ${stats.malicious}, Suspicious: ${stats.suspicious}, Harmless: ${stats.harmless}<br>`;
            } else {
            const message = result?.error?.message || result?.error || "Unknown error";
            vtBox.innerHTML += `Error: ${message}<br>`;
            }
            vtBox.innerHTML += `View: <a href="https://www.virustotal.com/gui/domain/${domain}" target="_blank" class="text-blue-600 underline"><strong>Open in VirusTotal</strong></a><br><br>`;
        });
        }

    } catch (err) {
        console.error("Error analyzing indicators", err);
    }
}
