#!/bin/bash

# AI Interview Platform - Production Deployment Script
# This script handles production deployment with zero-downtime updates

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
APP_NAME="ai-interview"
DEPLOY_USER="deploy"
BACKUP_DIR="/var/backups/ai-interview"
LOG_FILE="/var/log/ai-interview-deploy.log"
HEALTH_CHECK_URL="http://localhost:5000/api/health"
MAX_HEALTH_CHECKS=30
HEALTH_CHECK_INTERVAL=2

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1" | tee -a $LOG_FILE
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1" | tee -a $LOG_FILE
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a $LOG_FILE
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a $LOG_FILE
}

# Check if script is run with proper permissions
check_permissions() {
    if [[ $EUID -eq 0 ]]; then
        print_error "This script should not be run as root for security reasons"
        exit 1
    fi
    
    if ! groups $USER | grep -q '\bdocker\b'; then
        print_warning "User $USER is not in docker group. Some commands may require sudo."
    fi
}

# Create necessary directories
setup_directories() {
    print_status "Setting up deployment directories..."
    
    sudo mkdir -p $BACKUP_DIR
    sudo mkdir -p /var/log
    sudo touch $LOG_FILE
    sudo chown $USER:$USER $LOG_FILE
    
    print_success "Directories created"
}

# Backup current deployment
backup_current_deployment() {
    print_status "Creating backup of current deployment..."
    
    local timestamp=$(date +%Y%m%d_%H%M%S)
    local backup_file="$BACKUP_DIR/deployment_backup_$timestamp.tar.gz"
    
    # Backup application files
    tar -czf $backup_file \
        --exclude=node_modules \
        --exclude=.git \
        --exclude=uploads \
        .
    
    # Backup database
    if [ -n "$DATABASE_URL" ]; then
        pg_dump $DATABASE_URL | gzip > "$BACKUP_DIR/database_backup_$timestamp.sql.gz"
        print_success "Database backup created"
    fi
    
    # Backup uploads directory
    if [ -d "uploads" ]; then
        tar -czf "$BACKUP_DIR/uploads_backup_$timestamp.tar.gz" uploads/
        print_success "Uploads backup created"
    fi
    
    print_success "Backup completed: $backup_file"
}

# Health check function
health_check() {
    local url=$1
    local max_attempts=$2
    local interval=$3
    
    print_status "Performing health check..."
    
    for i in $(seq 1 $max_attempts); do
        if curl -f -s $url > /dev/null 2>&1; then
            print_success "Health check passed (attempt $i/$max_attempts)"
            return 0
        fi
        
        print_status "Health check attempt $i/$max_attempts failed, retrying in ${interval}s..."
        sleep $interval
    done
    
    print_error "Health check failed after $max_attempts attempts"
    return 1
}

# Deploy with PM2
deploy_with_pm2() {
    print_status "Deploying with PM2..."
    
    # Install dependencies
    npm ci --production
    
    # Build application
    npm run build
    
    # Check if PM2 process exists
    if pm2 describe $APP_NAME > /dev/null 2>&1; then
        print_status "Reloading existing PM2 process..."
        pm2 reload $APP_NAME --update-env
    else
        print_status "Starting new PM2 process..."
        pm2 start npm --name $APP_NAME -- start
    fi
    
    # Save PM2 configuration
    pm2 save
    
    # Health check
    sleep 5
    if health_check $HEALTH_CHECK_URL $MAX_HEALTH_CHECKS $HEALTH_CHECK_INTERVAL; then
        print_success "PM2 deployment successful"
    else
        print_error "PM2 deployment failed health check"
        return 1
    fi
}

