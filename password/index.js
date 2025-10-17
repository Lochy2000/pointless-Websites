// ============================================================================
// PASSWORD MANAGER - Security & Encryption Layer
// ============================================================================

// Encryption utilities using Web Crypto API
const CryptoManager = {
    // Derive key from master password
    async deriveKey(password, salt) {
        const encoder = new TextEncoder();
        const keyMaterial = await window.crypto.subtle.importKey(
            'raw',
            encoder.encode(password),
            'PBKDF2',
            false,
            ['deriveBits', 'deriveKey']
        );

        return window.crypto.subtle.deriveKey(
            {
                name: 'PBKDF2',
                salt: salt,
                iterations: 100000,
                hash: 'SHA-256'
            },
            keyMaterial,
            { name: 'AES-GCM', length: 256 },
            false,
            ['encrypt', 'decrypt']
        );
    },

    // Encrypt data
    async encrypt(data, password) {
        const encoder = new TextEncoder();
        const salt = window.crypto.getRandomValues(new Uint8Array(16));
        const iv = window.crypto.getRandomValues(new Uint8Array(12));
        const key = await this.deriveKey(password, salt);

        const encrypted = await window.crypto.subtle.encrypt(
            { name: 'AES-GCM', iv: iv },
            key,
            encoder.encode(JSON.stringify(data))
        );

        // Combine salt + iv + encrypted data
        const combined = new Uint8Array(salt.length + iv.length + encrypted.byteLength);
        combined.set(salt, 0);
        combined.set(iv, salt.length);
        combined.set(new Uint8Array(encrypted), salt.length + iv.length);

        return btoa(String.fromCharCode(...combined));
    },

    // Decrypt data
    async decrypt(encryptedData, password) {
        const combined = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0));
        const salt = combined.slice(0, 16);
        const iv = combined.slice(16, 28);
        const encrypted = combined.slice(28);

        const key = await this.deriveKey(password, salt);

        try {
            const decrypted = await window.crypto.subtle.decrypt(
                { name: 'AES-GCM', iv: iv },
                key,
                encrypted
            );

            const decoder = new TextDecoder();
            return JSON.parse(decoder.decode(decrypted));
        } catch (e) {
            throw new Error('Decryption failed - incorrect password');
        }
    },

    // Hash password for verification
    async hashPassword(password) {
        const encoder = new TextEncoder();
        const data = encoder.encode(password);
        const hash = await window.crypto.subtle.digest('SHA-256', data);
        return btoa(String.fromCharCode(...new Uint8Array(hash)));
    }
};

// ============================================================================
// PASSWORD MANAGER - Data Management
// ============================================================================

class PasswordManager {
    constructor() {
        this.masterPassword = null;
        this.passwords = [];
        this.categories = ['Personal', 'Work', 'Banking', 'Social Media', 'Shopping', 'Other'];
        this.sessionTimeout = null;
        this.isLocked = true;
    }

    // Initialize the app
    async init() {
        const hasMasterPassword = localStorage.getItem('masterPasswordHash');
        if (hasMasterPassword) {
            this.showLoginScreen();
        } else {
            this.showSetupScreen();
        }
    }

    // Setup master password (first time)
    async setupMasterPassword(password) {
        if (password.length < 8) {
            throw new Error('Master password must be at least 8 characters');
        }

        const hash = await CryptoManager.hashPassword(password);
        localStorage.setItem('masterPasswordHash', hash);
        this.masterPassword = password;
        this.isLocked = false;

        // Initialize with empty password list
        await this.saveData();
        this.showMainApp();
        this.startSessionTimeout();
    }

    // Login with master password
    async login(password) {
        const storedHash = localStorage.getItem('masterPasswordHash');
        const inputHash = await CryptoManager.hashPassword(password);

        if (storedHash !== inputHash) {
            throw new Error('Incorrect master password');
        }

        this.masterPassword = password;
        this.isLocked = false;
        await this.loadData();
        this.showMainApp();
        this.startSessionTimeout();
    }

    // Lock the app
    lock() {
        this.isLocked = true;
        this.masterPassword = null;
        this.passwords = [];
        this.clearSessionTimeout();
        this.showLoginScreen();
    }

