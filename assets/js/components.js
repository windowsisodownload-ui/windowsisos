// Component for rendering ISO card
class SoftwareCard {
    constructor(software) {
        this.software = software;
    }

    render(viewMode = 'grid') {
        const cardClass = viewMode === 'list' ? 'software-card list-view' : 'software-card';
        const colClass = viewMode === 'list' ? 'col-12' : 'col-xl-1-7 col-lg-2 col-md-3 col-sm-4 col-6';

        // Extract edition from name if not explicitly defined
        const edition = this.software.edition || this.getEditionFromName(this.software.name);

        return `
            <div class="${colClass}">
                <div class="card ${cardClass} clickable-card" 
                     data-software-id="${this.software.id}" 
                     onclick="navigateToSoftwareDetail(${this.software.id})">
                    <img src="${this.software.main_image_url || 'assets/images/default-software.jpg'}" alt="${this.software.name}" class="card-img-top">
                    <div class="card-body">
                        <h6 class="card-title">${this.software.name}</h6>
                        <div class="badges-container">
                            <div class="badge-row">
                                <span class="badge bg-primary badge-version">
                                    ${this.software.version || 'N/A'}
                                </span>
                                <span class="badge bg-info badge-architecture">
                                    ${this.software.architecture || 'N/A'}
                                </span>
                            </div>
                            <div class="badge-row">
                                <span class="badge ${getEditionBadgeColor(edition)} badge-edition">
                                    ${edition}
                                </span>
                                <span class="badge ${getLicenseBadgeColor(this.software.license_type)} badge-license">
                                    ${(this.software.license_type || 'FREE').toUpperCase()}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    getEditionFromName(name) {
        if (name.includes('Server')) return 'Server';
        if (name.includes('Enterprise')) return 'Enterprise';
        if (name.includes('Education')) return 'Education';
        if (name.includes('Professional') || name.includes('Pro')) return 'Pro';
        if (name.includes('Ultimate')) return 'Ultimate';
        if (name.includes('Home Premium')) return 'Home Premium';
        if (name.includes('Home Basic')) return 'Basic';
        if (name.includes('Home')) return 'Home';
        if (name.includes('Business')) return 'Business';
        if (name.includes('Starter')) return 'Starter';
        if (name.includes('Basic')) return 'Basic';
        if (name.includes('Premium')) return 'Premium';
        if (name.includes('Media Center')) return 'Media Center';
        if (name.includes('Tablet PC')) return 'Tablet PC';
        if (name.includes('Workstation')) return 'Workstation';
        if (name.includes('Advanced Server')) return 'Advanced Server';
        if (name.includes('Datacenter Server')) return 'Datacenter Server';
        if (name.includes('Terminal Server')) return 'Terminal Server';
        if (name.includes('S ')) return 'S';
        if (name.includes('Standard')) return 'Standard';
        return 'Standard';
    }
}

// Component for rendering top download item
class TopDownloadItem {
    constructor(software) {
        this.software = software;
    }

    render() {
        return `
            <div class="top-download-item" onclick="navigateToSoftwareDetail(${this.software.id})">
                <div class="d-flex align-items-center">
                    <img src="${this.software.main_image_url}" alt="${this.software.name}" class="me-3">
                    <div class="flex-grow-1">
                        <div class="title">${this.software.name}</div>
                        <div class="downloads">${formatDownloadCount(this.software.download_count)} downloads</div>
                    </div>
                </div>
            </div>
        `;
    }
}

// Component for rendering category button
class CategoryButton {
    constructor(category, isActive = false) {
        this.category = category;
        this.isActive = isActive;
    }

    render() {
        const activeClass = this.isActive ? 'active' : '';
        return `
            <button class="category-btn ${activeClass}" 
                    onclick="handleCategoryFilter('${this.category.slug}')">
                <i class="${this.category.icon} me-1"></i>
                ${this.category.name}
            </button>
        `;
    }
}

// Component for rendering sidebar category link
class SidebarCategoryLink {
    constructor(category) {
        this.category = category;
    }

    render() {
        return `
            <a href="#" class="btn btn-outline-secondary btn-sm text-start sidebar-category-link" 
               onclick="handleCategoryFilter('${this.category.slug}')">
                <i class="${this.category.icon} me-2"></i>${this.category.name}
            </a>
        `;
    }
}

// Component for rendering empty state
class EmptyState {
    constructor(message = "No ISO found", icon = "fas fa-search") {
        this.message = message;
        this.icon = icon;
    }

    render() {
        return `
            <div class="empty-state">
                <i class="${this.icon}"></i>
                <p>${this.message}</p>
            </div>
        `;
    }
}

// Component for rendering loading spinner
class LoadingSpinner {
    render() {
        return `
            <div class="text-center py-4">
                <div class="loading-spinner"></div>
                <p class="mt-2 text-muted">Loading...</p>
            </div>
        `;
    }
}

// Component for rendering ISO grid
class SoftwareGrid {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.currentView = 'grid';
        this.currentCategory = 'all';
        this.currentSearch = '';
    }

    render(softwareList, viewMode = 'grid') {
        this.currentView = viewMode;
        
        if (!softwareList || softwareList.length === 0) {
            this.container.innerHTML = new EmptyState().render();
            return;
        }

        const cards = softwareList.map(software => {
            const card = new SoftwareCard(software);
            return card.render(viewMode);
        }).join('');

        this.container.innerHTML = cards;
        this.container.className = `row ${viewMode === 'list' ? 'list-view' : ''}`;
    }

    filterByCategory(categorySlug) {
        this.currentCategory = categorySlug;
        // This method is not used anymore since filtering is handled by the main app
        console.log('Category filter requested:', categorySlug);
    }

    search(query) {
        this.currentSearch = query;
        // This method is not used anymore since search is handled by the main app
        console.log('Search requested:', query);
    }

    changeView(viewMode) {
        this.currentView = viewMode;
        // This method is not used anymore since view changes are handled by the main app
        console.log('View change requested:', viewMode);
    }

    getCategoryIdBySlug(slug) {
        const category = window.softwareData.categories.find(c => c.slug === slug);
        return category ? category.id : null;
    }
}

// Component for rendering top downloads sidebar
class TopDownloadsSidebar {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
    }

    async render() {
        try {
            const result = await window.softwareAPI.getTopDownloads(8);
            
            if (!result.success) {
                throw new Error(result.error);
            }
            
            const topDownloads = result.data;
            const items = topDownloads.map(software => {
                const item = new TopDownloadItem(software);
                return item.render();
            }).join('');

            this.container.innerHTML = items;
        } catch (error) {
            console.error('Error loading top downloads:', error);
            this.container.innerHTML = '<div class="text-center py-3"><p class="text-muted">Failed to load top downloads</p></div>';
        }
    }
}

// Component for rendering category filter
class CategoryFilter {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.currentCategory = 'all';
    }

    async render() {
        try {
            const result = await window.softwareAPI.getCategories();
            
            if (!result.success) {
                throw new Error(result.error);
            }
            
            const categories = result.data;
            const buttons = categories.map(category => {
                const isActive = category.slug === this.currentCategory;
                const button = new CategoryButton(category, isActive);
                return button.render();
            }).join('');

            this.container.innerHTML = buttons;
        } catch (error) {
            console.error('Error loading categories:', error);
            this.container.innerHTML = '<div class="text-center py-3"><p class="text-muted">Failed to load categories</p></div>';
        }
    }

    setActiveCategory(categorySlug) {
        this.currentCategory = categorySlug;
        this.render();
    }
}

// Component for rendering sidebar categories
class SidebarCategories {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
    }

    async render() {
        try {
            const result = await window.softwareAPI.getCategories();
            
            if (!result.success) {
                throw new Error(result.error);
            }
            
            const categories = result.data;
            const links = categories.map(category => {
                const link = new SidebarCategoryLink(category);
                return link.render();
            }).join('');

            this.container.innerHTML = `
                <div class="d-grid gap-2">
                    ${links}
                </div>
            `;
        } catch (error) {
            console.error('Error loading sidebar categories:', error);
            this.container.innerHTML = '<div class="text-center py-3"><p class="text-muted">Failed to load categories</p></div>';
        }
    }
}

// Global navigation function
function navigateToSoftwareDetail(softwareId) {
    window.location.href = `software-detail.html?id=${softwareId}`;
}

// Helper functions for compatibility
function getTopDownloads() {
    return window.softwareData?.software?.slice(0, 5) || [];
}

function getLicenseBadgeColor(license) {
    switch (license?.toLowerCase()) {
        case 'free': return 'bg-success';
        case 'paid': return 'bg-warning';
        case 'trial': return 'bg-info';
        case 'open source': return 'bg-primary';
        default: return 'bg-secondary';
    }
}

function getEditionBadgeColor(edition) {
    switch (edition?.toLowerCase()) {
        case 'pro': return 'bg-primary';
        case 'enterprise': return 'bg-danger';
        case 'home': return 'bg-success';
        case 'education': return 'bg-info';
        case 'server': return 'bg-dark';
        case 'ultimate': return 'bg-warning';
        case 'basic': return 'bg-secondary';
        case 'premium': return 'bg-purple';
        case 'starter': return 'bg-light text-dark';
        case 'business': return 'bg-indigo';
        case 'workstation': return 'bg-teal';
        case 'datacenter': return 'bg-orange';
        case 'standard': return 'bg-blue';
        default: return 'bg-secondary';
    }
}

function formatDownloadCount(count) {
    if (count >= 1000000) {
        return (count / 1000000).toFixed(1) + 'M';
    } else if (count >= 1000) {
        return (count / 1000).toFixed(1) + 'K';
    }
    return count.toString();
} 