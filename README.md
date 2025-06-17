# Windows ISO Download Portal

A modern web portal for downloading Windows ISO files with real-time analytics and cloud-based data management.

## 🚀 Features

- **Windows ISO Downloads** - Complete collection from Windows 11 to Windows 3.x
- **Real-time Analytics** - Track download counts and user behavior
- **Cloud Database** - Powered by Supabase for scalability
- **Responsive Design** - Works on desktop, tablet, and mobile
- **Search & Filter** - Find Windows versions by category or search
- **Download Tracking** - Analytics for each download source
- **Modern UI** - Clean, dark-themed interface

## 🏗️ Architecture

### Frontend
- **HTML5** - Semantic markup
- **CSS3** - Modern styling with Bootstrap 5
- **JavaScript** - Vanilla JS with ES6+ features
- **Supabase Client** - Direct database access

### Backend (Cloud)
- **Supabase** - PostgreSQL database with real-time features
- **Row Level Security** - Secure read-only access
- **Auto-generated APIs** - No custom backend needed

## 📁 Project Structure

```
SoftwarePortal/
├── index.html                 # Main homepage
├── software-detail.html       # Software detail page
├── assets/
│   ├── css/
│   │   ├── style.css         # Main styles
│   │   ├── components.css    # Component styles
│   │   ├── responsive.css    # Responsive design
│   │   └── detail.css        # Detail page styles
│   └── js/
│       ├── supabase-client.js # Supabase configuration
│       ├── api.js            # API service layer
│       ├── components.js     # UI components
│       ├── app.js           # Main application logic
│       └── detail.js        # Detail page logic
└── README.md
```

## 🗄️ Database Schema

### Tables
- **categories** - Windows categories (Windows 11, 10, 7, etc.)
- **software** - Windows ISO metadata and download links
- **download_analytics** - Download tracking (private)
- **daily_stats** - Daily statistics (private)

### Security
- **Public Read Access** - Categories and approved software
- **Controlled Write Access** - Download tracking only
- **No Admin Access** - Admin panel separate

## 🚀 Setup Instructions

### 1. Supabase Setup
1. Create Supabase project at [supabase.com](https://supabase.com)
2. Run the SQL setup script (provided separately)
3. Get your project URL and anon key

### 2. Frontend Configuration
1. Edit `assets/js/supabase-client.js`
2. Replace with your Supabase credentials:
```javascript
const supabaseUrl = 'YOUR_SUPABASE_URL'
const supabaseKey = 'YOUR_SUPABASE_ANON_KEY'
```

### 3. Deploy
1. **GitHub Pages**: Push to GitHub and enable Pages
2. **Netlify**: Drag and drop the folder
3. **Vercel**: Connect your GitHub repository

## 📊 Analytics Features

- **Download Tracking** - Track each download by source
- **Real-time Counters** - Live download count updates
- **User Analytics** - Browser, location, device info
- **Daily Statistics** - Performance optimization

## 🔒 Security

- **Row Level Security** - Database-level access control
- **Read-only Public Access** - No sensitive data exposure
- **Controlled Updates** - Only download tracking allowed
- **No Admin Functions** - Admin panel deployed separately

## 🎨 UI Components

- **Software Cards** - Grid and list views
- **Category Filters** - Dynamic filtering
- **Search Box** - Real-time search
- **Download Modal** - Multiple download sources
- **Loading States** - User feedback
- **Error Handling** - Graceful error display

## 📱 Responsive Design

- **Desktop** - 7-column grid layout
- **Tablet** - 4-column grid
- **Mobile** - 2-column grid
- **Touch-friendly** - Optimized for mobile

## 🔧 Development

### Local Development
```bash
# Start local server
python -m http.server 8000
# or
npx serve .
```

### File Structure
- **No build process** - Pure HTML/CSS/JS
- **No dependencies** - Only CDN libraries
- **Easy deployment** - Static files only

## 📈 Performance

- **CDN Libraries** - Fast loading
- **Optimized Images** - Placeholder images
- **Lazy Loading** - Efficient data loading
- **Caching** - Browser caching enabled

## 🎯 Future Enhancements

- **Admin Panel** - Separate management interface
- **User Accounts** - Personal download history
- **Comments & Ratings** - User feedback system
- **Advanced Analytics** - Detailed reporting
- **API Documentation** - Developer resources

## 📄 License

This project is for educational and demonstration purposes.

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Make changes
4. Test thoroughly
5. Submit pull request

## 📞 Support

For issues or questions:
1. Check the console for errors
2. Verify Supabase credentials
3. Ensure database is properly set up
4. Check network connectivity

---

**Built with ❤️ for Windows enthusiasts** 