function extractText() {
    const text = document.getElementById("inputText").value;
    const box = document.getElementById("siteInstructions");
    box.innerHTML = "";

    let matches = [];

    const forMatch = text.match(/on\s+\d{1,2} [A-Za-z]+, \d{4} \d{1,2}:\d{2} [AP]M for ([^\n\.]+)/);
    if (forMatch) matches.push(forMatch[1]);

    const siteNameMatch = text.match(/Site Name\s+(.+)/);
    if (siteNameMatch) {
        const rawSite = siteNameMatch[1].trim();
        if (rawSite.includes("MSSP")) {
        const groupMatch = text.match(/Group\s+(.+)/);
        if (groupMatch) matches.push(groupMatch[1]);
        } else {
        matches.push(rawSite);
        }
    }

    const multiMatches = [...text.matchAll(/^Site:\s+(.+)$/gm)];
    for (const m of multiMatches) matches.push(m[1]);

    const processedSet = new Set();

    for (const raw of matches) {
        const resolved = resolveAlias(raw);
        if (!processedSet.has(resolved)) {
        processedSet.add(resolved);
        loadConfluenceInstruction(resolved);
        }
        extractedSites.add(resolved);
    }

    updateSiteList();

    if (extractedSites.size === 0) {
        box.innerHTML = "<p class='italic text-red-500'>No site name found in alert.</p>";
    }

    analyzeIndicators(text);
    }

    function extractAndCopyInput() {
    extractText();
    const inputText = document.getElementById("inputText").value;

    navigator.clipboard.writeText(inputText)
        .then(() => console.log("Input text copied to clipboard."))
        .catch(err => console.error("Failed to copy input text:", err));
}

function extractOnlyInstructions(text) {
    const box = document.getElementById("siteInstructions");
    box.innerHTML = "";

    let matches = [];

    const forMatch = text.match(/on\s+\d{1,2} [A-Za-z]+, \d{4} \d{1,2}:\d{2} [AP]M for ([^\n\.]+)/);
    if (forMatch) matches.push(forMatch[1]);

    const siteNameMatch = text.match(/Site Name\s+(.+)/);
    if (siteNameMatch) {
        const rawSite = siteNameMatch[1].trim();
        if (rawSite.includes("MSSP")) {
            const groupMatch = text.match(/Group\s+(.+)/);
            if (groupMatch) matches.push(groupMatch[1]);
        } else {
            matches.push(rawSite);
        }
    }

    const multiMatches = [...text.matchAll(/^Site:\s+(.+)$/gm)];
    for (const m of multiMatches) matches.push(m[1]);

    const processedSet = new Set();

    for (const raw of matches) {
        const resolved = resolveAlias(raw);
        if (!processedSet.has(resolved)) {
            processedSet.add(resolved);
            loadConfluenceInstruction(resolved);
        }
    }

    if (processedSet.size === 0) {
        box.innerHTML = "<p class='italic text-red-500'>No site name found in alert.</p>";
    }
}
