#!/bin/bash

# AI Interview Platform Setup Script
# This script sets up the complete AI Interview Platform on any system

set -e  # Exit on any error

echo "🚀 AI Interview Platform Setup Script"
echo "======================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running on supported OS
check_os() {
    print_status "Checking operating system..."
    
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        OS="linux"
        print_success "Linux detected"
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        OS="macos"
        print_success "macOS detected"
    elif [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "cygwin" ]]; then
        OS="windows"
        print_success "Windows detected"
    else
        print_error "Unsupported operating system: $OSTYPE"
        exit 1
    fi
}

# Check for required tools
check_requirements() {
    print_status "Checking system requirements..."
    
    # Check Node.js
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version)
        print_success "Node.js found: $NODE_VERSION"
        
        # Check if Node.js version is 18 or higher
        NODE_MAJOR=$(echo $NODE_VERSION | cut -d'.' -f1 | sed 's/v//')
        if [ "$NODE_MAJOR" -lt 18 ]; then
            print_warning "Node.js version 18+ required. Current: $NODE_VERSION"
            install_nodejs=true
        fi
    else
        print_warning "Node.js not found"
        install_nodejs=true
    fi
    
    # Check npm
    if command -v npm &> /dev/null; then
        NPM_VERSION=$(npm --version)
        print_success "npm found: $NPM_VERSION"
    else
        print_warning "npm not found"
        install_nodejs=true
    fi
    
    # Check git
    if command -v git &> /dev/null; then
        GIT_VERSION=$(git --version)
        print_success "Git found: $GIT_VERSION"
    else
        print_error "Git is required but not installed"
        exit 1
    fi
}

# Install Node.js if needed
install_nodejs() {
    if [ "$install_nodejs" = true ]; then
        print_status "Installing Node.js..."
        
        if [[ "$OS" == "linux" ]]; then
            # Install Node.js via NodeSource repository
            curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
            sudo apt-get install -y nodejs
        elif [[ "$OS" == "macos" ]]; then
            # Install via Homebrew if available, otherwise download directly
            if command -v brew &> /dev/null; then
                brew install node@18
            else
                print_error "Please install Node.js 18+ manually from https://nodejs.org/"
                exit 1
            fi
        elif [[ "$OS" == "windows" ]]; then
            print_error "Please install Node.js 18+ manually from https://nodejs.org/"
            exit 1
        fi
        
        print_success "Node.js installed successfully"
    fi
}

# Create environment file
create_env_file() {
    print_status "Creating environment configuration..."
    
    if [ ! -f .env ]; then
        cat > .env << EOF
# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/ai_interview_db

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here

# Email Service Configuration (Brevo)
BREVO_API_KEY=your_brevo_api_key_here

# Session Security
SESSION_SECRET=$(openssl rand -base64 32)

# Application Configuration
NODE_ENV=production
PORT=5000

# Calendar Integration (Optional)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
OUTLOOK_CLIENT_ID=your_outlook_client_id
OUTLOOK_CLIENT_SECRET=your_outlook_client_secret

# Slack Integration (Optional)
SLACK_BOT_TOKEN=your_slack_bot_token
SLACK_SIGNING_SECRET=your_slack_signing_secret

# Teams Integration (Optional)
TEAMS_WEBHOOK_URL=your_teams_webhook_url
EOF
        print_success "Environment file created: .env"
        print_warning "Please update .env with your actual API keys and database credentials"
    else
        print_warning ".env file already exists. Skipping creation."
    fi
}

# Install dependencies
install_dependencies() {
    print_status "Installing project dependencies..."
    
    if [ -f package.json ]; then
        npm install
        print_success "Dependencies installed successfully"
    else
        print_error "package.json not found. Make sure you're in the correct directory."
        exit 1
    fi
}

# Setup database
setup_database() {
    print_status "Setting up database..."
    
    # Check if DATABASE_URL is configured
    if grep -q "postgresql://username:password" .env; then
        print_warning "Please configure your DATABASE_URL in .env before running database setup"
        print_status "You can:"
        print_status "1. Use a local PostgreSQL instance"
        print_status "2. Use a cloud provider like Neon, Supabase, or AWS RDS"
        print_status "3. Run: npm run db:push (after configuring DATABASE_URL)"
        return
    fi
    
    # Try to push database schema
    if npm run db:push; then
        print_success "Database schema deployed successfully"
    else
        print_warning "Database setup failed. Please check your DATABASE_URL and try: npm run db:push"
    fi
}