# Deploy with Docker
deploy_with_docker() {
    print_status "Deploying with Docker..."
    
    # Build new image
    docker build -t $APP_NAME:latest .
    
    # Stop existing container gracefully
    if docker ps -q -f name=$APP_NAME > /dev/null; then
        print_status "Stopping existing container..."
        docker stop $APP_NAME || true
        docker rm $APP_NAME || true
    fi
    
    # Start new container
    docker run -d \
        --name $APP_NAME \
        --restart unless-stopped \
        -p 5000:5000 \
        --env-file .env \
        $APP_NAME:latest
    
    # Health check
    sleep 10
    if health_check $HEALTH_CHECK_URL $MAX_HEALTH_CHECKS $HEALTH_CHECK_INTERVAL; then
        print_success "Docker deployment successful"
        
        # Clean up old images
        docker image prune -f
    else
        print_error "Docker deployment failed health check"
        return 1
    fi
}

# Deploy with Docker Compose
deploy_with_docker_compose() {
    print_status "Deploying with Docker Compose..."
    
    # Pull latest images and rebuild
    docker-compose pull
    docker-compose build --no-cache
    
    # Deploy with zero downtime
    docker-compose up -d --remove-orphans
    
    # Health check
    sleep 15
    if health_check $HEALTH_CHECK_URL $MAX_HEALTH_CHECKS $HEALTH_CHECK_INTERVAL; then
        print_success "Docker Compose deployment successful"
        
        # Clean up
        docker image prune -f
        docker container prune -f
    else
        print_error "Docker Compose deployment failed health check"
        return 1
    fi
}

# Deploy with Systemd
deploy_with_systemd() {
    print_status "Deploying with Systemd..."
    
    # Install dependencies and build
    npm ci --production
    npm run build
    
    # Restart service
    sudo systemctl restart $APP_NAME
    
    # Check service status
    sleep 5
    if sudo systemctl is-active --quiet $APP_NAME; then
        print_success "Systemd service restarted successfully"
        
        # Health check
        if health_check $HEALTH_CHECK_URL $MAX_HEALTH_CHECKS $HEALTH_CHECK_INTERVAL; then
            print_success "Systemd deployment successful"
        else
            print_error "Systemd deployment failed health check"
            return 1
        fi
    else
        print_error "Systemd service failed to start"
        sudo systemctl status $APP_NAME
        return 1
    fi
}

# Database migrations
run_migrations() {
    print_status "Running database migrations..."
    
    if npm run db:push; then
        print_success "Database migrations completed"
    else
        print_error "Database migrations failed"
        return 1
    fi
}

# Update environment and dependencies
update_dependencies() {
    print_status "Updating dependencies..."
    
    # Check for package.json changes
    if git diff HEAD~1 HEAD --name-only | grep -q package.json; then
        print_status "package.json changed, updating dependencies..."
        npm ci --production
    else
        print_status "No package.json changes detected"
    fi
}

# Verify deployment
verify_deployment() {
    print_status "Verifying deployment..."
    
    # Check application endpoints
    local endpoints=(
        "/api/health"
        "/api/jobs"
        "/api/dashboard/stats"
    )
    
    for endpoint in "${endpoints[@]}"; do
        local url="http://localhost:5000$endpoint"
        if curl -f -s $url > /dev/null 2>&1; then
            print_success "Endpoint $endpoint is responding"
        else
            print_warning "Endpoint $endpoint is not responding"
        fi
    done
    
    # Check log files for errors
    if [ -f "/var/log/$APP_NAME.log" ]; then
        local error_count=$(tail -100 "/var/log/$APP_NAME.log" | grep -i error | wc -l)
        if [ $error_count -gt 0 ]; then
            print_warning "Found $error_count errors in recent logs"
        else
            print_success "No errors found in recent logs"
        fi
    fi
}

# Rollback function
rollback_deployment() {
    print_error "Deployment failed. Attempting rollback..."
    
    local latest_backup=$(ls -t $BACKUP_DIR/deployment_backup_*.tar.gz 2>/dev/null | head -1)
    
    if [ -n "$latest_backup" ]; then
        print_status "Rolling back to: $latest_backup"
        
        # Extract backup
        tar -xzf $latest_backup
        
        # Restart services based on deployment method
        case $DEPLOY_METHOD in
            pm2)
                pm2 restart $APP_NAME
                ;;
            docker)
                docker restart $APP_NAME
                ;;
            docker-compose)
                docker-compose restart
                ;;
            systemd)
                sudo systemctl restart $APP_NAME
                ;;
        esac
        
        print_success "Rollback completed"
    else
        print_error "No backup found for rollback"
        exit 1
    fi
}

