# OSINT Lab Pro - Ultimate Deployment Guide

## 🎯 Overview

This document provides comprehensive instructions for deploying the OSINT Lab Pro hybrid PWA application. Follow these steps to ensure a successful deployment on any platform.

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Quick Start](#quick-start)
3. [Detailed Deployment Steps](#detailed-deployment-steps)
4. [Configuration Options](#configuration-options)
5. [Troubleshooting](#troubleshooting)
6. [Production Deployment](#production-deployment)
7. [Security Considerations](#security-considerations)

---

## Prerequisites

### System Requirements

- **Operating System**: Linux, macOS, or Windows
- **Python**: Version 3.8 or higher
- **RAM**: Minimum 2GB
- **Disk Space**: Minimum 500MB free
- **Network**: Internet connection for dependency installation

### Required Software

1. **Python 3.8+**
   ```bash
   python3 --version
   ```

2. **pip** (Python package manager)
   ```bash
   pip3 --version
   ```

3. **Git** (optional, for version control)
   ```bash
   git --version
   ```

---

## Quick Start

### Option 1: Automated Deployment (Recommended)

The fastest way to deploy OSINT Lab Pro:

```bash
# 1. Navigate to project directory
cd /path/to/Osint-lab-pro

# 2. Make deployment script executable
chmod +x deploy-osint-lab-pro.sh

# 3. Run deployment script
./deploy-osint-lab-pro.sh
```

The script will automatically:
- ✅ Check system requirements
- ✅ Create virtual environment
- ✅ Install dependencies
- ✅ Configure Streamlit
- ✅ Launch the application

### Option 2: Manual Deployment

If you prefer manual control:

```bash
# 1. Create virtual environment
python3 -m venv venv

# 2. Activate virtual environment
# On Linux/macOS:
source venv/bin/activate
# On Windows:
venv\Scripts\activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Run the application
streamlit run streamlit_app_v2.py
```

---

## Detailed Deployment Steps

### Step 1: System Check

Verify your system meets all requirements:

```bash
# Check Python version
python3 --version

# Check pip version
pip3 --version

# Check available disk space
df -h .

# Check memory
free -h  # Linux
vm_stat  # macOS
```

### Step 2: Environment Setup

Create an isolated Python environment:

```bash
# Create virtual environment
python3 -m venv venv

# Activate environment
source venv/bin/activate  # Linux/macOS
# OR
venv\Scripts\activate     # Windows

# Verify activation
which python
```

### Step 3: Dependency Installation

Install all required Python packages:

```bash
# Upgrade pip first
pip install --upgrade pip

# Install dependencies
pip install -r requirements.txt

# Verify installations
pip list
```

**Required Packages:**
- `streamlit>=1.28.0` - Web framework
- `requests>=2.31.0` - HTTP library
- `python-whois>=0.8.0` - WHOIS lookups
- `dnspython>=2.4.2` - DNS queries

### Step 4: Application Configuration

Configure Streamlit settings:

```bash
# Create config directory
mkdir -p ~/.streamlit

# Create config file
cat > ~/.streamlit/config.toml << EOF
[server]
port = 8501
headless = true
enableCORS = false

[browser]
gatherUsageStats = false

[theme]
primaryColor = "#1E88E5"
EOF
```

### Step 5: Pre-deployment Checks

Verify everything is ready:

```bash
# Check syntax
python -m py_compile streamlit_app_v2.py

# Test imports
python -c "import streamlit; import requests; import whois; import dns.resolver"

# Check port availability
lsof -i :8501  # Should show nothing
```

### Step 6: Launch Application

Start the OSINT Lab Pro application:

```bash
# Start with default settings
streamlit run streamlit_app_v2.py

# Or specify custom port
streamlit run streamlit_app_v2.py --server.port=8080

# For production mode
streamlit run streamlit_app_v2.py --server.headless=true
```

**Access the application:**
- Local: http://localhost:8501
- Network: http://YOUR_IP:8501

---

## Configuration Options

### Environment Variables

```bash
# Set custom port
export PORT=8080

# Set custom host
export HOST=0.0.0.0
```

### Streamlit Configuration

Edit `~/.streamlit/config.toml`:

```toml
[server]
port = 8501
address = "0.0.0.0"
headless = true
enableCORS = false
maxUploadSize = 200

[browser]
serverAddress = "localhost"
gatherUsageStats = false
serverPort = 8501

[theme]
primaryColor = "#1E88E5"
backgroundColor = "#FFFFFF"
secondaryBackgroundColor = "#F0F2F6"
textColor = "#262730"
font = "sans serif"
```

### Custom Port

```bash
# Using environment variable
PORT=8080 ./deploy-osint-lab-pro.sh

# Using script parameter
./deploy-osint-lab-pro.sh --port 8080

# Direct streamlit command
streamlit run streamlit_app_v2.py --server.port=8080
```

---

## Troubleshooting

### Common Issues

#### 1. Port Already in Use

**Error:** `Address already in use`

**Solution:**
```bash
# Find process using port
lsof -i :8501

# Kill process
kill -9 <PID>

# Or use different port
streamlit run streamlit_app_v2.py --server.port=8502
```

#### 2. Module Not Found

**Error:** `ModuleNotFoundError: No module named 'streamlit'`

**Solution:**
```bash
# Ensure virtual environment is activated
source venv/bin/activate

# Reinstall dependencies
pip install -r requirements.txt
```

#### 3. Permission Denied

**Error:** `Permission denied: './deploy-osint-lab-pro.sh'`

**Solution:**
```bash
# Make script executable
chmod +x deploy-osint-lab-pro.sh
```

#### 4. Python Version Mismatch

**Error:** `Python 3.8+ required`

**Solution:**
```bash
# Check Python version
python3 --version

# Use pyenv to install correct version
pyenv install 3.10.0
pyenv local 3.10.0
```

#### 5. DNS Resolution Errors

**Error:** `dns.resolver.NXDOMAIN`

**Solution:**
- Check internet connection
- Verify DNS server settings
- Try different domain names
- Check firewall settings

### Debug Mode

Run in debug mode for detailed logs:

```bash
# Enable debug logging
streamlit run streamlit_app_v2.py --logger.level=debug

# Check logs
tail -f ~/.streamlit/logs/streamlit.log
```

---

## Production Deployment

### Using systemd (Linux)

Create a systemd service:

```bash
# Create service file
sudo nano /etc/systemd/system/osint-lab-pro.service
```

```ini
[Unit]
Description=OSINT Lab Pro Application
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/path/to/Osint-lab-pro
Environment="PATH=/path/to/Osint-lab-pro/venv/bin"
ExecStart=/path/to/Osint-lab-pro/venv/bin/streamlit run streamlit_app_v2.py --server.port=8501 --server.headless=true
Restart=always

[Install]
WantedBy=multi-user.target
```

```bash
# Enable and start service
sudo systemctl enable osint-lab-pro
sudo systemctl start osint-lab-pro
sudo systemctl status osint-lab-pro
```

### Using Docker

Create `Dockerfile`:

```dockerfile
FROM python:3.10-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8501

CMD ["streamlit", "run", "streamlit_app_v2.py", "--server.port=8501", "--server.address=0.0.0.0"]
```

Build and run:

```bash
# Build image
docker build -t osint-lab-pro .

# Run container
docker run -p 8501:8501 osint-lab-pro
```

### Reverse Proxy (Nginx)

Configure Nginx:

```nginx
server {
    listen 80;
    server_name osint-lab-pro.example.com;

    location / {
        proxy_pass http://localhost:8501;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Cloud Deployment

#### Heroku

```bash
# Create Procfile
echo "web: streamlit run streamlit_app_v2.py --server.port=\$PORT --server.address=0.0.0.0" > Procfile

# Deploy
heroku create osint-lab-pro
git push heroku main
```

#### AWS EC2

```bash
# Connect to instance
ssh -i key.pem ubuntu@ec2-instance

# Clone repository
git clone https://github.com/alzaem2002-ctrl/Osint-lab-pro.git
cd Osint-lab-pro

# Deploy
./deploy-osint-lab-pro.sh
```

---

## Security Considerations

### 1. Network Security

```bash
# Run on localhost only (default)
streamlit run streamlit_app_v2.py --server.address=localhost

# For network access, use firewall
sudo ufw allow 8501/tcp
sudo ufw enable
```

### 2. Environment Variables

Never commit sensitive data. Use environment variables:

```bash
# Create .env file
echo "API_KEY=your_secret_key" > .env
echo ".env" >> .gitignore

# Load in application
from dotenv import load_dotenv
load_dotenv()
```

### 3. HTTPS/TLS

Use reverse proxy with SSL:

```bash
# Install certbot
sudo apt-get install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d osint-lab-pro.example.com
```

### 4. Rate Limiting

Implement rate limiting for API calls:

```python
from streamlit import cache_data
import time

@cache_data(ttl=60)
def rate_limited_api_call():
    time.sleep(1)  # 1 second delay
    return api_call()
```

### 5. Input Validation

Always validate user inputs:

```python
import re

def validate_domain(domain):
    pattern = r'^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}$'
    return bool(re.match(pattern, domain.lower()))
```

---

## Performance Optimization

### 1. Caching

```python
@st.cache_data(ttl=3600)
def expensive_computation(param):
    return result
```

### 2. Resource Limits

Configure in `config.toml`:

```toml
[server]
maxUploadSize = 200
maxMessageSize = 200

[browser]
serverAddress = "localhost"
gatherUsageStats = false
```

### 3. Connection Pooling

Use session for multiple requests:

```python
session = requests.Session()
response = session.get(url)
```

---

## Maintenance

### Update Dependencies

```bash
# Update all packages
pip install --upgrade -r requirements.txt

# Update specific package
pip install --upgrade streamlit
```

### Backup

```bash
# Backup configuration
cp -r ~/.streamlit ~/.streamlit.backup

# Backup application
tar -czf osint-lab-pro-backup.tar.gz Osint-lab-pro/
```

### Monitoring

```bash
# View logs
tail -f ~/.streamlit/logs/streamlit.log

# Monitor resources
htop

# Check service status
systemctl status osint-lab-pro
```

---

## Quick Reference Commands

```bash
# Start application
./deploy-osint-lab-pro.sh

# Quick start (manual)
source venv/bin/activate && streamlit run streamlit_app_v2.py

# Stop application
Ctrl+C

# Check status
ps aux | grep streamlit

# View logs
cat ~/.streamlit/logs/streamlit.log

# Update dependencies
pip install -r requirements.txt --upgrade

# Check port
lsof -i :8501
```

---

## Support & Resources

- **GitHub Repository**: https://github.com/alzaem2002-ctrl/Osint-lab-pro
- **Streamlit Docs**: https://docs.streamlit.io
- **Python WHOIS**: https://pypi.org/project/python-whois/
- **DNSPython**: https://www.dnspython.org/

---

## License & Legal

**⚠️ Important Notice:**

This tool is designed for legitimate security research and testing purposes only. Users must:

- Obtain proper authorization before conducting any OSINT activities
- Respect privacy laws and regulations (GDPR, CCPA, etc.)
- Follow ethical hacking guidelines
- Not use for malicious purposes or unauthorized access
- Comply with terms of service of queried platforms

**The developers are not responsible for misuse of this tool.**

---

## Version History

- **v2.0** (Current) - Full deployment script with PWA support
- **v1.0** - Initial release with basic OSINT tools

---

**Deployment Complete! 🎉**

Your OSINT Lab Pro application should now be running successfully. Access it at http://localhost:8501 and start your OSINT research!
