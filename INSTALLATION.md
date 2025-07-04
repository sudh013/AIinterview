# AI Interview Platform - Installation Guide

Complete installation guide for deploying the AI Interview Platform on any system.

## Quick Start

```bash
# Clone the repository
git clone <your-repository-url>
cd ai-interview-platform

# Run the setup script
chmod +x setup.sh
./setup.sh

# Configure environment variables
cp .env.example .env
# Edit .env with your credentials

# Start the application
npm run dev
```

## System Requirements

### Minimum Requirements
- **Node.js**: Version 18.0 or higher
- **npm**: Version 8.0 or higher
- **PostgreSQL**: Version 12 or higher
- **RAM**: 2GB minimum, 4GB recommended
- **Storage**: 10GB minimum, 50GB recommended
- **OS**: Linux (Ubuntu 20.04+), macOS (10.15+), Windows 10+

### Recommended Production Setup
- **CPU**: 2+ cores
- **RAM**: 8GB+
- **Storage**: 100GB+ SSD
- **Network**: Stable internet connection
- **SSL Certificate**: For HTTPS in production

## Installation Methods

### Method 1: Automated Setup Script

The easiest way to install the platform:

```bash
# Make setup script executable
chmod +x setup.sh

# Run automated setup
./setup.sh
```

The script will:
- Check system requirements
- Install Node.js if needed
- Install project dependencies
- Create environment configuration
- Set up database schema
- Create deployment configurations

### Method 2: Manual Installation

#### Step 1: Install Dependencies

**On Ubuntu/Debian:**
```bash
# Update package list
sudo apt update

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib

# Install Git (if not installed)
sudo apt install git
```

**On macOS:**
```bash
# Install Homebrew (if not installed)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install Node.js
brew install node@18

# Install PostgreSQL
brew install postgresql
brew services start postgresql

# Install Git (if not installed)
brew install git
```

