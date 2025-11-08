#!/bin/bash

###############################################################################
# OSINT Lab Pro Deployment Script
# Version: 2.0
# Description: Automated deployment script for OSINT Lab Pro hybrid PWA
###############################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# Configuration
APP_NAME="OSINT Lab Pro"
PORT="${PORT:-8501}"
PYTHON_VERSION="3.8"
VENV_DIR="venv"

###############################################################################
# Helper Functions
###############################################################################

print_header() {
    echo -e "\n${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║${NC}  ${GREEN}$1${NC}"
    echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}\n"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

###############################################################################
# Step 1: System Check
###############################################################################

step1_system_check() {
    print_header "Step 1: System Check"
    
    # Check OS
    print_info "Checking operating system..."
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        print_success "OS: Linux"
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        print_success "OS: macOS"
    elif [[ "$OSTYPE" == "msys" || "$OSTYPE" == "cygwin" ]]; then
        print_success "OS: Windows"
    else
        print_warning "OS: Unknown ($OSTYPE)"
    fi
    
    # Check Python
    print_info "Checking Python installation..."
    if command -v python3 &> /dev/null; then
        PYTHON_CMD="python3"
        PYTHON_VER=$(python3 --version | cut -d' ' -f2)
        print_success "Python found: $PYTHON_VER"
    elif command -v python &> /dev/null; then
        PYTHON_CMD="python"
        PYTHON_VER=$(python --version | cut -d' ' -f2)
        print_success "Python found: $PYTHON_VER"
    else
        print_error "Python not found. Please install Python $PYTHON_VERSION or higher"
        exit 1
    fi
    
    # Check pip
    print_info "Checking pip installation..."
    if command -v pip3 &> /dev/null; then
        PIP_CMD="pip3"
        print_success "pip3 found"
    elif command -v pip &> /dev/null; then
        PIP_CMD="pip"
        print_success "pip found"
    else
        print_error "pip not found. Please install pip"
        exit 1
    fi
    
    # Check git
    print_info "Checking git installation..."
    if command -v git &> /dev/null; then
        GIT_VER=$(git --version | cut -d' ' -f3)
        print_success "Git found: $GIT_VER"
    else
        print_warning "Git not found (optional)"
    fi
    
    print_success "System check completed"
}

###############################################################################
# Step 2: Environment Setup
###############################################################################

step2_environment_setup() {
    print_header "Step 2: Environment Setup"
    
    # Create virtual environment
    if [ ! -d "$VENV_DIR" ]; then
        print_info "Creating virtual environment..."
        $PYTHON_CMD -m venv "$VENV_DIR"
        print_success "Virtual environment created"
    else
        print_info "Virtual environment already exists"
    fi
    
    # Activate virtual environment
    print_info "Activating virtual environment..."
    if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "cygwin" ]]; then
        source "$VENV_DIR/Scripts/activate"
    else
        source "$VENV_DIR/bin/activate"
    fi
    print_success "Virtual environment activated"
    
    # Upgrade pip
    print_info "Upgrading pip..."
    pip install --upgrade pip > /dev/null 2>&1
    print_success "pip upgraded"
    
    print_success "Environment setup completed"
}

###############################################################################
# Step 3: Install Dependencies
###############################################################################

step3_install_dependencies() {
    print_header "Step 3: Install Dependencies"
    
    if [ ! -f "requirements.txt" ]; then
        print_error "requirements.txt not found"
        exit 1
    fi
    
    print_info "Installing Python dependencies..."
    pip install -r requirements.txt
    print_success "Dependencies installed"
    
    # Verify critical packages
    print_info "Verifying installations..."
    python -c "import streamlit; print(f'Streamlit version: {streamlit.__version__}')" && print_success "Streamlit OK"
    python -c "import requests" && print_success "Requests OK"
    python -c "import whois" && print_success "Python-whois OK"
    python -c "import dns.resolver" && print_success "DNSPython OK"
    
    print_success "Dependency installation completed"
}

###############################################################################
# Step 4: Application Configuration
###############################################################################

