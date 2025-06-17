// Windows ISO API Service for Supabase
class SoftwareAPI {
    constructor() {
        this.supabase = null;
        this.initializeClient();
    }

    async initializeClient() {
        // Wait for Supabase client to be ready
        const maxAttempts = 10;
        let attempts = 0;
        
        while (attempts < maxAttempts) {
            if (window.supabaseClient?.isReady()) {
                this.supabase = window.supabaseClient.getClient();
                console.log('✓ API initialized with Supabase client');
                return;
            }
            
            await new Promise(resolve => setTimeout(resolve, 500));
            attempts++;
        }
        
        console.error('✗ Failed to initialize API - Supabase client not ready');
    }

    async ensureClient() {
        if (!this.supabase) {
            await this.initializeClient();
        }
        return !!this.supabase;
    }

    async getAllSoftware() {
        try {
            if (!await this.ensureClient()) {
                return { success: false, error: 'Supabase client not ready' };
            }

            console.log('Fetching all Windows ISO...');
            const { data, error } = await this.supabase
                .from('software')
                .select(`
                    *,
                    categories(name, slug, icon)
                `)
                .eq('is_approved', true)
                .order('download_count', { ascending: false });

            if (error) throw error;
            
            console.log(`Fetched ${data.length} Windows ISO items`);
            return { success: true, data: data };
        } catch (error) {
            console.error('Error fetching Windows ISO:', error);
            return { success: false, error: error.message };
        }
    }

    async getSoftwareByCategory(categorySlug) {
        try {
            if (!await this.ensureClient()) {
                return { success: false, error: 'Supabase client not ready' };
            }

            console.log(`Fetching Windows ISO for category: ${categorySlug}`);
            
            if (categorySlug === 'all') {
                return await this.getAllSoftware();
            }

            const { data, error } = await this.supabase
                .from('software')
                .select(`
                    *,
                    categories(name, slug, icon)
                `)
                .eq('category_id', (await this.getCategoryIdBySlug(categorySlug)))
                .eq('is_approved', true)
                .order('download_count', { ascending: false });

            if (error) throw error;
            
            console.log(`Fetched ${data.length} Windows ISO items for category ${categorySlug}`);
            return { success: true, data: data };
        } catch (error) {
            console.error('Error fetching Windows ISO by category:', error);
            return { success: false, error: error.message };
        }
    }

    async getCategoryIdBySlug(slug) {
        try {
            if (!await this.ensureClient()) {
                return null;
            }

            const { data, error } = await this.supabase
                .from('categories')
                .select('id')
                .eq('slug', slug)
                .single();

            if (error) throw error;
            return data.id;
        } catch (error) {
            console.error('Error getting category ID:', error);
            return null;
        }
    }

    async searchSoftware(query) {
        try {
            if (!await this.ensureClient()) {
                return { success: false, error: 'Supabase client not ready' };
            }

            console.log(`Searching for Windows ISO: ${query}`);
            const { data, error } = await this.supabase
                .from('software')
                .select(`
                    *,
                    categories(name, slug, icon)
                `)
                .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
                .eq('is_approved', true)
                .order('download_count', { ascending: false });

            if (error) throw error;
            
            console.log(`Found ${data.length} Windows ISO results for search: ${query}`);
            return { success: true, data: data };
        } catch (error) {
            console.error('Error searching Windows ISO:', error);
            return { success: false, error: error.message };
        }
    }

    async getTopDownloads(limit = 8) {
        try {
            if (!await this.ensureClient()) {
                return { success: false, error: 'Supabase client not ready' };
            }

            console.log(`Fetching top ${limit} downloads...`);
            const { data, error } = await this.supabase
                .from('software')
                .select(`
                    *,
                    categories(name, slug, icon)
                `)
                .eq('is_approved', true)
                .order('download_count', { ascending: false })
                .limit(limit);

            if (error) throw error;
            
            console.log(`Fetched ${data.length} top downloads`);
            return { success: true, data: data };
        } catch (error) {
            console.error('Error fetching top downloads:', error);
            return { success: false, error: error.message };
        }
    }

    async getCategories() {
        try {
            if (!await this.ensureClient()) {
                return { success: false, error: 'Supabase client not ready' };
            }

            console.log('Fetching categories...');
            const { data, error } = await this.supabase
                .from('categories')
                .select('*')
                .order('name');

            if (error) throw error;
            
            console.log(`Fetched ${data.length} categories`);
            return { success: true, data: data };
        } catch (error) {
            console.error('Error fetching categories:', error);
            return { success: false, error: error.message };
        }
    }

    async getSoftwareById(id) {
        try {
            if (!await this.ensureClient()) {
                return { success: false, error: 'Supabase client not ready' };
            }

            console.log(`Fetching Windows ISO with ID: ${id}`);
            const { data, error } = await this.supabase
                .from('software')
                .select(`
                    *,
                    categories(name, slug, icon)
                `)
                .eq('id', id)
                .eq('is_approved', true)
                .single();

            if (error) throw error;
            
            console.log(`Fetched Windows ISO: ${data.name}`);
            return { success: true, data: data };
        } catch (error) {
            console.error('Error fetching Windows ISO by ID:', error);
            return { success: false, error: error.message };
        }
    }

    async trackDownload(softwareId, source) {
        try {
            if (!await this.ensureClient()) {
                return { success: false, error: 'Supabase client not ready' };
            }

            console.log(`Tracking download for Windows ISO ${softwareId} from ${source}`);
            
            // Increment download count using the function from your setup
            const { error: updateError } = await this.supabase
                .rpc('increment_download_count', { software_id_param: softwareId });

            if (updateError) throw updateError;

            // Log download analytics
            const { error: logError } = await this.supabase
                .from('download_analytics')
                .insert({
                    software_id: softwareId,
                    source: source,
                    user_agent: navigator.userAgent
                });

            if (logError) {
                console.warn('Failed to log analytics:', logError);
                // Don't throw error for analytics logging failure
            }

            // Update daily stats
            const { error: statsError } = await this.supabase
                .rpc('update_daily_stats', { software_id_param: softwareId });

            if (statsError) {
                console.warn('Failed to update daily stats:', statsError);
                // Don't throw error for stats update failure
            }

            console.log('Windows ISO download tracked successfully');
            return { success: true };
        } catch (error) {
            console.error('Error tracking Windows ISO download:', error);
            return { success: false, error: error.message };
        }
    }

    // Fallback method to get data from local file if Supabase fails
    async getFallbackData() {
        try {
            console.log('Using fallback data...');
            // Return empty data since we no longer have local data.js
            return { 
                success: true, 
                data: [],
                categories: [],
                isFallback: true 
            };
        } catch (error) {
            console.error('Error getting fallback data:', error);
            return { success: false, error: error.message };
        }
    }
}

// Global API instance
window.softwareAPI = new SoftwareAPI(); 