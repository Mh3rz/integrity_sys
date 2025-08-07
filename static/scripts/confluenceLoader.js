async function loadConfluenceInstruction(siteName) {
    const box = document.getElementById("siteInstructions");

    try {
        const response = await fetch(`/confluence?title=${encodeURIComponent(siteName)}&t=${Date.now()}`);
        if (!response.ok) throw new Error("Not found");

        const html = await response.text();
        const content = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
        let result = content ? content[1] : html;

        // Clean up unwanted elements
        result = result.replace(/<img[^>]*>/gi, '');
        result = result.replace(/image-\d{8}-\d{6}\.(png|jpe?g|gif|webp|svg)/gi, '');

        // Add bold header with site/client name
        const title = `<div class="font-bold text-lg mb-2 border-b pb-1">${siteName}</div>`;
        const block = `<div class="mb-6">${title}${result}</div>`;

        box.innerHTML += block;
    } catch (err) {
        const title = `<div class="font-bold text-lg mb-2 border-b pb-1">${siteName}</div>`;
        box.innerHTML += `<div class="mb-6">${title}<p class="text-red-600 italic">No instructions found for "${siteName}".</p></div>`;
    }
}
