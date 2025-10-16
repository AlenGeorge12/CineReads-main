# Render Deployment Guide for CineReads Backend

## Issues Fixed

### 1. Python Version Compatibility
- **Problem**: Render was using Python 3.13, but your dependencies (FastAPI 0.104.1, Pydantic 1.10.13) were incompatible
- **Solution**: 
  - Updated `runtime.txt` to specify Python 3.11.10
  - Updated all dependencies to versions compatible with Python 3.11+ and Python 3.13

### 2. Pydantic v1 to v2 Migration
- **Problem**: Old Pydantic v1 syntax was causing ForwardRef errors
- **Solution**:
  - Updated to Pydantic v2.10.3
  - Added `pydantic-settings==2.6.1` 
  - Updated config.py to use `model_config = ConfigDict(env_file=".env")` instead of `class Config`
  - Changed `.dict()` calls to `.model_dump()` in codebase
  - Updated cache service JSON serializer for Pydantic v2 compatibility

### 3. Async Task Creation Issue
- **Problem**: Cache service was trying to create async tasks during import
- **Solution**: Made cleanup task creation lazy (only when needed)

### 4. Port Binding
- **Problem**: Render couldn't detect open ports
- **Solution**: 
  - Added `Procfile` with proper port binding: `web: uvicorn app.main:app --host 0.0.0.0 --port $PORT`
  - Added `render.yaml` for better deployment configuration

## Updated Dependencies

```
fastapi==0.115.4            # Was 0.104.1
uvicorn[standard]==0.32.1    # Was 0.24.0
pydantic==2.10.3             # Was 1.10.13 (major version upgrade)
pydantic-settings==2.6.1     # New requirement for Pydantic v2
openai==1.55.3               # Was 1.3.8
httpx==0.28.1                # Was 0.25.2
aiofiles==24.1.0             # Was 23.2.0
python-dotenv==1.0.1         # Was 1.0.0
requests==2.32.3             # New for health checks
```

## Deployment Steps

1. **Ensure Environment Variables**:
   - Set `OPENAI_API_KEY` in Render dashboard
   - Set `HARDCOVER_API_KEY` in Render dashboard
   - Set `RENDER_EXTERNAL_URL` to your app's URL (e.g., `https://your-app.onrender.com`) for keep-alive functionality

2. **Deploy**:
   - Push your changes to your repository
   - Render should automatically use the `Procfile` for the start command
   - The `runtime.txt` should force Python 3.11.10

3. **Monitor**:
   - Check Render logs for successful startup and keep-alive messages
   - Access `/health` endpoint to verify the service is running
   - Access `/docs` for FastAPI documentation
   - Look for keep-alive pings every 14 minutes in the logs

## Keep-Alive Feature

The backend now includes automatic keep-alive functionality to prevent Render's free tier from putting your app to sleep:

- **Automatic activation**: Only runs when `RENDER_EXTERNAL_URL` is set
- **14-minute intervals**: Pings the health endpoint every 14 minutes
- **Zero configuration**: Works out of the box once deployed
- **See**: `KEEP_ALIVE_SETUP.md` for detailed information

## Files Added/Modified

- `Procfile` - Render start command
- `render.yaml` - Render service configuration  
- `health_check.py` - Health check script
- `requirements.txt` - Updated dependencies
- `runtime.txt` - Updated Python version
- `app/config.py` - Pydantic v2 configuration
- `app/routers/recommendations.py` - Updated .dict() to .model_dump()
- `app/services/cache_service.py` - Fixed async task creation and Pydantic v2 compatibility

## Testing Locally

Before deploying, test locally:

```bash
cd backend
OPENAI_API_KEY=your_key HARDCOVER_API_KEY=your_key uvicorn app.main:app --reload --port 8000
```

Visit `http://localhost:8000/health` to verify everything works.
