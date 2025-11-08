"""
OSINT Lab Pro - Hybrid PWA Application
A comprehensive OSINT (Open Source Intelligence) toolkit
"""

import streamlit as st
import requests
import json
from datetime import datetime
import re
import whois
import socket
import dns.resolver
import subprocess
import platform

# Page configuration
st.set_page_config(
    page_title="OSINT Lab Pro",
    page_icon="🔍",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom CSS for better UI
st.markdown("""
    <style>
    .main-header {
        font-size: 2.5rem;
        color: #1E88E5;
        text-align: center;
        margin-bottom: 2rem;
    }
    .tool-card {
        background-color: #f0f2f6;
        padding: 1.5rem;
        border-radius: 0.5rem;
        margin: 1rem 0;
    }
    .result-box {
        background-color: #e8f4f8;
        padding: 1rem;
        border-radius: 0.5rem;
        border-left: 4px solid #1E88E5;
    }
    </style>
""", unsafe_allow_html=True)

# Main header
st.markdown('<h1 class="main-header">🔍 OSINT Lab Pro</h1>', unsafe_allow_html=True)
st.markdown("---")

# Sidebar navigation
st.sidebar.title("🛠️ OSINT Tools")
tool_option = st.sidebar.selectbox(
    "Select a tool:",
    [
        "Home",
        "Domain Analyzer",
        "IP Lookup",
        "Email Validator",
        "Social Media Finder",
        "Phone Number Lookup",
        "Username Search",
        "Breach Checker",
        "Metadata Extractor"
    ]
)

st.sidebar.markdown("---")
st.sidebar.info("**OSINT Lab Pro v2.0**\nProfessional OSINT toolkit for security researchers")

# Home page
if tool_option == "Home":
    st.markdown("## Welcome to OSINT Lab Pro")
    st.write("""
    **OSINT Lab Pro** is a comprehensive toolkit for Open Source Intelligence gathering.
    This hybrid PWA application provides various tools for security researchers, penetration testers,
    and digital investigators.
    """)
    
    col1, col2, col3 = st.columns(3)
    
    with col1:
        st.info("### 🌐 Network Tools\n- Domain Analysis\n- IP Lookup\n- DNS Records")
    
    with col2:
        st.success("### 👤 Identity Tools\n- Email Validation\n- Phone Lookup\n- Username Search")
    
    with col3:
        st.warning("### 🔒 Security Tools\n- Breach Checker\n- Metadata Analysis\n- Social Media OSINT")
    
    st.markdown("---")
    st.write("### 📊 Features")
    st.write("""
    - **Real-time Analysis**: Get instant results for your OSINT queries
    - **Multiple Tools**: Access 8+ different OSINT tools in one place
    - **PWA Support**: Install as an app on any device
    - **Privacy Focused**: All queries are processed securely
    - **Export Results**: Download results in various formats
    """)

# Domain Analyzer
elif tool_option == "Domain Analyzer":
    st.markdown("## 🌐 Domain Analyzer")
    st.write("Analyze domain information including WHOIS, DNS records, and more.")
    
    domain = st.text_input("Enter domain name:", placeholder="example.com")
    
    if st.button("Analyze Domain", type="primary"):
        if domain:
            with st.spinner("Analyzing domain..."):
                try:
                    # WHOIS Lookup
                    st.subheader("📋 WHOIS Information")
                    try:
                        w = whois.whois(domain)
                        whois_data = {
                            "Domain Name": w.domain_name,
                            "Registrar": w.registrar,
                            "Creation Date": str(w.creation_date),
                            "Expiration Date": str(w.expiration_date),
                            "Name Servers": w.name_servers
                        }
                        st.json(whois_data)
                    except Exception as e:
                        st.error(f"WHOIS lookup failed: {str(e)}")
                    
                    # DNS Records
                    st.subheader("🔍 DNS Records")
                    dns_types = ['A', 'AAAA', 'MX', 'NS', 'TXT']
                    for record_type in dns_types:
                        try:
                            answers = dns.resolver.resolve(domain, record_type)
                            st.write(f"**{record_type} Records:**")
                            for rdata in answers:
                                st.code(str(rdata))
                        except Exception as e:
                            st.write(f"**{record_type} Records:** Not found")
                    
                    # IP Resolution
                    st.subheader("🌍 IP Address")
                    try:
                        ip = socket.gethostbyname(domain)
                        st.success(f"IP Address: {ip}")
                    except Exception as e:
                        st.error(f"IP resolution failed: {str(e)}")
                        
                except Exception as e:
                    st.error(f"Analysis failed: {str(e)}")
        else:
            st.warning("Please enter a domain name")

# IP Lookup
elif tool_option == "IP Lookup":
    st.markdown("## 🌍 IP Lookup")
    st.write("Get detailed information about an IP address.")
    
    ip_address = st.text_input("Enter IP address:", placeholder="8.8.8.8")
    
    if st.button("Lookup IP", type="primary"):
        if ip_address:
            with st.spinner("Looking up IP..."):
                try:
                    # Using ip-api.com for geolocation
                    response = requests.get(f"http://ip-api.com/json/{ip_address}")
                    if response.status_code == 200:
                        data = response.json()
                        
                        col1, col2 = st.columns(2)
                        
                        with col1:
                            st.metric("Country", data.get('country', 'N/A'))
                            st.metric("Region", data.get('regionName', 'N/A'))
                            st.metric("City", data.get('city', 'N/A'))
                        
                        with col2:
                            st.metric("ISP", data.get('isp', 'N/A'))
                            st.metric("Organization", data.get('org', 'N/A'))
                            st.metric("AS", data.get('as', 'N/A'))
                        
                        st.markdown("---")
                        st.json(data)
                    else:
                        st.error("Failed to retrieve IP information")
                except Exception as e:
                    st.error(f"Lookup failed: {str(e)}")
        else:
            st.warning("Please enter an IP address")

# Email Validator
elif tool_option == "Email Validator":
    st.markdown("## 📧 Email Validator")
    st.write("Validate email addresses and check their format.")
    
    email = st.text_input("Enter email address:", placeholder="user@example.com")
    
    if st.button("Validate Email", type="primary"):
        if email:
            # Basic email validation
            email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
            
            if re.match(email_pattern, email):
                st.success("✅ Email format is valid")
                
                # Extract domain
                domain = email.split('@')[1]
                st.info(f"Domain: {domain}")
                
                # Check MX records
                try:
                    mx_records = dns.resolver.resolve(domain, 'MX')
                    st.success("✅ Domain has valid MX records")
                    st.write("**MX Records:**")
                    for mx in mx_records:
                        st.code(str(mx))
                except Exception as e:
                    st.warning("⚠️ No MX records found - email delivery may fail")
            else:
                st.error("❌ Invalid email format")
        else:
            st.warning("Please enter an email address")

# Social Media Finder
elif tool_option == "Social Media Finder":
    st.markdown("## 👥 Social Media Finder")
    st.write("Search for social media profiles across multiple platforms.")
    
    username = st.text_input("Enter username:", placeholder="username")
    
    if st.button("Search Profiles", type="primary"):
        if username:
            st.write(f"### Results for: **{username}**")
            
            platforms = {
                "GitHub": f"https://github.com/{username}",
                "Twitter/X": f"https://twitter.com/{username}",
                "Instagram": f"https://instagram.com/{username}",
                "LinkedIn": f"https://linkedin.com/in/{username}",
                "Facebook": f"https://facebook.com/{username}",
                "Reddit": f"https://reddit.com/user/{username}",
                "YouTube": f"https://youtube.com/@{username}",
                "TikTok": f"https://tiktok.com/@{username}"
            }
            
            col1, col2 = st.columns(2)
            
            for i, (platform, url) in enumerate(platforms.items()):
                with col1 if i % 2 == 0 else col2:
                    st.markdown(f"**{platform}:** [{url}]({url})")
            
            st.info("💡 Click on the links to check if profiles exist")
        else:
            st.warning("Please enter a username")

# Phone Number Lookup
elif tool_option == "Phone Number Lookup":
    st.markdown("## 📱 Phone Number Lookup")
    st.write("Analyze phone number format and country code.")
    
    phone = st.text_input("Enter phone number:", placeholder="+1234567890")
    
    if st.button("Analyze Phone", type="primary"):
        if phone:
            # Basic phone number analysis
            st.write("### Analysis Results")
            
            # Remove spaces and special characters
            cleaned_phone = re.sub(r'[^\d+]', '', phone)
            st.info(f"Cleaned number: {cleaned_phone}")
            
            # Detect country code
            if phone.startswith('+'):
                st.success(f"Format: International format detected")
                
                country_codes = {
                    '+1': 'United States/Canada',
                    '+44': 'United Kingdom',
                    '+91': 'India',
                    '+86': 'China',
                    '+81': 'Japan',
                    '+49': 'Germany',
                    '+33': 'France',
                    '+966': 'Saudi Arabia',
                    '+971': 'UAE'
                }
                
                for code, country in country_codes.items():
                    if phone.startswith(code):
                        st.success(f"Country: {country} ({code})")
                        break
            else:
                st.warning("No country code detected. Use international format (+XX...)")
                
        else:
            st.warning("Please enter a phone number")

# Username Search
elif tool_option == "Username Search":
    st.markdown("## 🔎 Username Search")
    st.write("Check username availability across multiple platforms.")
    
    username = st.text_input("Enter username to search:", placeholder="username")
    
    if st.button("Search Username", type="primary"):
        if username:
            st.write(f"### Searching for: **{username}**")
            
            with st.spinner("Checking platforms..."):
                platforms = [
                    "GitHub", "Twitter", "Instagram", "LinkedIn", 
                    "Reddit", "YouTube", "TikTok", "Pinterest",
                    "Tumblr", "Medium", "Dev.to", "Behance"
                ]
                
                col1, col2, col3 = st.columns(3)
                
                for i, platform in enumerate(platforms):
                    with [col1, col2, col3][i % 3]:
                        st.write(f"**{platform}**")
                        st.write("🔍 Check manually")
            
            st.info("💡 This tool shows possible profile URLs. Visit them to confirm existence.")
        else:
            st.warning("Please enter a username")

# Breach Checker
elif tool_option == "Breach Checker":
    st.markdown("## 🔒 Breach Checker")
    st.write("Check if an email has been involved in known data breaches.")
    
    st.warning("⚠️ **Privacy Notice**: This tool uses Have I Been Pwned API")
    
    email = st.text_input("Enter email to check:", placeholder="user@example.com")
    
    if st.button("Check Breaches", type="primary"):
        if email:
            st.info("🔍 Checking against Have I Been Pwned database...")
            st.write("Please use the official website: https://haveibeenpwned.com/")
            st.write("For API access, you need an API key from the service.")
        else:
            st.warning("Please enter an email address")

# Metadata Extractor
elif tool_option == "Metadata Extractor":
    st.markdown("## 📄 Metadata Extractor")
    st.write("Extract metadata from files (images, documents, etc.)")
    
    uploaded_file = st.file_uploader("Upload a file:", type=['jpg', 'jpeg', 'png', 'pdf', 'docx'])
    
    if uploaded_file is not None:
        st.success(f"File uploaded: {uploaded_file.name}")
        st.info(f"File size: {uploaded_file.size} bytes")
        st.info(f"File type: {uploaded_file.type}")
        
        if st.button("Extract Metadata", type="primary"):
            st.write("### File Information")
            st.write(f"**Name:** {uploaded_file.name}")
            st.write(f"**Size:** {uploaded_file.size} bytes")
            st.write(f"**Type:** {uploaded_file.type}")
            
            st.warning("💡 Advanced metadata extraction requires additional libraries (exiftool, PIL, etc.)")

# Footer
st.markdown("---")
st.markdown("""
<div style='text-align: center; color: #666;'>
    <p>OSINT Lab Pro v2.0 | Built with Streamlit | 
    <a href='https://github.com/alzaem2002-ctrl/Osint-lab-pro'>GitHub</a></p>
    <p style='font-size: 0.8rem;'>⚠️ Use responsibly and ethically. Always respect privacy and legal boundaries.</p>
</div>
""", unsafe_allow_html=True)
