// Main Application Class
class SoftwarePortalApp {
    constructor() {
        this.softwareGrid = null;
        this.topDownloadsSidebar = null;
        this.categoryFilter = null;
        this.sidebarCategories = null;
        this.currentView = 'grid';
        this.currentCategory = 'all';
        this.currentSearch = '';
        this.api = null;
        
        this.init();
    }

    async init() {
        console.log('🚀 Initializing Windows ISO Portal App...');
        
        // Wait for Supabase to be ready
        await this.waitForSupabase();
        
        // Initialize API
        this.api = new SoftwareAPI();
        
        // Initialize components
        this.initializeComponents();
        
        // Bind events
        this.bindEvents();
        
        // Load initial data
        await this.renderInitialData();
        
        console.log('✅ App initialized successfully');
    }

    async waitForSupabase() {
        console.log('⏳ Waiting for Supabase client...');
        
        const maxAttempts = 20; // 10 seconds max
        let attempts = 0;
        
        while (attempts < maxAttempts) {
            if (window.supabaseClient?.isReady()) {
                console.log('✓ Supabase client ready');
                return;
            }
            
            await new Promise(resolve => setTimeout(resolve, 500));
            attempts++;
        }
        
        throw new Error('Supabase client failed to initialize');
    }

    initializeComponents() {
        console.log('🔧 Initializing components...');
        
        // Initialize components
        this.softwareGrid = new SoftwareGrid('softwareGrid');
        this.topDownloadsSidebar = new TopDownloadsSidebar('topDownloads');
        this.categoryFilter = new CategoryFilter('categoryButtons');
        this.sidebarCategories = new SidebarCategories('sidebarCategories');
        
        console.log('✓ Components initialized');
    }

