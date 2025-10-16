# Keep-Alive Setup for Render Free Tier

This guide explains how to keep your FastAPI backend active on Render's free tier to prevent it from going to sleep after 15 minutes of inactivity.

## How It Works

The backend now includes an automatic keep-alive mechanism that:

1. **Only activates on Render**: Uses the `RENDER_EXTERNAL_URL` environment variable to detect if running on Render
2. **Pings every 14 minutes**: Sends a request to the `/health` endpoint every 14 minutes (just under Render's 15-minute timeout)
3. **Self-healing**: Continues running even if individual pings fail
4. **Minimal resource usage**: Uses a lightweight health check endpoint

## Setup Instructions

### 1. Set Environment Variable on Render

In your Render dashboard:

1. Go to your FastAPI service
2. Navigate to **Environment** tab
3. Add the following environment variable:
   - **Key**: `RENDER_EXTERNAL_URL`
   - **Value**: Your Render service URL (e.g., `https://your-app-name.onrender.com`)

### 2. Deploy

Once you've set the environment variable, redeploy your service. You should see these logs during startup:

```
🚀 CineReads API starting up...
📁 Cache directory: /opt/render/project/src/cache
🔑 OpenAI API key: ✅ Set
🔑 Hardcover API key: ✅ Set
🔄 Starting keep-alive task for Render deployment...
```

### 3. Monitor

You can monitor the keep-alive functionality by:

1. **Checking logs**: Look for `🔄 Keep-alive ping successful: 200` messages every 14 minutes
2. **Visiting health endpoint**: Go to `https://your-app.onrender.com/health` to see enhanced health information
3. **Watching response times**: Your API should respond quickly even after periods of inactivity

## Local Development

When running locally, the keep-alive task is automatically disabled. You'll see:

```
🏠 Running locally - keep-alive task disabled
```

## Alternative Solutions

If the built-in keep-alive doesn't meet your needs, consider these alternatives:

### External Cron Services

Use external services to ping your API:

1. **Cron-job.org**: Free service to ping your `/health` endpoint every 10-14 minutes
2. **UptimeRobot**: Free monitoring that also keeps your service awake
3. **GitHub Actions**: Set up a scheduled workflow to ping your API

### Example GitHub Action

Create `.github/workflows/keep-alive.yml`:

```yaml
name: Keep Alive
on:
  schedule:
    - cron: '*/14 * * * *'  # Every 14 minutes
jobs:
  keep-alive:
    runs-on: ubuntu-latest
    steps:
      - name: Ping API
        run: curl -f https://your-app.onrender.com/health || exit 1
```

## Important Considerations

1. **Free Tier Limits**: Render's free tier has 750 hours/month. Keeping your app alive 24/7 uses ~720 hours, staying within limits.

2. **Ethical Usage**: This approach is generally acceptable for legitimate applications but review Render's terms of service.

3. **Cost vs Performance**: If you need guaranteed uptime, consider upgrading to Render's paid tier.

4. **Cold Start Optimization**: The keep-alive prevents cold starts, but ensure your app starts quickly for the best user experience.

## Troubleshooting

### Keep-alive not working
- Ensure `RENDER_EXTERNAL_URL` is set correctly
- Check logs for error messages
- Verify the health endpoint is accessible

### High resource usage
- The keep-alive task uses minimal resources
- Consider reducing ping frequency if needed (but stay under 15 minutes)

### Still experiencing timeouts
- External services might provide more reliability
- Consider implementing multiple keep-alive strategies

## Health Endpoint

The enhanced `/health` endpoint now provides:

```json
{
  "status": "healthy",
  "timestamp": "2024-01-25T10:30:00.000Z",
  "uptime_seconds": 1643097000,
  "cache_dir_exists": true,
  "openai_configured": true,
  "hardcover_configured": true,
  "debug_mode": false,
  "render_deployment": true,
  "message": "CineReads API is running and healthy! 🚀"
}
```

This information helps monitor your application's health and deployment status.
