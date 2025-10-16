# Environment Variables Setup

This document explains how to set up environment variables for the CineReads frontend application.

## Quick Setup

1. Copy the example environment file:
   ```bash
   cp .env.example .env.local
   ```

2. Edit `.env.local` and replace the placeholder values with your actual API keys:
   ```bash
   # Open the file in your preferred editor
   nano .env.local
   # or
   code .env.local
   ```

## Required Environment Variables

### TMDB (The Movie Database) API

- **NEXT_PUBLIC_TMDB_API_KEY**: Your TMDB API key
- **NEXT_PUBLIC_TMDB_READ_ACCESS_TOKEN**: Your TMDB read access token
- **NEXT_PUBLIC_TMDB_BASE_URL**: TMDB API base URL (defaults to https://api.themoviedb.org/3)

### Getting TMDB API Keys

1. Go to [TMDB](https://www.themoviedb.org/)
2. Create an account or log in
3. Go to Settings > API
4. Request an API key
5. Copy both the API key and read access token

## Important Notes

- ⚠️ **Never commit `.env.local` to version control** - it contains sensitive API keys
- ✅ The `.env.local` file is already included in `.gitignore`
- 📝 Always update `.env.example` when adding new environment variables (but with placeholder values)
- 🔒 Use `NEXT_PUBLIC_` prefix for variables that need to be accessible in the browser

## File Structure

```
frontend/
├── .env.local          # Your actual environment variables (not committed)
├── .env.example        # Template with placeholder values (committed)
└── .gitignore          # Ensures .env.local is not committed
```

## Troubleshooting

If you get an error about missing environment variables:

1. Make sure `.env.local` exists in the frontend directory
2. Check that all required variables are set in `.env.local`
3. Restart your development server after adding new environment variables
4. Verify that your API keys are valid and active