step4_application_config() {
    print_header "Step 4: Application Configuration"
    
    # Check for streamlit config
    STREAMLIT_CONFIG_DIR="$HOME/.streamlit"
    if [ ! -d "$STREAMLIT_CONFIG_DIR" ]; then
        print_info "Creating Streamlit config directory..."
        mkdir -p "$STREAMLIT_CONFIG_DIR"
    fi
    
    # Create config.toml
    print_info "Creating Streamlit configuration..."
    cat > "$STREAMLIT_CONFIG_DIR/config.toml" << EOF
[server]
port = $PORT
headless = true
enableCORS = false
enableXsrfProtection = true

[browser]
gatherUsageStats = false
serverAddress = "localhost"

[theme]
primaryColor = "#1E88E5"
backgroundColor = "#FFFFFF"
secondaryBackgroundColor = "#F0F2F6"
textColor = "#262730"
font = "sans serif"
EOF
    print_success "Streamlit configuration created"
    
    # Create credentials file
    if [ ! -f "$STREAMLIT_CONFIG_DIR/credentials.toml" ]; then
        print_info "Creating credentials file..."
        cat > "$STREAMLIT_CONFIG_DIR/credentials.toml" << EOF
[general]
email = ""
EOF
        print_success "Credentials file created"
    fi
    
    print_success "Application configuration completed"
}

###############################################################################
# Step 5: Pre-deployment Checks
###############################################################################

step5_predeployment_checks() {
    print_header "Step 5: Pre-deployment Checks"
    
    # Check if streamlit app exists
    if [ ! -f "streamlit_app_v2.py" ]; then
        print_error "streamlit_app_v2.py not found"
        exit 1
    fi
    print_success "Application file found"
    
    # Check if port is available
    print_info "Checking if port $PORT is available..."
    if command -v lsof &> /dev/null; then
        if lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null 2>&1; then
            print_warning "Port $PORT is already in use"
            print_info "Attempting to kill existing process..."
            lsof -ti:$PORT | xargs kill -9 2>/dev/null || true
            sleep 2
        fi
    fi
    print_success "Port $PORT is available"
    
    # Syntax check
    print_info "Checking Python syntax..."
    python -m py_compile streamlit_app_v2.py
    print_success "Syntax check passed"
    
    print_success "Pre-deployment checks completed"
}

###############################################################################
# Step 6: Deploy Application
###############################################################################

step6_deploy() {
    print_header "Step 6: Deploy Application"
    
    print_info "Starting OSINT Lab Pro..."
    print_info "Application will be available at: http://localhost:$PORT"
    print_info ""
    print_warning "Press Ctrl+C to stop the application"
    print_info ""
    
    # Create a simple start script for easier future use
    cat > start_osint_lab.sh << 'EOF'
#!/bin/bash
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"
source venv/bin/activate 2>/dev/null || source venv/Scripts/activate 2>/dev/null
streamlit run streamlit_app_v2.py
EOF
    chmod +x start_osint_lab.sh
    print_success "Created start_osint_lab.sh for quick startup"
    
    # Start the application
    streamlit run streamlit_app_v2.py --server.port=$PORT
}

###############################################################################
# Main Deployment Process
###############################################################################

main() {
    clear
    echo -e "${GREEN}"
    cat << "EOF"
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║    ██████╗ ███████╗██╗███╗   ██╗████████╗                    ║
║   ██╔═══██╗██╔════╝██║████╗  ██║╚══██╔══╝                    ║
║   ██║   ██║███████╗██║██╔██╗ ██║   ██║                       ║
║   ██║   ██║╚════██║██║██║╚██╗██║   ██║                       ║
║   ╚██████╔╝███████║██║██║ ╚████║   ██║                       ║
║    ╚═════╝ ╚══════╝╚═╝╚═╝  ╚═══╝   ╚═╝                       ║
║                                                               ║
║              Lab Pro - Deployment Script v2.0                ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
EOF
    echo -e "${NC}\n"
    
    print_info "Starting deployment process..."
    sleep 1
    
    # Execute deployment steps
    step1_system_check
    sleep 1
    
    step2_environment_setup
    sleep 1
    
    step3_install_dependencies
    sleep 1
    
    step4_application_config
    sleep 1
    
    step5_predeployment_checks
    sleep 1
    
    step6_deploy
}

###############################################################################
# Script Entry Point
###############################################################################

# Parse command line arguments
case "${1:-}" in
    --help|-h)
        echo "OSINT Lab Pro Deployment Script"
        echo ""
        echo "Usage: $0 [options]"
        echo ""
        echo "Options:"
        echo "  --help, -h     Show this help message"
        echo "  --port PORT    Specify port (default: 8501)"
        echo "  --check        Run system check only"
        echo ""
        echo "Environment Variables:"
        echo "  PORT           Override default port (8501)"
        echo ""
        exit 0
        ;;
    --port)
        PORT="$2"
        shift 2
        ;;
    --check)
        step1_system_check
        exit 0
        ;;
esac

# Run main deployment
main

exit 0