# Create systemd service (Linux only)
create_systemd_service() {
    if [[ "$OS" == "linux" ]] && command -v systemctl &> /dev/null; then
        print_status "Creating systemd service..."
        
        CURRENT_DIR=$(pwd)
        USER=$(whoami)
        
        sudo tee /etc/systemd/system/ai-interview.service > /dev/null << EOF
[Unit]
Description=AI Interview Platform
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=$CURRENT_DIR
Environment=NODE_ENV=production
ExecStart=/usr/bin/npm start
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF
        
        sudo systemctl daemon-reload
        sudo systemctl enable ai-interview.service
        
        print_success "Systemd service created: ai-interview.service"
        print_status "Start with: sudo systemctl start ai-interview"
        print_status "Check status: sudo systemctl status ai-interview"
    fi
}

# Create Docker configuration
create_docker_config() {
    print_status "Creating Docker configuration..."
    
    # Create Dockerfile
    cat > Dockerfile << EOF
# Use Node.js 18 Alpine Linux as base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application code
COPY . .

# Build the application
RUN npm run build

# Expose port
EXPOSE 5000

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Change ownership
RUN chown -R nodejs:nodejs /app
USER nodejs

# Start the application
CMD ["npm", "start"]
EOF

    # Create docker-compose.yml
    cat > docker-compose.yml << EOF
version: '3.8'

services:
  app:
    build: .
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
    env_file:
      - .env
    depends_on:
      - postgres
    restart: unless-stopped

  postgres:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=ai_interview_db
      - POSTGRES_USER=ai_interview_user
      - POSTGRES_PASSWORD=secure_password_here
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    restart: unless-stopped

volumes:
  postgres_data:
EOF

    # Create .dockerignore
    cat > .dockerignore << EOF
node_modules
.env.local
.env.development
.git
.gitignore
README.md
.next
.vscode
.DS_Store
npm-debug.log*
yarn-debug.log*
yarn-error.log*
*.log
uploads/*.mp4
uploads/*.webm
EOF

    print_success "Docker configuration created"
    print_status "Run with: docker-compose up -d"
}

# Create nginx configuration
create_nginx_config() {
    print_status "Creating Nginx configuration..."
    
    cat > nginx.conf << EOF
server {
    listen 80;
    server_name your-domain.com;

    # Redirect HTTP to HTTPS
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    # SSL Configuration (update paths to your certificates)
    ssl_certificate /path/to/your/certificate.crt;
    ssl_certificate_key /path/to/your/private.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;

    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload";

    # File upload size limit
    client_max_body_size 100M;

    # Proxy to Node.js application
    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 300s;
        proxy_send_timeout 300s;
    }

    # Static file serving optimization
    location /uploads/ {
        alias /path/to/your/app/uploads/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
EOF

    print_success "Nginx configuration created: nginx.conf"
    print_warning "Update server_name and SSL certificate paths before using"
}

# Create backup script
create_backup_script() {
    print_status "Creating backup script..."
    
    cat > backup.sh << 'EOF'
#!/bin/bash

# AI Interview Platform Backup Script

set -e

BACKUP_DIR="/var/backups/ai-interview"
DATE=$(date +%Y%m%d_%H%M%S)
DB_BACKUP_FILE="$BACKUP_DIR/database_$DATE.sql"
FILES_BACKUP_FILE="$BACKUP_DIR/files_$DATE.tar.gz"

# Create backup directory
mkdir -p $BACKUP_DIR

# Database backup
echo "Creating database backup..."
pg_dump $DATABASE_URL > $DB_BACKUP_FILE
gzip $DB_BACKUP_FILE

# Files backup
echo "Creating files backup..."
tar -czf $FILES_BACKUP_FILE uploads/ .env

# Clean old backups (keep last 7 days)
find $BACKUP_DIR -type f -mtime +7 -delete

echo "Backup completed: $DATE"
echo "Database: ${DB_BACKUP_FILE}.gz"
echo "Files: $FILES_BACKUP_FILE"
EOF

    chmod +x backup.sh
    print_success "Backup script created: backup.sh"
}

# Main setup function
main() {
    echo ""
    print_status "Starting AI Interview Platform setup..."
    echo ""
    
    check_os
    check_requirements
    install_nodejs
    
    print_status "Installing project dependencies..."
    install_dependencies
    
    print_status "Creating configuration files..."
    create_env_file
    create_docker_config
    create_nginx_config
    create_systemd_service
    create_backup_script
    
    print_status "Setting up database..."
    setup_database
    
    echo ""
    print_success "Setup completed successfully!"
    echo ""
    echo "Next steps:"
    echo "1. Update .env with your API keys and database credentials"
    echo "2. Configure your database (PostgreSQL)"
    echo "3. Run database migrations: npm run db:push"
    echo "4. Start the application:"
    echo "   - Development: npm run dev"
    echo "   - Production: npm start"
    echo "   - Docker: docker-compose up -d"
    echo "   - Systemd: sudo systemctl start ai-interview"
    echo ""
    echo "For detailed setup instructions, see: INSTALLATION.md"
    echo ""
}

# Run main function
main "$@"