    // Session timeout management
    startSessionTimeout() {
        this.clearSessionTimeout();
        const resetTimeout = () => {
            this.clearSessionTimeout();
            this.sessionTimeout = setTimeout(() => this.lock(), 15 * 60 * 1000); // 15 minutes
        };

        resetTimeout();
        ['mousedown', 'keydown', 'scroll', 'touchstart'].forEach(event => {
            document.addEventListener(event, resetTimeout);
        });
    }

    clearSessionTimeout() {
        if (this.sessionTimeout) {
            clearTimeout(this.sessionTimeout);
            this.sessionTimeout = null;
        }
    }

    // Save encrypted data
    async saveData() {
        const data = {
            passwords: this.passwords,
            categories: this.categories
        };
        const encrypted = await CryptoManager.encrypt(data, this.masterPassword);
        localStorage.setItem('encryptedData', encrypted);
    }

    // Load encrypted data
    async loadData() {
        const encrypted = localStorage.getItem('encryptedData');
        if (encrypted) {
            const data = await CryptoManager.decrypt(encrypted, this.masterPassword);
            this.passwords = data.passwords || [];
            this.categories = data.categories || this.categories;
        }
    }

    // Add password
    async addPassword(passwordData) {
        const password = {
            id: Date.now().toString(),
            name: passwordData.name,
            website: passwordData.website || '',
            username: passwordData.username || '',
            password: passwordData.password,
            category: passwordData.category || 'Other',
            notes: passwordData.notes || '',
            createdDate: new Date().toISOString(),
            lastModified: new Date().toISOString()
        };

        this.passwords.unshift(password);
        await this.saveData();
        return password;
    }

    // Update password
    async updatePassword(id, updates) {
        const index = this.passwords.findIndex(p => p.id === id);
        if (index !== -1) {
            this.passwords[index] = {
                ...this.passwords[index],
                ...updates,
                lastModified: new Date().toISOString()
            };
            await this.saveData();
        }
    }

    // Delete password
    async deletePassword(id) {
        this.passwords = this.passwords.filter(p => p.id !== id);
        await this.saveData();
    }

    // Add category
    async addCategory(name) {
        if (!this.categories.includes(name)) {
            this.categories.push(name);
            await this.saveData();
        }
    }

    // Delete category
    async deleteCategory(name) {
        // Move passwords to 'Other'
        this.passwords.forEach(p => {
            if (p.category === name) {
                p.category = 'Other';
            }
        });
        this.categories = this.categories.filter(c => c !== name);
        await this.saveData();
    }

    // Search passwords
    searchPasswords(query, category = null) {
        let results = this.passwords;

        if (category && category !== 'All') {
            results = results.filter(p => p.category === category);
        }

        if (query) {
            const lowerQuery = query.toLowerCase();
            results = results.filter(p =>
                p.name.toLowerCase().includes(lowerQuery) ||
                p.website.toLowerCase().includes(lowerQuery) ||
                p.username.toLowerCase().includes(lowerQuery) ||
                p.category.toLowerCase().includes(lowerQuery)
            );
        }

        return results;
    }

    // UI Display methods
    showSetupScreen() {
        document.getElementById('setup-screen').classList.remove('hidden');
        document.getElementById('login-screen').classList.add('hidden');
        document.getElementById('main-app').classList.add('hidden');
    }

    showLoginScreen() {
        document.getElementById('setup-screen').classList.add('hidden');
        document.getElementById('login-screen').classList.remove('hidden');
        document.getElementById('main-app').classList.add('hidden');
    }

    showMainApp() {
        document.getElementById('setup-screen').classList.add('hidden');
        document.getElementById('login-screen').classList.add('hidden');
        document.getElementById('main-app').classList.remove('hidden');
        this.renderCategories();
        this.renderPasswords();
    }

