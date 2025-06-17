// Windows ISO Detail Page JavaScript

// Global variable to store the detail page instance
window.softwareDetailPage = null;

class SoftwareDetailPage {
    constructor() {
        this.softwareId = this.getSoftwareIdFromUrl();
        this.software = null;
        this.api = window.softwareAPI;
        this.init();
    }

    async init() {
        try {
            await this.loadSoftwareData();
        } catch (error) {
            console.error('Error initializing detail page:', error);
            this.showError('Failed to load Windows ISO data');
        }
    }

    getSoftwareIdFromUrl() {
        // Get software ID from URL parameter
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('id') || '1'; // Default to ID 1 if not provided
    }

    async loadSoftwareData() {
        try {
            console.log('Loading Windows ISO data for ID:', this.softwareId);
            
            const result = await this.api.getSoftwareById(this.softwareId);
            
            if (!result.success) {
                throw new Error(result.error);
            }
            
            this.software = result.data;
            
            if (!this.software) {
                throw new Error('Windows ISO not found');
            }

            console.log('Windows ISO loaded:', this.software);
            this.renderSoftwareDetail();
        } catch (error) {
            console.error('Error loading Windows ISO data:', error);
            this.showError('Failed to load Windows ISO data');
        }
    }

    renderSoftwareDetail() {
        // Update page title
        document.title = `${this.software.name || 'Windows ISO'} - Windows ISO Download`;

        // Update breadcrumbs
        const category = this.software.categories || { name: '-' };
        if (document.getElementById('categoryBreadcrumb')) document.getElementById('categoryBreadcrumb').textContent = category.name;
        if (document.getElementById('softwareBreadcrumb')) document.getElementById('softwareBreadcrumb').textContent = this.software.name || '-';

        // Update main image
        if (document.getElementById('softwareMainImage')) {
            document.getElementById('softwareMainImage').src = this.software.main_image_url || 'assets/images/default-software.jpg';
            document.getElementById('softwareMainImage').alt = this.software.name || '';
        }

        // Update software info
        if (document.getElementById('softwareTitle')) document.getElementById('softwareTitle').textContent = this.software.name || '-';
        if (document.getElementById('softwareDescription')) document.getElementById('softwareDescription').textContent = this.software.description || '-';

        // Update badges
        if (document.getElementById('licenseBadge')) {
            document.getElementById('licenseBadge').textContent = (this.software.license_type || 'FREE').toUpperCase();
            document.getElementById('licenseBadge').className = `badge ${getLicenseBadgeColor(this.software.license_type || 'FREE')}`;
        }
        if (document.getElementById('versionBadge')) document.getElementById('versionBadge').textContent = `v${this.software.version || 'N/A'}`;

        // Update quick stats
        if (document.getElementById('downloadCount')) document.getElementById('downloadCount').textContent = formatDownloadCount(this.software.download_count || 0);
        if (document.getElementById('fileSize')) document.getElementById('fileSize').textContent = this.software.file_size || 'N/A';

        // Update sidebar info
        if (document.getElementById('infoVersion')) document.getElementById('infoVersion').textContent = this.software.version || 'N/A';
        if (document.getElementById('infoLicense')) document.getElementById('infoLicense').textContent = this.software.license_type || 'FREE';
        if (document.getElementById('infoCategory')) document.getElementById('infoCategory').textContent = category.name;
        if (document.getElementById('infoFileSize')) document.getElementById('infoFileSize').textContent = this.software.file_size || 'N/A';
        if (document.getElementById('infoUploaded')) document.getElementById('infoUploaded').textContent = this.formatDate(this.software.created_at);
        if (document.getElementById('infoDeveloper')) document.getElementById('infoDeveloper').textContent = this.getDeveloperName(this.software.name);

        // Update download stats
        if (document.getElementById('totalDownloads')) document.getElementById('totalDownloads').textContent = formatDownloadCount(this.software.download_count || 0);
        if (document.getElementById('weeklyDownloads')) document.getElementById('weeklyDownloads').textContent = formatDownloadCount(Math.floor((this.software.download_count || 0) * 0.012));
        if (document.getElementById('monthlyDownloads')) document.getElementById('monthlyDownloads').textContent = formatDownloadCount(Math.floor((this.software.download_count || 0) * 0.072));

        // Render installation
        this.renderInstallation();

        // Render screenshots
        this.renderScreenshots();

        // Load related software
        this.loadRelatedSoftware();
    }

