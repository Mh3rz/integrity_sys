// Open and Close Modal
function openTemplateEditor() {
    document.getElementById("templateModal").classList.remove("hidden");
    document.getElementById("templateInput").value = localStorage.getItem("defaultTemplate") || "";
}

function closeTemplateEditor() {
    document.getElementById("templateModal").classList.add("hidden");
}

// Save Template
function saveTemplate() {
    const template = document.getElementById("templateInput").value;
    localStorage.setItem("defaultTemplate", template);
    closeTemplateEditor();
    alert("Default template saved!");
}

// Load Template into Textarea
function loadTemplate() {
    const template = localStorage.getItem("defaultTemplate") || "";
    document.getElementById("inputText").value = template;
}