    bindEvents() {
        console.log('🎧 Setting up event listeners...');
        
        // View toggle events
        const gridViewBtn = document.getElementById('gridView');
        const listViewBtn = document.getElementById('listView');
        
        if (gridViewBtn) {
            gridViewBtn.addEventListener('click', () => {
                this.changeView('grid');
            });
        }

        if (listViewBtn) {
            listViewBtn.addEventListener('click', () => {
                this.changeView('list');
            });
        }

        // Search functionality
        const searchInput = document.querySelector('.search-box input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.handleSearch(e.target.value);
            });
        }

        // Load more button
        const loadMoreBtn = document.getElementById('loadMoreBtn');
        if (loadMoreBtn) {
            loadMoreBtn.addEventListener('click', () => {
                this.handleLoadMore();
            });
        }
        
        console.log('✓ Event listeners set up');
    }

    async renderInitialData() {
        try {
            console.log('📊 Loading initial data...');
            
            // Show loading state
            this.showLoading();

            // Fetch data in parallel
            const [softwareResult, categoriesResult, topDownloadsResult] = await Promise.all([
                this.api.getAllSoftware(),
                this.api.getCategories(),
                this.api.getTopDownloads()
            ]);

            // Check if any request failed
            if (!softwareResult.success || !categoriesResult.success) {
                console.error('Supabase failed:', softwareResult.error || categoriesResult.error);
                throw new Error('Failed to load data from Supabase');
            }

            // Render with Supabase data
            await this.renderWithData(softwareResult.data, categoriesResult.data, topDownloadsResult.data || []);

        } catch (error) {
            console.error('Error loading data:', error);
            this.showError('Failed to load data from Supabase. Please check your connection and refresh the page.');
        }
    }

    async renderWithData(softwareList, categories, topDownloads) {
        // Store data globally for compatibility with existing components
        window.softwareData = {
            software: softwareList,
            categories: categories
        };

        // Render components
        this.softwareGrid.render(softwareList, this.currentView);
        await this.topDownloadsSidebar.render();
        await this.categoryFilter.render();
        await this.sidebarCategories.render();
        
        console.log(`Rendered ${softwareList.length} Windows ISO versions from Supabase`);
    }

    async changeView(viewMode) {
        this.currentView = viewMode;
        
        // Update button states
        const gridViewBtn = document.getElementById('gridView');
        const listViewBtn = document.getElementById('listView');
        
        if (gridViewBtn) gridViewBtn.classList.toggle('active', viewMode === 'grid');
        if (listViewBtn) listViewBtn.classList.toggle('active', viewMode === 'list');
        
        // Re-render software grid with current data
        const currentSoftware = this.currentCategory === 'all' 
            ? window.softwareData.software 
            : window.softwareData.software.filter(s => s.category_id === this.getCategoryIdBySlug(this.currentCategory));
        
        this.softwareGrid.render(currentSoftware, viewMode);
    }

    async handleCategoryFilter(categorySlug) {
        this.currentCategory = categorySlug;
        this.categoryFilter.setActiveCategory(categorySlug);
        
        try {
            this.showLoading();
            
            const result = await this.api.getSoftwareByCategory(categorySlug);
            
            if (result.success) {
                this.softwareGrid.render(result.data, this.currentView);
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            console.error('Error filtering by category:', error);
            this.showError('Failed to load category data.');
        }
    }

    async handleSearch(query) {
        this.currentSearch = query;
        
        try {
            this.showLoading();
            
            let result;
            if (!query.trim()) {
                result = await this.api.getSoftwareByCategory(this.currentCategory);
            } else {
                result = await this.api.searchSoftware(query);
            }

            if (result.success) {
                this.softwareGrid.render(result.data, this.currentView);
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            console.error('Error searching:', error);
            this.showError('Failed to search ISO.');
        }
    }

    getCategoryIdBySlug(slug) {
        if (!window.softwareData?.categories) return null;
        const category = window.softwareData.categories.find(c => c.slug === slug);
        return category ? category.id : null;
    }

    showLoading() {
        const grid = document.getElementById('softwareGrid');
        if (grid) {
            grid.innerHTML = `
                <div class="text-center py-5">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                    <p class="mt-3 text-muted">Loading Windows ISO versions from Supabase...</p>
                </div>
            `;
        }
    }

    showError(message) {
        const grid = document.getElementById('softwareGrid');
        if (grid) {
            grid.innerHTML = `
                <div class="text-center py-5">
                    <i class="fas fa-exclamation-triangle text-warning fa-3x mb-3"></i>
                    <h5>Oops! Something went wrong</h5>
                    <p class="text-muted">${message}</p>
                    <button class="btn btn-primary" onclick="location.reload()">
                        <i class="fas fa-redo me-2"></i>Refresh Page
                    </button>
                </div>
            `;
        }
    }

    handleLoadMore() {
        // Simulate loading more software
        const loadMoreBtn = document.getElementById('loadMoreBtn');
        if (!loadMoreBtn) return;
        
        const originalText = loadMoreBtn.innerHTML;
        
        loadMoreBtn.innerHTML = '<span class="loading-spinner"></span> Loading...';
        loadMoreBtn.disabled = true;
        
        setTimeout(() => {
            loadMoreBtn.innerHTML = originalText;
            loadMoreBtn.disabled = false;
            
            // Show notification
            this.showNotification('More software loaded!', 'success');
        }, 2000);
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `alert alert-${type === 'error' ? 'danger' : type} alert-dismissible fade show position-fixed`;
        notification.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
        notification.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        document.body.appendChild(notification);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);
    }
}

// Global event handlers
function handleTopDownloadClick(softwareName) {
    const app = window.softwarePortalApp;
    if (app) {
        app.showNotification(`Opening ${softwareName}...`, 'info');
    }
}

function handleCategoryFilter(categorySlug) {
    const app = window.softwarePortalApp;
    if (app) {
        app.handleCategoryFilter(categorySlug);
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.softwarePortalApp = new SoftwarePortalApp();
    
    // Add some interactive features
    addHoverEffects();
    addKeyboardNavigation();
});