# Cleanup old backups
cleanup_old_backups() {
    print_status "Cleaning up old backups..."
    
    # Keep last 7 days of backups
    find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete
    find $BACKUP_DIR -name "*.sql.gz" -mtime +7 -delete
    
    print_success "Old backups cleaned up"
}

# Send deployment notification
send_notification() {
    local status=$1
    local message="AI Interview Platform deployment $status on $(hostname) at $(date)"
    
    # Slack notification
    if [ -n "$SLACK_WEBHOOK_URL" ]; then
        curl -X POST -H 'Content-type: application/json' \
            --data "{\"text\":\"$message\"}" \
            $SLACK_WEBHOOK_URL > /dev/null 2>&1
    fi
    
    # Teams notification
    if [ -n "$TEAMS_WEBHOOK_URL" ]; then
        curl -X POST -H 'Content-Type: application/json' \
            --data "{\"text\":\"$message\"}" \
            $TEAMS_WEBHOOK_URL > /dev/null 2>&1
    fi
    
    # Email notification (if configured)
    if command -v mail &> /dev/null && [ -n "$ADMIN_EMAIL" ]; then
        echo "$message" | mail -s "Deployment $status" $ADMIN_EMAIL
    fi
}

# Main deployment function
main() {
    local deploy_method=${1:-pm2}
    
    echo ""
    print_status "Starting AI Interview Platform deployment..."
    print_status "Deployment method: $deploy_method"
    print_status "Timestamp: $(date)"
    echo ""
    
    # Set global variable for rollback
    DEPLOY_METHOD=$deploy_method
    
    # Setup
    check_permissions
    setup_directories
    
    # Pre-deployment steps
    backup_current_deployment
    update_dependencies
    
    # Run migrations
    if ! run_migrations; then
        send_notification "FAILED"
        exit 1
    fi
    
    # Deploy based on method
    case $deploy_method in
        pm2)
            if ! deploy_with_pm2; then
                rollback_deployment
                send_notification "FAILED"
                exit 1
            fi
            ;;
        docker)
            if ! deploy_with_docker; then
                rollback_deployment
                send_notification "FAILED"
                exit 1
            fi
            ;;
        docker-compose)
            if ! deploy_with_docker_compose; then
                rollback_deployment
                send_notification "FAILED"
                exit 1
            fi
            ;;
        systemd)
            if ! deploy_with_systemd; then
                rollback_deployment
                send_notification "FAILED"
                exit 1
            fi
            ;;
        *)
            print_error "Unknown deployment method: $deploy_method"
            print_status "Supported methods: pm2, docker, docker-compose, systemd"
            exit 1
            ;;
    esac
    
    # Post-deployment steps
    verify_deployment
    cleanup_old_backups
    
    echo ""
    print_success "Deployment completed successfully!"
    print_status "Application is running and healthy"
    echo ""
    
    send_notification "SUCCESS"
}

# Script usage
usage() {
    echo "Usage: $0 [deployment-method]"
    echo ""
    echo "Deployment methods:"
    echo "  pm2              Deploy using PM2 process manager (default)"
    echo "  docker           Deploy using Docker container"
    echo "  docker-compose   Deploy using Docker Compose"
    echo "  systemd          Deploy using Systemd service"
    echo ""
    echo "Examples:"
    echo "  $0                 # Deploy with PM2 (default)"
    echo "  $0 docker          # Deploy with Docker"
    echo "  $0 docker-compose  # Deploy with Docker Compose"
    echo "  $0 systemd         # Deploy with Systemd"
    echo ""
}

# Handle script arguments
if [ "$1" = "-h" ] || [ "$1" = "--help" ]; then
    usage
    exit 0
fi

# Run main function
main "$@"