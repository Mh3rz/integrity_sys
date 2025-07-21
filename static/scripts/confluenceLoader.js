async function loadConfluenceInstruction(siteName) {
    const box = document.getElementById("siteInstructions");

    try {
        const response = await fetch(`/confluence?title=${encodeURIComponent(siteName)}&t=${Date.now()}`);
        if (!response.ok) throw new Error("Not found");

        const html = await response.text();
        const content = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
        let result = content ? content[1] : html;

        result = result.replace(/<img[^>]*>/gi, '');
        result = result.replace(/image-\d{8}-\d{6}\.(png|jpe?g|gif|webp|svg)/gi, '');

        box.innerHTML += `<div>${result}</div>`;
    } catch (err) {
        box.innerHTML += `<p class="text-red-600 italic">No instructions found for "${siteName}".</p>`;
    }
}