**On Windows:**
1. Download and install Node.js 18+ from [nodejs.org](https://nodejs.org/)
2. Download and install PostgreSQL from [postgresql.org](https://www.postgresql.org/)
3. Download and install Git from [git-scm.com](https://git-scm.com/)

#### Step 2: Clone and Setup Project

```bash
# Clone repository
git clone <your-repository-url>
cd ai-interview-platform

# Install dependencies
npm install

# Copy environment template
cp .env.example .env
```

#### Step 3: Configure Environment

Edit `.env` file with your configuration:

```bash
# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/ai_interview_db

# OpenAI Configuration (Required)
OPENAI_API_KEY=sk-your-openai-api-key

# Email Service Configuration (Required for email features)
BREVO_API_KEY=your-brevo-api-key

# Session Security (Auto-generated)
SESSION_SECRET=your-random-secret-here

# Application Configuration
NODE_ENV=production
PORT=5000

# Optional: Calendar Integration
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Optional: Communication Integration
SLACK_BOT_TOKEN=xoxb-your-slack-bot-token
TEAMS_WEBHOOK_URL=https://your-teams-webhook-url
```

#### Step 4: Database Setup

```bash
# Create database
createdb ai_interview_db

# Run database migrations
npm run db:push

# Verify database setup
npm run db:studio  # Opens database GUI
```

#### Step 5: Build and Start

```bash
# Build the application
npm run build

# Start production server
npm start

# Or start development server
npm run dev
```

## Database Configuration

### Local PostgreSQL Setup

```bash
# Create user and database
sudo -u postgres psql
postgres=# CREATE USER ai_interview_user WITH PASSWORD 'your_password';
postgres=# CREATE DATABASE ai_interview_db OWNER ai_interview_user;
postgres=# GRANT ALL PRIVILEGES ON DATABASE ai_interview_db TO ai_interview_user;
postgres=# \q

# Update DATABASE_URL in .env
DATABASE_URL=postgresql://ai_interview_user:your_password@localhost:5432/ai_interview_db
```

### Cloud Database Options

#### Neon (Recommended)
1. Visit [neon.tech](https://neon.tech)
2. Create free account and database
3. Copy connection string to `DATABASE_URL`

#### Supabase
1. Visit [supabase.com](https://supabase.com)
2. Create project and database
3. Copy PostgreSQL connection string

#### AWS RDS
1. Create PostgreSQL instance in AWS RDS
2. Configure security groups and networking
3. Use connection details in `DATABASE_URL`

## API Keys Setup

### OpenAI API Key (Required)
1. Visit [platform.openai.com](https://platform.openai.com)
2. Create account and generate API key
3. Add to `.env` as `OPENAI_API_KEY`

### Brevo Email Service (Required for emails)
1. Visit [brevo.com](https://brevo.com) (formerly Sendinblue)
2. Create account and generate API key
3. Add to `.env` as `BREVO_API_KEY`

### Calendar Integration (Optional)
#### Google Calendar
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create project and enable Calendar API
3. Create OAuth 2.0 credentials
4. Add client ID and secret to `.env`

#### Microsoft Outlook
1. Go to [Azure Portal](https://portal.azure.com)
2. Register application in Azure AD
3. Configure Microsoft Graph permissions
4. Add credentials to `.env`

### Communication Integration (Optional)
#### Slack
1. Create Slack app at [api.slack.com](https://api.slack.com)
2. Install app to workspace
3. Copy bot token to `.env`

#### Microsoft Teams
1. Create webhook in Teams channel
2. Copy webhook URL to `.env`

## Deployment Options

### Option 1: Traditional Server Deployment

```bash
# Install PM2 for process management
npm install -g pm2

# Start application with PM2
pm2 start npm --name "ai-interview" -- start

# Save PM2 configuration
pm2 save
pm2 startup
```

### Option 2: Docker Deployment

```bash
# Build Docker image
docker build -t ai-interview-platform .

# Run with Docker Compose
docker-compose up -d

# View logs
docker-compose logs -f
```

### Option 3: Systemd Service (Linux)

The setup script creates a systemd service:

```bash
# Start service
sudo systemctl start ai-interview

# Enable auto-start on boot
sudo systemctl enable ai-interview

# Check status
sudo systemctl status ai-interview

# View logs
journalctl -u ai-interview -f
```

### Option 4: Replit Deployment

1. Fork the project on Replit
2. Configure environment variables in Secrets
3. Run the project
4. Use Replit's built-in deployment features

## Web Server Configuration

### Nginx Reverse Proxy

```nginx
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;

    client_max_body_size 100M;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Apache Virtual Host

```apache
<VirtualHost *:80>
    ServerName your-domain.com
    Redirect permanent / https://your-domain.com/
</VirtualHost>

<VirtualHost *:443>
    ServerName your-domain.com
    
    SSLEngine on
    SSLCertificateFile /path/to/certificate.crt
    SSLCertificateKeyFile /path/to/private.key
    
    ProxyPreserveHost On
    ProxyPass / http://localhost:5000/
    ProxyPassReverse / http://localhost:5000/
    
    # WebSocket support
    ProxyPass /ws/ ws://localhost:5000/ws/
    ProxyPassReverse /ws/ ws://localhost:5000/ws/
</VirtualHost>
```

## SSL Certificate Setup

### Let's Encrypt (Free)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Generate certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

## Backup and Monitoring

### Automated Backup

The setup script creates `backup.sh`:

```bash
# Make executable
chmod +x backup.sh

# Run backup manually
./backup.sh

# Schedule with cron
crontab -e
# Add: 0 2 * * * /path/to/backup.sh
```

### Monitoring

#### PM2 Monitoring
```bash
# View processes
pm2 list

# Monitor logs
pm2 logs

# Monitor performance
pm2 monit
```

#### System Monitoring
```bash
# Check disk usage
df -h

# Check memory usage
free -h

# Check running processes
htop
```

## Troubleshooting

### Common Issues

#### Database Connection Errors
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Check database connectivity
psql $DATABASE_URL -c "SELECT 1;"

# Reset database
npm run db:push --force
```

#### Permission Errors
```bash
# Fix file permissions
chmod 755 setup.sh
chmod 644 .env

# Fix ownership
sudo chown -R $USER:$USER .
```

#### Port Already in Use
```bash
# Find process using port 5000
lsof -i :5000

# Kill process
kill -9 <PID>

# Change port in .env
PORT=3000
```

#### OpenAI API Errors
- Verify API key is correct
- Check API usage limits
- Ensure sufficient credits

#### Email Service Errors
- Verify Brevo API key
- Check email sending limits
- Configure sender domain

### Log Files

```bash
# Application logs (PM2)
pm2 logs ai-interview

# System logs (systemd)
journalctl -u ai-interview -f

# Nginx logs
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log

# Docker logs
docker-compose logs -f
```

## Performance Optimization

### Production Settings

```bash
# .env production configuration
NODE_ENV=production
PORT=5000

# Enable compression
npm install compression
```

### Database Optimization

```sql
-- Create indexes for better performance
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_applications_job_id ON job_applications(job_id);
CREATE INDEX idx_interviews_status ON interviews(status);
CREATE INDEX idx_interviews_created ON interviews(created_at);
```

### Nginx Caching

```nginx
# Add to nginx configuration
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

## Security Considerations

### Environment Security
- Never commit `.env` files
- Use strong passwords
- Rotate API keys regularly
- Enable database SSL

### Application Security
- Keep dependencies updated
- Use HTTPS in production
- Implement rate limiting
- Regular security audits

### Network Security
- Configure firewall rules
- Use VPN for database access
- Monitor access logs
- Regular security updates

## Support and Maintenance

### Regular Maintenance
1. Update dependencies monthly
2. Monitor disk space and performance
3. Review and rotate API keys quarterly
4. Test backup and restore procedures
5. Update SSL certificates before expiry

### Getting Help
- Check application logs first
- Review this documentation
- Check the GitHub issues
- Contact support team

## Scaling Considerations

### Horizontal Scaling
- Use load balancer (nginx, HAProxy)
- Multiple application instances
- Shared database and file storage
- Session store (Redis)

### Vertical Scaling
- Increase server resources
- Optimize database queries
- Use CDN for static files
- Implement caching layers

## Version Updates

```bash
# Check current version
npm list ai-interview-platform

# Update to latest version
git pull origin main
npm install
npm run db:push
npm run build
pm2 restart ai-interview
```

---

For additional support or questions, please refer to the project documentation or contact the development team.