    // Render categories (for dropdown)
    renderCategories() {
        const container = document.getElementById('category-list');
        container.innerHTML = `
            <button class="category-btn active w-full text-left px-3 py-2 hover:bg-gray-700 transition-colors text-sm" data-category="All">
                <i data-feather="grid" class="w-4 h-4 inline mr-2"></i>All Passwords <span class="text-gray-400">(${this.passwords.length})</span>
            </button>
        `;

        this.categories.forEach(cat => {
            const count = this.passwords.filter(p => p.category === cat).length;
            const btn = document.createElement('button');
            btn.className = 'category-btn w-full text-left px-3 py-2 hover:bg-gray-700 transition-colors text-sm';
            btn.dataset.category = cat;
            btn.innerHTML = `
                <i data-feather="folder" class="w-4 h-4 inline mr-2"></i>${cat} <span class="text-gray-400">(${count})</span>
            `;
            container.appendChild(btn);
        });

        feather.replace();

        // Add click handlers
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                // Update selected category name
                document.getElementById('selected-category-name').textContent = btn.dataset.category;

                // Close dropdown
                document.getElementById('category-dropdown').classList.add('hidden');

                this.renderPasswords(btn.dataset.category);
            });
        });
    }

    // Render passwords
    renderPasswords(category = 'All', searchQuery = '') {
        const passwords = this.searchPasswords(searchQuery, category);
        const container = document.getElementById('passwords-container');

        // Update password count
        const countEl = document.getElementById('password-count');
        if (countEl) {
            countEl.textContent = `(${passwords.length})`;
        }

        if (passwords.length === 0) {
            container.innerHTML = `
                <div class="text-center py-12 text-gray-500">
                    <i data-feather="lock" class="w-16 h-16 mx-auto mb-4"></i>
                    <p class="text-lg">No passwords found</p>
                    <p class="text-sm">Generate and save your first password to get started</p>
                </div>
            `;
            feather.replace();
            return;
        }

        container.innerHTML = passwords.map(pwd => this.createPasswordCard(pwd)).join('');
        feather.replace();
        this.attachPasswordCardEvents();
    }

    // Create password card HTML
    createPasswordCard(pwd) {
        const categoryColors = {
            'Personal': 'bg-blue-600',
            'Work': 'bg-purple-600',
            'Banking': 'bg-green-600',
            'Social Media': 'bg-pink-600',
            'Shopping': 'bg-yellow-600',
            'Other': 'bg-gray-600'
        };

        return `
            <div class="password-card bg-gray-800 rounded-lg p-4 mb-3 border border-gray-700 hover:border-gray-600 transition-all" data-id="${pwd.id}">
                <div class="flex justify-between items-start mb-3">
                    <div class="flex-1">
                        <h3 class="text-lg font-semibold text-white mb-1">${this.escapeHtml(pwd.name)}</h3>
                        ${pwd.website ? `
                            <a href="${this.escapeHtml(pwd.website)}" target="_blank" class="text-sm text-blue-400 hover:text-blue-300 flex items-center">
                                <i data-feather="external-link" class="w-3 h-3 mr-1"></i>
                                ${this.escapeHtml(pwd.website)}
                            </a>
                        ` : ''}
                    </div>
                    <span class="text-xs px-2 py-1 rounded ${categoryColors[pwd.category] || categoryColors['Other']} text-white">
                        ${pwd.category}
                    </span>
                </div>

                ${pwd.username ? `
                    <div class="mb-2 flex items-center">
                        <span class="text-xs text-gray-400 mr-2">Username:</span>
                        <span class="text-sm text-gray-300 flex-1">${this.escapeHtml(pwd.username)}</span>
                        <button class="copy-username p-1 text-gray-400 hover:text-primary transition-colors" data-value="${this.escapeHtml(pwd.username)}">
                            <i data-feather="copy" class="w-4 h-4"></i>
                        </button>
                    </div>
                ` : ''}

                <div class="mb-3 flex items-center">
                    <span class="text-xs text-gray-400 mr-2">Password:</span>
                    <div class="flex-1 font-mono text-sm bg-gray-900 px-3 py-2 rounded">
                        <span class="password-hidden">••••••••••••</span>
                        <span class="password-visible hidden">${this.escapeHtml(pwd.password)}</span>
                    </div>
                    <button class="toggle-password p-1 ml-2 text-gray-400 hover:text-primary transition-colors">
                        <i data-feather="eye" class="w-4 h-4"></i>
                    </button>
                    <button class="copy-password p-1 text-gray-400 hover:text-primary transition-colors" data-value="${this.escapeHtml(pwd.password)}">
                        <i data-feather="copy" class="w-4 h-4"></i>
                    </button>
                </div>

                ${pwd.notes ? `
                    <div class="mb-3 text-sm text-gray-400 bg-gray-900 p-2 rounded">
                        <i data-feather="file-text" class="w-3 h-3 inline mr-1"></i>
                        ${this.escapeHtml(pwd.notes)}
                    </div>
                ` : ''}

                <div class="flex justify-between items-center text-xs text-gray-500 border-t border-gray-700 pt-3">
                    <span>Created: ${new Date(pwd.createdDate).toLocaleDateString()}</span>
                    <div class="space-x-2">
                        <button class="edit-password text-blue-400 hover:text-blue-300">
                            <i data-feather="edit-2" class="w-4 h-4 inline"></i> Edit
                        </button>
                        <button class="delete-password text-red-400 hover:text-red-300">
                            <i data-feather="trash-2" class="w-4 h-4 inline"></i> Delete
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    // Attach events to password cards
    attachPasswordCardEvents() {
        // Toggle password visibility
        document.querySelectorAll('.toggle-password').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const card = e.target.closest('.password-card');
                const hidden = card.querySelector('.password-hidden');
                const visible = card.querySelector('.password-visible');
                const icon = btn.querySelector('i');

                hidden.classList.toggle('hidden');
                visible.classList.toggle('hidden');

                if (hidden.classList.contains('hidden')) {
                    icon.outerHTML = '<i data-feather="eye-off" class="w-4 h-4"></i>';
                } else {
                    icon.outerHTML = '<i data-feather="eye" class="w-4 h-4"></i>';
                }
                feather.replace();
            });
        });

        // Copy password
        document.querySelectorAll('.copy-password').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const value = btn.dataset.value;
                await navigator.clipboard.writeText(value);
                showToast('Password copied to clipboard');

                // Auto-clear clipboard after 30 seconds
                setTimeout(() => {
                    navigator.clipboard.writeText('');
                }, 30000);
            });
        });

        // Copy username
        document.querySelectorAll('.copy-username').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const value = btn.dataset.value;
                await navigator.clipboard.writeText(value);
                showToast('Username copied to clipboard');
            });
        });

        // Edit password
        document.querySelectorAll('.edit-password').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.closest('.password-card').dataset.id;
                const password = this.passwords.find(p => p.id === id);
                openPasswordModal(password);
            });
        });

        // Delete password
        document.querySelectorAll('.delete-password').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const id = e.target.closest('.password-card').dataset.id;
                const password = this.passwords.find(p => p.id === id);

                if (confirm(`Are you sure you want to delete "${password.name}"?`)) {
                    await this.deletePassword(id);
                    this.renderCategories();
                    this.renderPasswords();
                    showToast('Password deleted');
                }
            });
        });
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// ============================================================================
// PASSWORD GENERATOR
// ============================================================================

const generatePassword = () => {
    const length = parseInt(document.getElementById('password-length').value);
    const uppercase = document.getElementById('uppercase').checked;
    const lowercase = document.getElementById('lowercase').checked;
    const numbers = document.getElementById('numbers').checked;
    const symbols = document.getElementById('symbols').checked;

    let charset = '';
    if (uppercase) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (lowercase) charset += 'abcdefghijklmnopqrstuvwxyz';
    if (numbers) charset += '0123456789';
    if (symbols) charset += '!@#$%^&*()_+-=[]{}|;:,.<>?';

    if (!charset) {
        showToast('Please select at least one character type', 'error');
        return '';
    }

    let password = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * charset.length);
        password += charset[randomIndex];
    }

    const passwordField = document.getElementById('generated-password');
    passwordField.value = password;
    passwordField.classList.add('animate-pulse-once');
    setTimeout(() => passwordField.classList.remove('animate-pulse-once'), 500);

    // Update strength indicator
    updatePasswordStrength(password);

    return password;
};

// Password strength calculator
const updatePasswordStrength = (password) => {
    const indicator = document.getElementById('strength-indicator');
    const text = document.getElementById('strength-text');

    if (!password) {
        indicator.className = 'h-2 rounded-full bg-gray-700';
        text.textContent = '';
        return;
    }

    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (password.length >= 16) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;

    const levels = [
        { class: 'bg-red-500', text: 'Very Weak', width: 'w-1/6' },
        { class: 'bg-red-500', text: 'Weak', width: 'w-2/6' },
        { class: 'bg-orange-500', text: 'Fair', width: 'w-3/6' },
        { class: 'bg-yellow-500', text: 'Good', width: 'w-4/6' },
        { class: 'bg-green-500', text: 'Strong', width: 'w-5/6' },
        { class: 'bg-green-600', text: 'Very Strong', width: 'w-full' }
    ];

    const level = levels[Math.min(strength, 5)];
    indicator.className = `h-2 rounded-full ${level.class} ${level.width} transition-all`;
    text.textContent = level.text;
    text.className = `text-sm font-medium ${level.class.replace('bg-', 'text-')}`;
};

// ============================================================================
// UI UTILITIES
// ============================================================================

// Toast notification
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg text-white z-50 ${
        type === 'success' ? 'bg-green-600' : 'bg-red-600'
    }`;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.3s';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Open password modal
function openPasswordModal(existingPassword = null) {
    const modal = document.getElementById('password-modal');
    const form = document.getElementById('password-form');

    // Populate form
    if (existingPassword) {
        document.getElementById('modal-title').textContent = 'Edit Password';
        document.getElementById('pwd-name').value = existingPassword.name;
        document.getElementById('pwd-website').value = existingPassword.website;
        document.getElementById('pwd-username').value = existingPassword.username;
        document.getElementById('pwd-password').value = existingPassword.password;
        document.getElementById('pwd-category').value = existingPassword.category;
        document.getElementById('pwd-notes').value = existingPassword.notes;
        form.dataset.editId = existingPassword.id;
    } else {
        document.getElementById('modal-title').textContent = 'Save Password';
        form.reset();
        const generatedPwd = document.getElementById('generated-password').value;
        if (generatedPwd) {
            document.getElementById('pwd-password').value = generatedPwd;
        }
        delete form.dataset.editId;
    }

    // Populate category dropdown
    const categorySelect = document.getElementById('pwd-category');
    categorySelect.innerHTML = manager.categories.map(cat =>
        `<option value="${cat}">${cat}</option>`
    ).join('');

    if (existingPassword) {
        categorySelect.value = existingPassword.category;
    }

    modal.classList.remove('hidden');
}

function closePasswordModal() {
    document.getElementById('password-modal').classList.add('hidden');
    document.getElementById('password-form').reset();
}

// ============================================================================
// INITIALIZATION
// ============================================================================

const manager = new PasswordManager();

document.addEventListener('DOMContentLoaded', () => {
    // Initialize feather icons
    feather.replace();

    // Theme toggle
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            document.documentElement.classList.toggle('dark');
            const isDark = document.documentElement.classList.contains('dark');
            themeToggle.innerHTML = isDark ? feather.icons.moon.toSvg() : feather.icons.sun.toSvg();
        });
    }

    // Setup screen
    document.getElementById('setup-form')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const password = document.getElementById('setup-password').value;
        const confirm = document.getElementById('setup-confirm').value;

        if (password !== confirm) {
            showToast('Passwords do not match', 'error');
            return;
        }

        try {
            await manager.setupMasterPassword(password);
            showToast('Master password created successfully');
        } catch (error) {
            showToast(error.message, 'error');
        }
    });

    // Login screen
    document.getElementById('login-form')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const password = document.getElementById('login-password').value;

        try {
            await manager.login(password);
            showToast('Logged in successfully');
        } catch (error) {
            showToast(error.message, 'error');
        }
    });

    // Lock button
    document.getElementById('lock-btn')?.addEventListener('click', () => {
        manager.lock();
        showToast('App locked');
    });

    // Password generator
    document.getElementById('password-length')?.addEventListener('input', (e) => {
        document.getElementById('length-value').textContent = e.target.value;
    });

    document.getElementById('generate-password')?.addEventListener('click', generatePassword);

    // Copy generated password
    document.getElementById('copy-password')?.addEventListener('click', async () => {
        const password = document.getElementById('generated-password').value;
        if (password) {
            await navigator.clipboard.writeText(password);
            showToast('Password copied to clipboard');
        }
    });

    // Save password button
    document.getElementById('save-password')?.addEventListener('click', () => {
        const password = document.getElementById('generated-password').value;
        if (password) {
            openPasswordModal();
        } else {
            showToast('Please generate a password first', 'error');
        }
    });

    // Password form submit
    document.getElementById('password-form')?.addEventListener('submit', async (e) => {
        e.preventDefault();

        const passwordData = {
            name: document.getElementById('pwd-name').value,
            website: document.getElementById('pwd-website').value,
            username: document.getElementById('pwd-username').value,
            password: document.getElementById('pwd-password').value,
            category: document.getElementById('pwd-category').value,
            notes: document.getElementById('pwd-notes').value
        };

        const editId = e.target.dataset.editId;

        try {
            if (editId) {
                await manager.updatePassword(editId, passwordData);
                showToast('Password updated successfully');
            } else {
                await manager.addPassword(passwordData);
                showToast('Password saved successfully');
            }

            closePasswordModal();
            manager.renderCategories();
            manager.renderPasswords();
        } catch (error) {
            showToast(error.message, 'error');
        }
    });

    // Modal close buttons
    document.getElementById('cancel-password')?.addEventListener('click', closePasswordModal);
    document.getElementById('close-modal')?.addEventListener('click', closePasswordModal);

    // Search functionality
    document.getElementById('search-passwords')?.addEventListener('input', (e) => {
        const query = e.target.value;
        const activeCategory = document.querySelector('.category-btn.active')?.dataset.category || 'All';
        manager.renderPasswords(activeCategory, query);
    });

    // Category management
    document.getElementById('add-category-btn')?.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent dropdown from closing
        const name = prompt('Enter category name:');
        if (name && name.trim()) {
            manager.addCategory(name.trim());
            manager.renderCategories();
            showToast('Category added');
        }
    });

    // Category dropdown toggle
    document.getElementById('category-dropdown-btn')?.addEventListener('click', (e) => {
        e.stopPropagation();
        const dropdown = document.getElementById('category-dropdown');
        dropdown.classList.toggle('hidden');
    });

    // Options dropdown toggle
    document.getElementById('options-dropdown-btn')?.addEventListener('click', (e) => {
        e.stopPropagation();
        const dropdown = document.getElementById('options-dropdown');
        dropdown.classList.toggle('hidden');
    });

    // Close dropdowns when clicking outside
    document.addEventListener('click', () => {
        const categoryDropdown = document.getElementById('category-dropdown');
        const optionsDropdown = document.getElementById('options-dropdown');

        if (categoryDropdown && !categoryDropdown.classList.contains('hidden')) {
            categoryDropdown.classList.add('hidden');
        }
        if (optionsDropdown && !optionsDropdown.classList.contains('hidden')) {
            optionsDropdown.classList.add('hidden');
        }
    });

    // Toggle generator section
    document.getElementById('toggle-generator')?.addEventListener('click', () => {
        const content = document.getElementById('generator-content');
        const chevron = document.getElementById('generator-chevron');

        content.classList.toggle('hidden');
        chevron.classList.toggle('rotate-180');
    });

    // Toggle passwords section
    document.getElementById('toggle-passwords')?.addEventListener('click', () => {
        const content = document.getElementById('passwords-content');
        const chevron = document.getElementById('passwords-chevron');

        content.classList.toggle('hidden');
        chevron.classList.toggle('rotate-180');
    });

    // Mode toggle (Generate vs Manual)
    document.getElementById('mode-generate')?.addEventListener('click', () => {
        document.getElementById('mode-generate').classList.add('active');
        document.getElementById('mode-manual').classList.remove('active');
        document.getElementById('generate-mode-content').classList.remove('hidden');
        document.getElementById('manual-mode-content').classList.add('hidden');
    });

    document.getElementById('mode-manual')?.addEventListener('click', () => {
        document.getElementById('mode-manual').classList.add('active');
        document.getElementById('mode-generate').classList.remove('active');
        document.getElementById('manual-mode-content').classList.remove('hidden');
        document.getElementById('generate-mode-content').classList.add('hidden');
    });

    // Use manual password
    document.getElementById('use-manual-password')?.addEventListener('click', () => {
        const manualPassword = document.getElementById('manual-password-input').value;
        if (manualPassword) {
            document.getElementById('generated-password').value = manualPassword;
            updatePasswordStrength(manualPassword);
            showToast('Password set successfully');
        } else {
            showToast('Please enter a password', 'error');
        }
    });

    // Add password manually (quick add button)
    document.getElementById('add-password-manual')?.addEventListener('click', () => {
        openPasswordModal();
    });

    // Update strength indicator on manual input
    document.getElementById('manual-password-input')?.addEventListener('input', (e) => {
        const password = e.target.value;
        if (password) {
            updatePasswordStrength(password);
        }
    });

    // Initialize the app
    manager.init();
});
