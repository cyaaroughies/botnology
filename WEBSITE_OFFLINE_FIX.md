# Website Offline Fix Guide

## Problem: Red Status Indicator on Homepage

When you see a **red button/dot** on the homepage showing "API: Offline", it means the backend server is not running.

---

## Quick Fix (3 Steps)

### 1. Install Dependencies
```bash
cd /home/runner/work/botnology/botnology
pip install -r requirements.txt
```

### 2. Start Backend Server
```bash
python -m uvicorn api.index:app --host 0.0.0.0 --port 8000
```

### 3. Verify
Open browser to `http://localhost:8000/` and check for green "API: ONLINE ✓" indicator.

---

## Understanding the Status Indicator

### Location
The status indicator appears in the hero section of the homepage (index.html):
```html
<div class="h-eyebrow">
  <span class="dot" id="healthDot"></span>
  <span id="healthLine">API: checking…</span>
</div>
```

### Status Colors

| Color | Hex | Message | Meaning |
|-------|-----|---------|---------|
| 🟢 Green | #4ade80 | API: Online ✓ | Backend healthy |
| 🟡 Yellow | #fbbf24 | API: Degraded | Backend has issues |
| 🔴 Red | #ef4444 | API: Offline | Backend not running |

---

## How It Works

### Frontend (script.js)
The `checkHealth()` function runs when the page loads:

```javascript
async function checkHealth() {
  const healthDot = document.getElementById("healthDot");
  const healthLine = document.getElementById("healthLine");
  
  try {
    const response = await fetch("/api/health");
    const data = await response.json();
    
    if (data.status === "ok") {
      healthDot.style.background = "#4ade80"; // Green
      healthLine.textContent = "API: Online ✓";
    } else {
      healthDot.style.background = "#fbbf24"; // Yellow
      healthLine.textContent = "API: Degraded";
    }
  } catch (error) {
    healthDot.style.background = "#ef4444"; // Red
    healthLine.textContent = "API: Offline";
  }
}
```

### Backend (api/index.py)
The health endpoint returns status information:

```python
@app.get("/api/health")
def api_health():
    return {
        "status": "ok",
        "openai": OPENAI_ENABLED,
        "stripe": bool(os.getenv("STRIPE_SECRET_KEY")),
        "public_dir_exists": PUBLIC_DIR.exists(),
    }
```

---

## Troubleshooting Steps

### Check 1: Is Backend Running?
```bash
# Check for running process
ps aux | grep uvicorn

# Try to reach health endpoint
curl http://localhost:8000/api/health
```

**Expected output:**
```json
{
  "status": "ok",
  "openai": false,
  "stripe": false,
  "public_dir_exists": true,
  "public_dir": "/path/to/botnology/public"
}
```

### Check 2: Are Dependencies Installed?
```bash
# Check if uvicorn is available
python -m uvicorn --version

# If not, install dependencies
pip install -r requirements.txt
```

### Check 3: Check Port Availability
```bash
# Check if port 8000 is in use
netstat -tuln | grep 8000

# Or use lsof
lsof -i :8000
```

### Check 4: Check Environment Variables
```bash
# Ensure .env.local exists
ls -la .env.local

# Check if variables are loaded
python -c "import os; from dotenv import load_dotenv; load_dotenv('.env.local'); print('OPENAI:', bool(os.getenv('OPENAI_API_KEY')))"
```

### Check 5: Check Server Logs
```bash
# If running in background, check logs
tail -f /var/log/botnology/backend.log

# Or run in foreground to see errors
python -m uvicorn api.index:app --host 0.0.0.0 --port 8000
```

---

## Common Issues & Solutions

### Issue: "uvicorn: command not found"
**Solution:** Install dependencies
```bash
pip install -r requirements.txt
```

### Issue: "Address already in use"
**Solution:** Kill existing process or use different port
```bash
# Find process
lsof -i :8000

# Kill it
kill -9 <PID>

# Or use different port
python -m uvicorn api.index:app --host 0.0.0.0 --port 8001
```

