# Vercel Deployment Guide for CineReads Frontend

## Prerequisites
- Vercel account
- GitHub repository with your code
- Backend deployed to Render (https://cinereads-backend.onrender.com/)

## Steps

### 1. Environment Variables Setup
When deploying to Vercel, add these environment variables in your Vercel dashboard:

```
NEXT_PUBLIC_API_URL=https://cinereads-backend.onrender.com
```

Optional TMDB variables (if you want to customize TMDB integration):
```
NEXT_PUBLIC_TMDB_API_KEY=your_tmdb_api_key_here
NEXT_PUBLIC_TMDB_READ_ACCESS_TOKEN=your_tmdb_read_access_token_here
NEXT_PUBLIC_TMDB_BASE_URL=https://api.themoviedb.org/3
```

### 2. Backend CORS Configuration
Your backend needs to allow your Vercel domain. Update the CORS configuration in your backend's `app/main.py`:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # Next.js dev server
        "http://localhost:3001",  # Alternative dev port
        "https://your-vercel-app.vercel.app",  # Replace with your actual Vercel URL
        "https://cinereads.vercel.app",  # Or your custom domain
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "DELETE"],
    allow_headers=["*"],
)
```

### 3. Deploy to Vercel

#### Option A: Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy from the frontend directory
cd frontend
vercel

# Follow the prompts
# Make sure to set the build command to: npm run build
# And the output directory to: .next
```

#### Option B: Vercel Dashboard
1. Go to vercel.com and sign in
2. Click "Import Project"
3. Import your GitHub repository
4. Set the framework preset to "Next.js"
5. Set the root directory to `frontend`
6. Add the environment variables mentioned above
7. Deploy

### 4. Update Backend CORS After Deployment
Once you have your Vercel URL, update your backend's CORS configuration to include your specific domain.

### 5. Test the Deployment
- Visit your Vercel URL
- Try adding some movies and getting recommendations
- Check the Network tab in browser dev tools to ensure API calls are working

## Troubleshooting

### Common Issues:

1. **CORS Errors**: Make sure your backend allows your Vercel domain
2. **API Not Found**: Ensure `NEXT_PUBLIC_API_URL` is set correctly
3. **Build Failures**: Check that all TypeScript errors are resolved

### Logs and Debugging:
- Check Vercel function logs in the Vercel dashboard
- Check Render logs for your backend
- Use browser developer tools to inspect network requests
