// ============================================================================
// WEBLIST HUB - Main JavaScript
// ============================================================================

// State Management
let sitesData = [];
let categoriesData = [];
let currentCategory = 'All';
let currentGridColumns = 2;
let searchQuery = '';

// DOM Elements
const projectsGrid = document.getElementById('projectsGrid');
const searchInput = document.getElementById('searchInput');
const categoryBtn = document.getElementById('categoryBtn');
const categoryMenu = document.getElementById('categoryMenu');
const currentCategoryEl = document.getElementById('currentCategory');
const loadingState = document.getElementById('loadingState');
const emptyState = document.getElementById('emptyState');
const totalProjectsEl = document.getElementById('totalProjects');
const visibleProjectsEl = document.getElementById('visibleProjects');

// ============================================================================
// INITIALIZATION
// ============================================================================

document.addEventListener('DOMContentLoaded', async () => {
    await loadSitesData();
    initializeIcons();
    setupEventListeners();
    renderCategories();
    renderProjects();
    updateStats();
});

// Load sites configuration
async function loadSitesData() {
    try {
        const response = await fetch('sites-config.json');
        const data = await response.json();
        sitesData = data.sites;
        categoriesData = data.categories;
        console.log('Loaded sites:', sitesData.length);
    } catch (error) {
        console.error('Error loading sites data:', error);
        showError('Failed to load projects');
    }
}

// Initialize Feather Icons
function initializeIcons() {
    if (typeof feather !== 'undefined') {
        feather.replace();
    }
}

// Show error message
function showError(message) {
    loadingState.style.display = 'none';
    emptyState.style.display = 'flex';
    emptyState.querySelector('h2').textContent = 'Error';
    emptyState.querySelector('p').textContent = message;
}

// ============================================================================
// EVENT LISTENERS
// ============================================================================

function setupEventListeners() {
    // Search input
    searchInput.addEventListener('input', handleSearch);

    // Category dropdown toggle
    categoryBtn.addEventListener('click', toggleCategoryMenu);

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!categoryBtn.contains(e.target) && !categoryMenu.contains(e.target)) {
            categoryMenu.classList.remove('active');
        }
    });

    // Grid size toggle
    const gridBtns = document.querySelectorAll('.grid-btn');
    gridBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const columns = parseInt(btn.dataset.columns);
            changeGridColumns(columns);

            // Update active state
            gridBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });
}

// Handle search input
function handleSearch(e) {
    searchQuery = e.target.value.toLowerCase().trim();
    renderProjects();
    updateStats();
}

// Toggle category dropdown
function toggleCategoryMenu(e) {
    e.stopPropagation();
    categoryMenu.classList.toggle('active');
}

// Change grid columns
function changeGridColumns(columns) {
    currentGridColumns = columns;
    projectsGrid.dataset.columns = columns;
}

// ============================================================================
// RENDER FUNCTIONS
// ============================================================================

// Render category filters
function renderCategories() {
    categoryMenu.innerHTML = '';

    categoriesData.forEach(category => {
        const item = document.createElement('div');
        item.className = 'category-item';
        if (category.name === currentCategory) {
            item.classList.add('active');
        }

        item.innerHTML = `
            <i data-feather="${category.icon}"></i>
            <span>${category.name}</span>
        `;

        item.addEventListener('click', () => selectCategory(category.name));
        categoryMenu.appendChild(item);
    });

    initializeIcons();
}

// Select category
function selectCategory(categoryName) {
    currentCategory = categoryName;
    currentCategoryEl.textContent = categoryName;
    categoryMenu.classList.remove('active');

    // Update active state
    const items = categoryMenu.querySelectorAll('.category-item');
    items.forEach((item, index) => {
        if (categoriesData[index].name === categoryName) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });

    renderProjects();
    updateStats();
}

// Render projects grid
function renderProjects() {
    loadingState.style.display = 'none';
    projectsGrid.innerHTML = '';

    // Filter projects
    const filteredProjects = filterProjects();

    if (filteredProjects.length === 0) {
        emptyState.style.display = 'flex';
        projectsGrid.style.display = 'none';
        return;
    }

    emptyState.style.display = 'none';
    projectsGrid.style.display = 'grid';

    // Create project cards
    filteredProjects.forEach((site, index) => {
        const card = createProjectCard(site);
        projectsGrid.appendChild(card);

        // Lazy load iframe after a short delay
        setTimeout(() => {
            loadIframe(card, site.url);
        }, 100 * index);
    });

    initializeIcons();
}

