# 🔍 OSINT Lab Pro

**Professional Open Source Intelligence Toolkit - Hybrid PWA**

A comprehensive OSINT (Open Source Intelligence) toolkit built with Python and Streamlit, designed for security researchers, penetration testers, and digital investigators.

## 🚀 Quick Start

### Option 1: Automated Deployment (Recommended)

```bash
# Clone the repository
git clone https://github.com/alzaem2002-ctrl/Osint-lab-pro.git
cd Osint-lab-pro

# Run deployment script
chmod +x deploy-osint-lab-pro.sh
./deploy-osint-lab-pro.sh
```

### Option 2: Manual Setup

```bash
# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run the application
streamlit run streamlit_app_v2.py
```

## 🛠️ Features

### Network Tools
- **🌐 Domain Analyzer** - WHOIS lookup, DNS records, IP resolution
- **🌍 IP Lookup** - Geolocation, ISP information, network details

### Identity Tools
- **📧 Email Validator** - Format validation, MX record checks
- **👥 Social Media Finder** - Multi-platform profile search
- **🔎 Username Search** - Cross-platform username availability

### Security Tools
- **📱 Phone Number Lookup** - Number analysis, country detection
- **🔒 Breach Checker** - Data breach verification
- **📄 Metadata Extractor** - File metadata analysis

## 📋 Requirements

- Python 3.8+
- pip (Python package manager)
- Internet connection for API queries

## 📚 Documentation

- **Deployment Guide**: See `ULTIMATE_DEPLOYMENT_PROMPT.md` for detailed deployment instructions
- **Contributor Guide**: See `.github/COPILOT-CODING-AGENT.md` for contribution guidelines

## 🔧 Available Applications

- `streamlit_app_v2.py` - Full-featured OSINT toolkit (recommended)
- `streamlit_app_fixed.py` - Simplified version with core features
- `index.html` - PWA landing page

## 📦 Dependencies

```
streamlit>=1.28.0
requests>=2.31.0
python-whois>=0.8.0
dnspython>=2.4.2
```

## 🌐 Access

Once deployed, access the application at:
- **Local**: http://localhost:8501
- **Network**: http://YOUR_IP:8501

## ⚠️ Legal Disclaimer

This tool is designed for **legal security research and testing purposes only**. Users must:

- Obtain proper authorization before conducting any OSINT activities
- Respect privacy laws and regulations (GDPR, CCPA, etc.)
- Follow ethical hacking guidelines
- Not use for malicious purposes or unauthorized access
- Comply with terms of service of queried platforms

**The developers are not responsible for misuse of this tool.**

## 🤝 Contributing

For contributor and Copilot-coding-agent onboarding, see: `.github/COPILOT-CODING-AGENT.md`

## 📄 License

This project is open source. Please use responsibly and ethically.

## 🆘 Support

For issues, questions, or contributions:
- Open an issue on GitHub
- Check the documentation in `ULTIMATE_DEPLOYMENT_PROMPT.md`
- Review troubleshooting section in deployment guide

---

**Built with ❤️ for the security research community**
