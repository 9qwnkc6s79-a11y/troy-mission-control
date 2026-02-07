# GitHub & Vercel Deployment Guide

## 📦 Package for GitHub Repository

### 1. Repository Structure
```
troy-mission-control/
├── index.html                  # Main dashboard
├── activity/
│   ├── viewer.html            # Activity feed dashboard  
│   ├── logger.js              # Logging system
│   └── README.md              # Documentation
├── calendar/
│   ├── viewer.html            # Calendar interface
│   ├── api.js                 # Calendar data API
│   └── README.md              # Documentation  
├── search/
│   ├── viewer.html            # Search interface
│   ├── indexer.js             # Search indexer
│   ├── api.js                 # Search API
│   └── README.md              # Documentation
├── package.json               # Node.js dependencies
├── vercel.json               # Vercel configuration
└── README.md                 # Repository documentation
```

### 2. Create GitHub Repository

```bash
# Initialize repository
git init
git add .
git commit -m "Initial commit: Troy Mission Control System"

# Create GitHub repository (replace with your username)
gh repo create troy-mission-control --public --description "Complete operational visibility and control system for AI agents"

# Push to GitHub
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/troy-mission-control.git
git push -u origin main
```

### 3. Vercel Configuration

Create `vercel.json`:
```json
{
  "version": 2,
  "builds": [
    {
      "src": "index.html",
      "use": "@vercel/static"
    }
  ],
  "routes": [
    { "src": "/(.*)", "dest": "/$1" }
  ],
  "functions": {
    "search/api.js": {
      "runtime": "nodejs18.x"
    },
    "calendar/api.js": {
      "runtime": "nodejs18.x"
    }
  }
}
```

Create `package.json`:
```json
{
  "name": "troy-mission-control",
  "version": "1.0.0",
  "description": "Complete operational visibility and control system",
  "main": "index.html",
  "scripts": {
    "build": "echo 'Build complete'",
    "start": "serve -l 3000",
    "dev": "serve -l 3000"
  },
  "keywords": ["ai", "monitoring", "dashboard", "activity-tracking"],
  "author": "Daniel Keene",
  "license": "MIT",
  "devDependencies": {
    "serve": "^14.0.0"
  }
}
```

## 🚀 Deploy to Vercel

### Option 1: Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Follow prompts to link to GitHub repo
```

### Option 2: GitHub Integration
1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub
3. Import your `troy-mission-control` repository
4. Configure build settings:
   - Framework: Static
   - Build Command: (leave empty)
   - Output Directory: `./`
5. Deploy!

## 🔧 Deployment Considerations

### Data Persistence
Since this deploys as static files, consider:

1. **Search Index**: Pre-build search index and include in repository
2. **Activity Logs**: Use external storage (Firebase, Supabase) for persistence
3. **Calendar Data**: Connect to external calendar APIs

### Security
- Remove sensitive data from public repository
- Use environment variables for API keys
- Implement authentication if needed

### Performance
- Optimize search index size
- Enable Vercel's compression
- Use CDN for assets

## 📋 Pre-deployment Checklist

- [ ] Remove sensitive files (credentials, private data)
- [ ] Test all components work as static files
- [ ] Update file paths for web deployment
- [ ] Create production search index
- [ ] Test mobile responsiveness
- [ ] Update README with live demo link

## 🔗 Live Demo URL

Once deployed, your mission control will be available at:
`https://your-repo-name.vercel.app`

## 🛠 Development Workflow

```bash
# Local development
npm run dev

# Build for production
npm run build

# Deploy to Vercel
vercel --prod
```

## 📈 Analytics & Monitoring

Add to `index.html` for usage tracking:
```html
<!-- Vercel Analytics -->
<script>
  window.va = window.va || function () { (window.vaq = window.vaq || []).push(arguments); };
</script>
<script defer src="/_vercel/insights/script.js"></script>
```

Your mission control system will be fully operational and accessible from anywhere! 🚀