    renderInstallation() {
        const installationGuide = document.getElementById('installationGuide');
        if (!installationGuide) {
            console.error('Installation guide element not found');
            return;
        }
        
        const installation = this.software.installation_guide || this.getDefaultInstallationGuide();
        installationGuide.innerHTML = installation;
        console.log('Installation guide rendered');
    }

    renderScreenshots() {
        const screenshotsContent = document.getElementById('screenshotsContent');
        if (!screenshotsContent) {
            console.error('Screenshots content element not found');
            return;
        }
        
        const screenshots = this.software.screenshot_urls || [];
        
        if (screenshots.length === 0) {
            screenshotsContent.innerHTML = `
                <div class="no-screenshots">
                    <i class="fas fa-images"></i>
                    <h5>No Screenshots Available</h5>
                    <p>This Windows ISO doesn't have any screenshots yet.</p>
                </div>
            `;
            return;
        }
        
        let html = '<div class="screenshots-gallery">';
        screenshots.forEach((screenshot, index) => {
            const title = screenshot.title || `Screenshot ${index + 1}`;
            const description = screenshot.description || `Windows ISO screenshot ${index + 1}`;
            const url = screenshot.url || screenshot;
            
            html += `
                <div class="screenshot-item" onclick="openScreenshotModal('${url}', '${title}')">
                    <img src="${url}" alt="${title}" class="screenshot-image" loading="lazy">
                    <div class="screenshot-caption">
                        <div class="screenshot-title">${title}</div>
                        <div class="screenshot-description">${description}</div>
                    </div>
                </div>
            `;
        });
        html += '</div>';
        
        screenshotsContent.innerHTML = html;
        console.log(`Screenshots rendered: ${screenshots.length} images`);
    }

    getDefaultInstallationGuide() {
        return `
            <div class="installation-steps">
                <div class="step-item">
                    <div class="step-number">1</div>
                    <div class="step-content">
                        <h6>Download the Windows ISO</h6>
                        <p>Click the "Download Now" button above and choose your preferred download provider from the popup.</p>
                    </div>
                </div>
                <div class="step-item">
                    <div class="step-number">2</div>
                    <div class="step-content">
                        <h6>Extract the Files</h6>
                        <p>If the download is a compressed file (.zip, .rar), extract it to a folder of your choice.</p>
                    </div>
                </div>
                <div class="step-item">
                    <div class="step-number">3</div>
                    <div class="step-content">
                        <h6>Create Bootable USB</h6>
                        <p>Use tools like Rufus or Windows Media Creation Tool to create a bootable USB drive from the ISO file.</p>
                    </div>
                </div>
                <div class="step-item">
                    <div class="step-number">4</div>
                    <div class="step-content">
                        <h6>Install Windows</h6>
                        <p>Boot from the USB drive and follow the Windows installation wizard to complete the setup.</p>
                    </div>
                </div>
            </div>
            <div class="installation-notes mt-4">
                <div class="alert alert-info">
                    <h6><i class="fas fa-info-circle me-2"></i>Installation Notes:</h6>
                    <ul class="mb-0">
                        <li>Make sure to backup your important data before installation</li>
                        <li>Ensure your computer meets the minimum system requirements</li>
                        <li>Keep your antivirus software updated to avoid false positives</li>
                    </ul>
                </div>
            </div>
        `;
    }