// Filter projects based on search and category
function filterProjects() {
    return sitesData.filter(site => {
        // Category filter
        const categoryMatch = currentCategory === 'All' || site.category === currentCategory;

        // Search filter
        const searchMatch = !searchQuery ||
            site.name.toLowerCase().includes(searchQuery) ||
            site.description.toLowerCase().includes(searchQuery) ||
            site.category.toLowerCase().includes(searchQuery);

        return categoryMatch && searchMatch;
    });
}

// Create project card element
function createProjectCard(site) {
    const template = document.getElementById('projectCardTemplate');
    const card = template.content.cloneNode(true).querySelector('.project-card');

    // Set gradient background for preview
    const preview = card.querySelector('.card-preview');
    preview.style.background = site.gradient || site.color;

    // Set fallback letter
    const fallbackLetter = card.querySelector('.fallback-letter');
    fallbackLetter.textContent = site.name.charAt(0).toUpperCase();
    fallbackLetter.style.color = site.color;

    // Set card content
    card.querySelector('.card-title').textContent = site.name;
    card.querySelector('.card-description').textContent = site.description;

    const categoryBadge = card.querySelector('.card-category');
    categoryBadge.textContent = site.category;
    categoryBadge.style.background = site.color;

    // Set click handler
    const visitBtn = card.querySelector('.card-btn');
    visitBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        window.location.href = site.url;
    });

    card.addEventListener('click', () => {
        window.location.href = site.url;
    });

    return card;
}

// Load iframe for preview
function loadIframe(card, url) {
    const iframe = card.querySelector('.card-iframe');
    const fallback = card.querySelector('.card-fallback');

    // Set iframe source
    iframe.src = url;

    // Timeout to show fallback if iframe doesn't load
    const loadTimeout = setTimeout(() => {
        fallback.classList.add('show');
    }, 3000);

    // If iframe loads successfully
    iframe.addEventListener('load', () => {
        clearTimeout(loadTimeout);
        // Keep fallback hidden if iframe loaded
    });

    // If iframe fails to load
    iframe.addEventListener('error', () => {
        clearTimeout(loadTimeout);
        fallback.classList.add('show');
    });
}

// Update statistics
function updateStats() {
    const filteredProjects = filterProjects();
    totalProjectsEl.textContent = sitesData.length;
    visibleProjectsEl.textContent = filteredProjects.length;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

// Debounce function for search
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Smooth scroll to top
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// ============================================================================
// KEYBOARD SHORTCUTS
// ============================================================================

document.addEventListener('keydown', (e) => {
    // Cmd/Ctrl + K to focus search
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInput.focus();
    }

    // Escape to clear search
    if (e.key === 'Escape' && document.activeElement === searchInput) {
        searchInput.value = '';
        searchQuery = '';
        renderProjects();
        updateStats();
        searchInput.blur();
    }
});

// ============================================================================
// PERFORMANCE OPTIMIZATION
// ============================================================================

// Intersection Observer for lazy loading
const observerOptions = {
    root: null,
    rootMargin: '50px',
    threshold: 0.1
};

const cardObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe all cards for animation
function observeCards() {
    const cards = document.querySelectorAll('.project-card');
    cards.forEach(card => cardObserver.observe(card));
}

// ============================================================================
// ERROR HANDLING
// ============================================================================

window.addEventListener('error', (e) => {
    console.error('Global error:', e.error);
});

window.addEventListener('unhandledrejection', (e) => {
    console.error('Unhandled promise rejection:', e.reason);
});

// ============================================================================
// CONSOLE STYLING
// ============================================================================

console.log(
    '%c🚀 WebList Hub',
    'font-size: 20px; font-weight: bold; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent;'
);
console.log(
    '%cPortal loaded successfully!',
    'font-size: 12px; color: #667eea;'
);
