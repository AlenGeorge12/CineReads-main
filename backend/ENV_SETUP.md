# Environment Variables Setup - Backend

This document explains how to set up environment variables for the CineReads backend application.

## Quick Setup

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and replace the placeholder values with your actual API keys:
   ```bash
   # Open the file in your preferred editor
   nano .env
   # or
   code .env
   ```

## Required Environment Variables

### API Keys (Required)

- **OPENAI_API_KEY**: Your OpenAI API key for GPT recommendations
- **HARDCOVER_API_KEY**: Your Hardcover API key for book metadata

### Cache Configuration

- **CACHE_DIR**: Directory for storing cache files (default: `cache`)
- **CACHE_EXPIRE_SECONDS**: General cache expiration time in seconds (default: `3600`)
- **BOOK_CACHE_EXPIRE_SECONDS**: Book metadata cache expiration (default: `86400`)

### API Limits

- **MAX_MOVIES_PER_REQUEST**: Maximum number of movies to process per request (default: `5`)
- **GPT_MAX_TOKENS**: Maximum tokens for GPT responses (default: `800`)
- **GPT_TEMPERATURE**: Creativity level for GPT responses (default: `0.7`)

### Development Settings

- **DEBUG**: Enable debug mode (default: `false`)

## Getting API Keys

### OpenAI API Key

1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Create an account or log in
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key (starts with `sk-proj-...`)

### Hardcover API Key

1. Go to [Hardcover.app](https://hardcover.app/)
2. Create an account or log in
3. Go to Settings > API
4. Generate an API key
5. Copy the JWT token

## Important Security Notes

- ⚠️ **Never commit `.env` to version control** - it contains sensitive API keys
- ✅ The `.env` file is included in `.gitignore`
- 📝 Always update `.env.example` when adding new environment variables (but with placeholder values)
- 🔒 Keep your API keys secure and rotate them regularly

## File Structure

```
backend/
├── .env              # Your actual environment variables (not committed)
├── .env.example      # Template with placeholder values (committed)
├── .gitignore        # Ensures .env is not committed
└── app/
    └── config.py     # Loads environment variables using pydantic-settings
```

## Testing Your Setup

Run the test script to verify your API keys are working:

```bash
python test_hardcover.py
```

This will test both the Hardcover API integration and verify your environment is set up correctly.

## Troubleshooting

### Missing Environment Variables Error

If you get an error about missing environment variables:

1. Make sure `.env` exists in the backend directory
2. Check that all required variables are set in `.env`
3. Verify that your API keys are valid and active
4. Restart your development server after adding new environment variables

### API Key Issues

- **OpenAI**: Check your billing and usage limits on the OpenAI platform
- **Hardcover**: Verify your token hasn't expired (they typically last 1 year)

### Cache Issues

If you're having cache-related problems:

1. Check that the `CACHE_DIR` exists and is writable
2. Clear the cache directory if needed: `rm -rf cache/*`
3. Verify cache expiration settings are reasonable

## Environment Variables Reference

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `OPENAI_API_KEY` | string | *required* | OpenAI API key for GPT integration |
| `HARDCOVER_API_KEY` | string | *required* | Hardcover API key for book metadata |
| `CACHE_DIR` | string | `cache` | Directory for cache storage |
| `CACHE_EXPIRE_SECONDS` | integer | `3600` | General cache expiration (1 hour) |
| `BOOK_CACHE_EXPIRE_SECONDS` | integer | `86400` | Book cache expiration (24 hours) |
| `MAX_MOVIES_PER_REQUEST` | integer | `5` | Max movies per recommendation request |
| `GPT_MAX_TOKENS` | integer | `800` | Maximum GPT response tokens |
| `GPT_TEMPERATURE` | float | `0.7` | GPT creativity level (0.0-1.0) |
| `DEBUG` | boolean | `false` | Enable debug logging |