    async loadRelatedSoftware() {
        const relatedContainer = document.getElementById('relatedSoftware');
        if (!relatedContainer) {
            console.error('Related software container not found');
            return;
        }
        
        if (!this.software || !this.software.category_id) {
            relatedContainer.innerHTML = `<div class="text-center py-3"><p class="text-muted">No related Windows ISO found</p></div>`;
            return;
        }
        
        try {
            const categorySlug = this.software.categories?.slug || 'windows';
            const result = await this.api.getSoftwareByCategory(categorySlug);
            
            if (!result.success) {
                throw new Error(result.error);
            }
            
            const related = result.data
                .filter(s => s.id != this.software.id)
                .slice(0, 5);
                
            if (related.length === 0) {
                relatedContainer.innerHTML = `<div class="text-center py-3"><p class="text-muted">No related Windows ISO found</p></div>`;
                return;
            }
            
            let html = '';
            related.forEach(software => {
                html += `
                    <div class="related-software-item" onclick="navigateToSoftware(${software.id})">
                        <img src="${software.main_image_url || ''}" alt="${software.name || ''}" class="related-software-image">
                        <div class="related-software-info">
                            <h6>${software.name || '-'}</h6>
                            <p>${(software.description || '').substring(0, 50)}...</p>
                        </div>
                    </div>
                `;
            });
            
            relatedContainer.innerHTML = html;
            console.log('Related software loaded:', related.length, 'items');
        } catch (error) {
            console.error('Error loading related software:', error);
            relatedContainer.innerHTML = `<div class="text-center py-3"><p class="text-muted">Failed to load related software</p></div>`;
        }
    }

