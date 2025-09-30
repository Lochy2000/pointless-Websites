// crypto-shared.js
// Shared sidebar, theme, and navigation logic for all crypto dashboard pages

// Sidebar and theme logic
function initCryptoSidebarAndTheme() {
    // Initialize Feather Icons
    if (window.feather) feather.replace();

    // Sidebar toggle
    const sidebar = document.getElementById('sidebar');
    const content = document.getElementById('content');
    const toggleSidebar = document.getElementById('toggleSidebar');
    const mobileMenuButton = document.getElementById('mobileMenuButton');
    if (toggleSidebar && sidebar && content) {
        toggleSidebar.addEventListener('click', () => {
            sidebar.classList.toggle('collapsed');
            content.classList.toggle('full');
            content.classList.toggle('expanded');
            if (window.feather) feather.replace();
        });
    }
    if (mobileMenuButton && sidebar) {
        mobileMenuButton.addEventListener('click', () => {
            sidebar.classList.toggle('open');
            if (window.feather) feather.replace();
        });
    }

    // Theme toggle
    const toggleTheme = document.getElementById('toggleTheme');
    const html = document.documentElement;
    if (toggleTheme) {
        toggleTheme.addEventListener('click', () => {
            html.classList.toggle('dark');
            localStorage.setItem('theme', html.classList.contains('dark') ? 'dark' : 'light');
            if (window.feather) feather.replace();
        });
    }
    // Check for saved theme preference
    if (localStorage.getItem('theme') === 'dark' || (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        html.classList.add('dark');
    } else {
        html.classList.remove('dark');
    }
}

document.addEventListener('DOMContentLoaded', initCryptoSidebarAndTheme);
