// Supabase Client Configuration
const SUPABASE_URL = 'https://sexvddsgvbrlifpugmtr.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNleHZkZHNndmJybGlmcHVnbXRyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAwOTkxMDcsImV4cCI6MjA2NTY3NTEwN30.zDZEuJbuWIllkuFBJRGoiNGJCBtiGFC8WDHAs6AY86A';

// Initialize Supabase client
let supabase;

// Function to initialize Supabase with fallback CDNs
async function initializeSupabase() {
    const cdnSources = [
        'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2', // JSDelivr - working
        'https://unpkg.com/@supabase/supabase-js@2', // Unpkg - backup
        'https://cdn.skypack.dev/@supabase/supabase-js' // Skypack - backup
    ];

    for (const cdnUrl of cdnSources) {
        try {
            // Load script dynamically
            await loadScript(cdnUrl);
            
            // Check if supabase is available
            if (typeof window.supabase !== 'undefined') {
                supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
                console.log('✓ Supabase initialized successfully from:', cdnUrl);
                return true;
            }
        } catch (error) {
            console.warn(`Failed to load from ${cdnUrl}:`, error);
            continue;
        }
    }
    
    console.error('✗ All CDN sources failed to load Supabase');
    return false;
}

// Helper function to load script
function loadScript(src) {
    return new Promise((resolve, reject) => {
        // Check if already loaded
        if (document.querySelector(`script[src="${src}"]`)) {
            resolve();
            return;
        }

        const script = document.createElement('script');
        script.src = src;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', async () => {
    const success = await initializeSupabase();
    if (success) {
        // Trigger any initialization that depends on Supabase
        if (window.onSupabaseReady) {
            window.onSupabaseReady();
        }
    }
});

// Export for use in other scripts
window.supabaseClient = {
    getClient: () => supabase,
    isReady: () => !!supabase
}; 