    formatDate(dateString) {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    getDeveloperName(softwareName) {
        const developers = {
            'Visual Studio Code': 'Microsoft',
            'Steam Gaming Platform': 'Valve Corporation',
            'Adobe Photoshop Trial': 'Adobe Inc.',
            'Windows 11 ISO': 'Microsoft',
            'Discord': 'Discord Inc.',
            'OBS Studio': 'OBS Project',
            'Google Chrome': 'Google LLC',
            'Sublime Text': 'Sublime HQ',
            'Blender': 'Blender Foundation',
            'Unity': 'Unity Technologies',
            'Spotify': 'Spotify AB',
            'Atom Editor': 'GitHub',
            'Epic Games': 'Epic Games',
            'GIMP': 'GIMP Team'
        };
        
        return developers[softwareName] || 'Unknown Developer';
    }

    showError(message) {
        document.body.innerHTML = `
            <div class="container mt-5">
                <div class="row justify-content-center">
                    <div class="col-md-6 text-center">
                        <i class="fas fa-exclamation-triangle fa-3x text-warning mb-3"></i>
                        <h3>Error</h3>
                        <p class="text-muted">${message}</p>
                        <a href="index.html" class="btn btn-primary">Back to Home</a>
                    </div>
                </div>
            </div>
        `;
    }
}

// Global functions
function openDownloadModal() {
    console.log('Opening download modal...');
    
    const software = window.softwareDetailPage?.software;
    if (!software) {
        console.error('Software not found');
        alert('Software not found');
        return;
    }
    
    if (!software.download_links || Object.keys(software.download_links).length === 0) {
        console.error('No download links available');
        alert('No download links available for this software.');
        return;
    }
    
    console.log('Software for modal:', software);
    console.log('Download links:', software.download_links);
    
    // Update modal content
    if (document.getElementById('modalSoftwareImage')) document.getElementById('modalSoftwareImage').src = software.main_image_url || '';
    if (document.getElementById('modalSoftwareName')) document.getElementById('modalSoftwareName').textContent = software.name || '-';
    if (document.getElementById('modalSoftwareVersion')) document.getElementById('modalSoftwareVersion').textContent = `Version ${software.version || '-'}`;
    if (document.getElementById('modalLicenseBadge')) document.getElementById('modalLicenseBadge').textContent = (software.license_type || '').toUpperCase();
    if (document.getElementById('modalFileSize')) document.getElementById('modalFileSize').textContent = software.file_size || '-';
    
    // Render download providers
    renderDownloadProviders(software);
    
    // Show modal
    const modalElement = document.getElementById('downloadModal');
    if (!modalElement) {
        console.error('Download modal element not found');
        return;
    }
    
    const modal = new bootstrap.Modal(modalElement);
    modal.show();
    console.log('Modal should be visible now');
}

function openScreenshotModal(imageUrl, title) {
    console.log('Opening screenshot modal:', imageUrl, title);
    
    // Update modal content
    const modalImage = document.getElementById('screenshotModalImage');
    const modalTitle = document.getElementById('screenshotModalLabel');
    
    if (modalImage) {
        modalImage.src = imageUrl;
        modalImage.alt = title;
    }
    
    if (modalTitle) {
        modalTitle.innerHTML = `<i class="fas fa-image me-2"></i>${title}`;
    }
    
    // Show modal
    const modalElement = document.getElementById('screenshotModal');
    if (!modalElement) {
        console.error('Screenshot modal element not found');
        return;
    }
    
    const modal = new bootstrap.Modal(modalElement);
    modal.show();
    console.log('Screenshot modal should be visible now');
}

function renderDownloadProviders(software) {
    const providersContainer = document.getElementById('downloadProviders');
    if (!providersContainer) {
        console.error('Download providers container not found');
        return;
    }
    
    const downloadLinks = software.download_links || {};
    if (Object.keys(downloadLinks).length === 0) {
        providersContainer.innerHTML = `<div class="text-center py-3"><p class="text-muted">No download links available</p></div>`;
        return;
    }
    
    let html = '';
    Object.entries(downloadLinks).forEach(([source, url]) => {
        const sourceInfo = getSourceInfo(source);
        html += `
            <div class="download-provider-list-item" onclick="handleProviderDownload('${source}', '${url}', '${software.name}')">
                <div class="download-provider-list-content">
                    <div class="download-provider-list-icon ${sourceInfo.class}">
                        <i class="${sourceInfo.icon}"></i>
                    </div>
                    <div class="download-provider-list-info">
                        <h6 class="download-provider-list-name">${sourceInfo.name}</h6>
                        <p class="download-provider-list-description">${sourceInfo.description}</p>
                    </div>
                    <div class="download-provider-list-action">
                        <button class="btn btn-primary btn-sm download-provider-list-button ${sourceInfo.class}">
                            <i class="fas fa-download me-1"></i>Download
                        </button>
                    </div>
                </div>
            </div>
        `;
    });
    
    providersContainer.innerHTML = html;
    console.log('Download providers rendered:', Object.keys(downloadLinks).length, 'providers');
}

function getSourceInfo(source) {
    const sources = {
        'mediafire': {
            name: 'MediaFire',
            icon: 'fas fa-cloud-download-alt',
            class: 'mediafire',
            description: 'Fast & reliable hosting'
        },
        'googledrive': {
            name: 'Google Drive',
            icon: 'fab fa-google-drive',
            class: 'googledrive',
            description: 'Google cloud storage'
        },
        'dropbox': {
            name: 'Dropbox',
            icon: 'fab fa-dropbox',
            class: 'dropbox',
            description: 'Secure file sharing'
        },
        'mega': {
            name: 'MEGA',
            icon: 'fas fa-shield-alt',
            class: 'mega',
            description: 'Encrypted storage'
        },
        'github': {
            name: 'GitHub',
            icon: 'fab fa-github',
            class: 'github',
            description: 'Open source repository'
        },
        'official': {
            name: 'Official',
            icon: 'fas fa-globe',
            class: 'official',
            description: 'Direct from developer'
        },
        'steam': {
            name: 'Steam',
            icon: 'fab fa-steam',
            class: 'steam',
            description: 'Steam platform'
        },
        'adobe': {
            name: 'Adobe',
            icon: 'fas fa-palette',
            class: 'adobe',
            description: 'Adobe Creative Cloud'
        },
        'microsoft': {
            name: 'Microsoft',
            icon: 'fab fa-microsoft',
            class: 'microsoft',
            description: 'Microsoft official'
        }
    };
    
    return sources[source] || {
        name: source.charAt(0).toUpperCase() + source.slice(1),
        icon: 'fas fa-download',
        class: 'official',
        description: 'External download'
    };
}

async function handleProviderDownload(source, url, softwareName) {
    // Close modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('downloadModal'));
    modal.hide();
    
    // Show download notification
    const notification = document.createElement('div');
    notification.className = 'alert alert-info alert-dismissible fade show position-fixed';
    notification.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
    notification.innerHTML = `
        <i class="fas fa-download me-2"></i>Starting download for ${softwareName} from ${getSourceInfo(source).name}...
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(notification);
    
    // Track download in Supabase
    try {
        const software = window.softwareDetailPage?.software;
        if (software && window.softwareAPI) {
            await window.softwareAPI.trackDownload(software.id, source);
            console.log(`Download tracked: ${softwareName} from ${source}`);
        }
    } catch (error) {
        console.error('Error tracking download:', error);
        // Continue with download even if tracking fails
    }
    
    // Open external link after a short delay
    setTimeout(() => {
        window.open(url, '_blank');
        
        // Update notification
        notification.className = 'alert alert-success alert-dismissible fade show position-fixed';
        notification.innerHTML = `
            <i class="fas fa-check me-2"></i>${softwareName} download completed!
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 3000);
    }, 1000);
}

