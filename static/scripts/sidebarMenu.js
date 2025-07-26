function toggleSidebar() {
    const sidebar = document.getElementById('settingsSidebar');
    const overlay = document.getElementById('sidebarOverlay');
    const isVisible = !sidebar.classList.contains('-translate-x-full');

    if (isVisible) {
        sidebar.classList.add('-translate-x-full');
        sidebar.classList.add('hidden');
        overlay.classList.add('hidden');
    } else {
        sidebar.classList.remove('-translate-x-full');
        sidebar.classList.remove('hidden');
        overlay.classList.remove('hidden');
    }
}