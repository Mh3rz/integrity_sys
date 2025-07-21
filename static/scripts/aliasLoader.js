let aliasMap = {};

// Load aliases from server
fetch("/alias-map.json")
    .then(res => res.json())
    .then(data => {
        aliasMap = Object.fromEntries(
        Object.entries(data).map(([k, v]) => [k.trim().toLowerCase(), v.trim()])
        );
    });

    // Helper to resolve alias
    function resolveAlias(siteName) {
    return aliasMap[siteName.trim().toLowerCase()] || siteName.trim();
}