function handleExternalDownload(source, url, softwareName) {
    // Show download notification
    const notification = document.createElement('div');
    notification.className = 'alert alert-info alert-dismissible fade show position-fixed';
    notification.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
    notification.innerHTML = `
        <i class="fas fa-download me-2"></i>Starting download for ${softwareName} from ${getSourceInfo(source).name}...
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(notification);
    
    // Track download (in real app, this would be an API call)
    console.log(`Download tracked: ${softwareName} from ${source}`);
    
    // Open external link after a short delay
    setTimeout(() => {
        window.open(url, '_blank');
        
        // Update notification
        notification.className = 'alert alert-success alert-dismissible fade show position-fixed';
        notification.innerHTML = `
            <i class="fas fa-check me-2"></i>${softwareName} download completed!
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 3000);
    }, 1000);
}

function navigateToSoftware(softwareId) {
    console.log('Navigating to software:', softwareId);
    window.location.href = `software-detail.html?id=${softwareId}`;
}

// Donate functions for detail page
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
    const paypalUrl = 'https://www.paypal.com/donate/?hosted_button_id=YOUR_BUTTON_ID';
    window.open(paypalUrl, '_blank');
    trackDonationEvent('paypal');
}

function donateCrypto() {
    console.log('Opening crypto donation...');
    const cryptoInfo = `
Bitcoin (BTC): bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh
Ethereum (ETH): 0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6
Litecoin (LTC): ltc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh
    `;
    
    navigator.clipboard.writeText(cryptoInfo.trim()).then(() => {
        alert('Crypto addresses copied to clipboard!\n\n' + cryptoInfo);
    }).catch(() => {
        alert('Crypto donation addresses:\n\n' + cryptoInfo);
    });
    
    trackDonationEvent('crypto');
}

function donateBank() {
    console.log('Opening bank transfer info...');
    const bankInfo = `
Bank: Your Bank Name
Account Name: Your Name
Account Number: 1234567890
IBAN: XX00 0000 0000 0000 0000 0000
SWIFT/BIC: BANKXXXX
    `;
    
    navigator.clipboard.writeText(bankInfo.trim()).then(() => {
        alert('Bank transfer details copied to clipboard!\n\n' + bankInfo);
    }).catch(() => {
        alert('Bank transfer details:\n\n' + bankInfo);
    });
    
    trackDonationEvent('bank');
}

function donateCoffee() {
    console.log('Opening Buy Me a Coffee...');
    const coffeeUrl = 'https://www.buymeacoffee.com/yourusername';
    window.open(coffeeUrl, '_blank');
    trackDonationEvent('coffee');
}

function trackDonationEvent(method) {
    console.log(`Donation event tracked: ${method}`);
    
    if (typeof gtag !== 'undefined') {
        gtag('event', 'donation_click', {
            'donation_method': method,
            'event_category': 'engagement',
            'event_label': 'donate_modal'
        });
    }
    
    const modal = bootstrap.Modal.getInstance(document.getElementById('donateModal'));
    if (modal) {
        modal.hide();
    }
}

// Initialize the page when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing detail page...');
    
    // Check if all required dependencies are available
    if (typeof window.softwareAPI === 'undefined') {
        console.error('Software API not available');
        return;
    }
    
    if (typeof bootstrap === 'undefined') {
        console.error('Bootstrap not available');
        return;
    }
    
    // Initialize the detail page
    window.softwareDetailPage = new SoftwareDetailPage();
    console.log('Detail page initialized');
}); 