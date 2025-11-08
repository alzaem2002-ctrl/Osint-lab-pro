"""
OSINT Lab Pro - Fixed/Simplified Version
A streamlined OSINT toolkit with essential features
"""

import streamlit as st
import requests
import socket
import re

# Page configuration
st.set_page_config(
    page_title="OSINT Lab Pro",
    page_icon="🔍",
    layout="wide"
)

# Header
st.title("🔍 OSINT Lab Pro")
st.markdown("### Professional Open Source Intelligence Toolkit")
st.markdown("---")

# Sidebar
st.sidebar.title("Navigation")
page = st.sidebar.radio(
    "Select Tool:",
    ["Home", "IP Lookup", "Domain Info", "Email Check", "Username Search"]
)

# Home Page
if page == "Home":
    st.header("Welcome to OSINT Lab Pro")
    
    col1, col2 = st.columns(2)
    
    with col1:
        st.info("""
        **🌐 Network Tools**
        - IP Geolocation
        - Domain Information
        - DNS Lookup
        """)
        
    with col2:
        st.success("""
        **👤 Identity Tools**
        - Email Validation
        - Username Search
        - Social Media Finder
        """)
    
    st.warning("⚠️ **Use Responsibly**: This tool is for legal security research only.")

# IP Lookup
elif page == "IP Lookup":
    st.header("🌍 IP Address Lookup")
    
    ip = st.text_input("Enter IP Address:", placeholder="8.8.8.8")
    
    if st.button("Lookup"):
        if ip:
            try:
                with st.spinner("Looking up IP..."):
                    response = requests.get(f"http://ip-api.com/json/{ip}", timeout=5)
                    if response.status_code == 200:
                        data = response.json()
                        
                        if data.get('status') == 'success':
                            col1, col2, col3 = st.columns(3)
                            
                            with col1:
                                st.metric("Country", data.get('country', 'N/A'))
                                st.metric("Region", data.get('regionName', 'N/A'))
                            
                            with col2:
                                st.metric("City", data.get('city', 'N/A'))
                                st.metric("Zip Code", data.get('zip', 'N/A'))
                            
                            with col3:
                                st.metric("ISP", data.get('isp', 'N/A'))
                                st.metric("Timezone", data.get('timezone', 'N/A'))
                            
                            st.success("✅ Lookup successful!")
                            
                            with st.expander("View Full Details"):
                                st.json(data)
                        else:
                            st.error("❌ Invalid IP address or lookup failed")
                    else:
                        st.error("❌ API request failed")
            except Exception as e:
                st.error(f"❌ Error: {str(e)}")
        else:
            st.warning("⚠️ Please enter an IP address")

# Domain Info
elif page == "Domain Info":
    st.header("🌐 Domain Information")
    
    domain = st.text_input("Enter Domain:", placeholder="example.com")
    
    if st.button("Analyze"):
        if domain:
            try:
                # IP Resolution
                st.subheader("IP Address")
                try:
                    ip = socket.gethostbyname(domain)
                    st.success(f"✅ IP: {ip}")
                except Exception as e:
                    st.error(f"❌ IP resolution failed: {str(e)}")
                
                # Basic domain validation
                st.subheader("Domain Validation")
                pattern = r'^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}$'
                if re.match(pattern, domain.lower()):
                    st.success("✅ Valid domain format")
                else:
                    st.warning("⚠️ Unusual domain format")
                    
            except Exception as e:
                st.error(f"❌ Error: {str(e)}")
        else:
            st.warning("⚠️ Please enter a domain name")

# Email Check
elif page == "Email Check":
    st.header("📧 Email Validation")
    
    email = st.text_input("Enter Email:", placeholder="user@example.com")
    
    if st.button("Validate"):
        if email:
            # Email validation
            pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
            
            if re.match(pattern, email):
                st.success("✅ Email format is valid")
                
                # Extract domain
                domain = email.split('@')[1]
                st.info(f"📧 Domain: {domain}")
                
                # Check if domain resolves
                try:
                    ip = socket.gethostbyname(domain)
                    st.success(f"✅ Domain resolves to: {ip}")
                except Exception:
                    st.warning("⚠️ Domain does not resolve")
            else:
                st.error("❌ Invalid email format")
        else:
            st.warning("⚠️ Please enter an email address")

# Username Search
elif page == "Username Search":
    st.header("🔎 Username Search")
    
    username = st.text_input("Enter Username:", placeholder="username")
    
    if st.button("Search"):
        if username:
            st.write(f"### Possible profiles for: **{username}**")
            
            platforms = {
                "GitHub": f"https://github.com/{username}",
                "Twitter": f"https://twitter.com/{username}",
                "Instagram": f"https://instagram.com/{username}",
                "LinkedIn": f"https://linkedin.com/in/{username}",
                "Reddit": f"https://reddit.com/user/{username}",
                "YouTube": f"https://youtube.com/@{username}"
            }
            
            col1, col2 = st.columns(2)
            
            for i, (platform, url) in enumerate(platforms.items()):
                with col1 if i % 2 == 0 else col2:
                    st.markdown(f"**{platform}**: [{url}]({url})")
            
            st.info("💡 Click links to verify if profiles exist")
        else:
            st.warning("⚠️ Please enter a username")

# Footer
st.markdown("---")
st.markdown("""
<div style='text-align: center; color: #666;'>
    <p>OSINT Lab Pro | Built with Streamlit</p>
    <p style='font-size: 0.8rem;'>⚠️ For legal and ethical use only</p>
</div>
""", unsafe_allow_html=True)
