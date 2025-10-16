# Health check endpoint for Render
# This file is used by Render to check if the service is healthy

import requests
import sys
import os

def health_check():
    port = os.environ.get('PORT', '8000')
    url = f"http://localhost:{port}/health"
    
    try:
        response = requests.get(url, timeout=10)
        if response.status_code == 200:
            print("✅ Health check passed")
            return True
        else:
            print(f"❌ Health check failed with status {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Health check failed: {e}")
        return False

if __name__ == "__main__":
    if health_check():
        sys.exit(0)
    else:
        sys.exit(1)