// Add hover effects to software cards
function addHoverEffects() {
    document.addEventListener('mouseover', function(e) {
        if (e.target.closest('.software-card')) {
            const card = e.target.closest('.software-card');
            card.style.transform = 'translateY(-5px)';
            card.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
        }
    });

    document.addEventListener('mouseout', function(e) {
        if (e.target.closest('.software-card')) {
            const card = e.target.closest('.software-card');
            card.style.transform = 'translateY(0)';
            card.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
        }
    });
}

// Add keyboard navigation
function addKeyboardNavigation() {
    document.addEventListener('keydown', function(e) {
        // Ctrl/Cmd + K to focus search
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            const searchInput = document.querySelector('.search-box input');
            if (searchInput) {
                searchInput.focus();
            }
        }
    });
}

// Add smooth scrolling for anchor links
document.addEventListener('click', function(e) {
    if (e.target.matches('a[href^="#"]')) {
        e.preventDefault();
        const target = document.querySelector(e.target.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    }
});

// Global functions for donate functionality
function openDonateModal() {
    console.log('Opening donate modal...');
    const modalElement = document.getElementById('donateModal');
    if (!modalElement) {
        console.error('Donate modal element not found');
        return;
    }
    
    const modal = new bootstrap.Modal(modalElement);
    modal.show();
}

function donatePayPal() {
    console.log('Opening PayPal donation...');
    // Replace with your actual PayPal donation link
    const paypalUrl = 'https://www.paypal.com/donate/?hosted_button_id=YOUR_BUTTON_ID';
    window.open(paypalUrl, '_blank');
    
    // Track donation event
    trackDonationEvent('paypal');
}

function donateCrypto() {
    console.log('Opening crypto donation...');
    // Replace with your actual crypto donation addresses
    const cryptoInfo = `
Bitcoin (BTC): bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh
Ethereum (ETH): 0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6
Litecoin (LTC): ltc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh
    `;
    
    // Copy to clipboard and show alert
    navigator.clipboard.writeText(cryptoInfo.trim()).then(() => {
        alert('Crypto addresses copied to clipboard!\n\n' + cryptoInfo);
    }).catch(() => {
        alert('Crypto donation addresses:\n\n' + cryptoInfo);
    });
    
    // Track donation event
    trackDonationEvent('crypto');
}

function donateBank() {
    console.log('Opening bank transfer info...');
    // Replace with your actual bank transfer details
    const bankInfo = `
Bank: Your Bank Name
Account Name: Your Name
Account Number: 1234567890
IBAN: XX00 0000 0000 0000 0000 0000
SWIFT/BIC: BANKXXXX
    `;
    
    // Copy to clipboard and show alert
    navigator.clipboard.writeText(bankInfo.trim()).then(() => {
        alert('Bank transfer details copied to clipboard!\n\n' + bankInfo);
    }).catch(() => {
        alert('Bank transfer details:\n\n' + bankInfo);
    });
    
    // Track donation event
    trackDonationEvent('bank');
}

function donateCoffee() {
    console.log('Opening Buy Me a Coffee...');
    // Replace with your actual Buy Me a Coffee link
    const coffeeUrl = 'https://www.buymeacoffee.com/yourusername';
    window.open(coffeeUrl, '_blank');
    
    // Track donation event
    trackDonationEvent('coffee');
}

function trackDonationEvent(method) {
    // Track donation event for analytics
    console.log(`Donation event tracked: ${method}`);
    
    // You can integrate with Google Analytics, Facebook Pixel, or other tracking services here
    if (typeof gtag !== 'undefined') {
        gtag('event', 'donation_click', {
            'donation_method': method,
            'event_category': 'engagement',
            'event_label': 'donate_modal'
        });
    }
    
    // Close modal after action
    const modal = bootstrap.Modal.getInstance(document.getElementById('donateModal'));
    if (modal) {
        modal.hide();
    }
} 