### Issue: "Module 'api.index' not found"
**Solution:** Run from repository root
```bash
cd /home/runner/work/botnology/botnology
python -m uvicorn api.index:app --host 0.0.0.0 --port 8000
```

### Issue: Health check returns but indicator still red
**Solution:** Check browser console for errors
1. Open browser DevTools (F12)
2. Check Console tab for JavaScript errors
3. Check Network tab for failed requests
4. Clear cache and reload (Ctrl+Shift+R)

---

## Production Deployment

### Option 1: systemd Service (Linux)

Create `/etc/systemd/system/botnology-backend.service`:
```ini
[Unit]
Description=Botnology FastAPI Backend
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/botnology
Environment="PATH=/var/www/botnology/venv/bin"
ExecStart=/var/www/botnology/venv/bin/uvicorn api.index:app --host 0.0.0.0 --port 8000
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

Enable and start:
```bash
sudo systemctl enable botnology-backend
sudo systemctl start botnology-backend
sudo systemctl status botnology-backend
```

### Option 2: PM2 (Node.js Process Manager)

```bash
# Install PM2
npm install -g pm2

# Start backend
pm2 start "python -m uvicorn api.index:app --host 0.0.0.0 --port 8000" --name botnology-backend

# Auto-restart on system boot
pm2 startup
pm2 save
```

### Option 3: Docker

Create `Dockerfile`:
```dockerfile
FROM python:3.12-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

CMD ["uvicorn", "api.index:app", "--host", "0.0.0.0", "--port", "8000"]
```

Run:
```bash
docker build -t botnology-backend .
docker run -d -p 8000:8000 --name botnology botnology-backend
```

### Option 4: Vercel/Railway (Serverless)

The app is already configured for serverless deployment:
- `vercel.json` - Vercel configuration
- `railway.toml` - Railway configuration
- `Procfile` - Heroku/Railway startup

Simply push to GitHub and connect to deployment platform.

---

## Monitoring & Alerts

### Health Check Monitoring

Set up automated health checks with your monitoring service:

**Uptime Robot:**
```
URL: https://www.botnology101.com/api/health
Type: HTTP(s)
Interval: 5 minutes
Expected keyword: "ok"
```

**Pingdom:**
```
URL: https://www.botnology101.com/api/health
Check interval: 1 minute
Alert when: status != 200 or body doesn't contain "ok"
```

**Custom Script:**
```bash
#!/bin/bash
response=$(curl -s http://localhost:8000/api/health)
status=$(echo $response | jq -r '.status')

if [ "$status" != "ok" ]; then
    echo "Backend is down!"
    # Send alert (email, Slack, etc.)
    # Attempt restart
    systemctl restart botnology-backend
fi
```

---

## Performance Tuning

### Use Gunicorn with Uvicorn Workers

For production, use Gunicorn with multiple Uvicorn workers:

```bash
gunicorn api.index:app \
  --workers 4 \
  --worker-class uvicorn.workers.UvicornWorker \
  --bind 0.0.0.0:8000 \
  --access-logfile - \
  --error-logfile -
```

### Nginx Reverse Proxy

Configure Nginx as a reverse proxy:

```nginx
server {
    listen 80;
    server_name botnology101.com;

    location / {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    location /api/health {
        proxy_pass http://localhost:8000;
        access_log off;  # Don't log health checks
    }
}
```

---

## Summary

**Problem:** Red "API: Offline" indicator on homepage

**Cause:** Backend FastAPI server not running

**Solution:** Start backend with `uvicorn api.index:app --host 0.0.0.0 --port 8000`

**Prevention:** Set up auto-restart with systemd, PM2, or Docker

**Monitoring:** Use health check endpoint `/api/health` for monitoring

---

**Last Updated:** 2026-01-30  
**Status:** ✅ Fixed and documented  
**Verified:** Backend running, status indicator green
