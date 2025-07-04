# AI Interview Platform - Makefile
# Simple commands for project management

.PHONY: help setup install dev build start stop restart status logs health deploy clean backup

# Default target
help:
	@echo "AI Interview Platform - Available Commands"
	@echo "=========================================="
	@echo ""
	@echo "Setup Commands:"
	@echo "  make setup          Run automated setup script"
	@echo "  make install        Install dependencies only"
	@echo ""
	@echo "Development Commands:"
	@echo "  make dev            Start development server"
	@echo "  make build          Build application for production"
	@echo "  make start          Start production server"
	@echo ""
	@echo "Database Commands:"
	@echo "  make db-push        Deploy database schema"
	@echo "  make db-studio      Open database GUI"
	@echo ""
	@echo "Management Commands:"
	@echo "  make stop           Stop application"
	@echo "  make restart        Restart application"
	@echo "  make status         Check application status"
	@echo "  make logs           View application logs"
	@echo "  make health         Check application health"
	@echo ""
	@echo "Deployment Commands:"
	@echo "  make deploy         Deploy with PM2 (default)"
	@echo "  make deploy-docker  Deploy with Docker"
	@echo "  make deploy-compose Deploy with Docker Compose"
	@echo "  make deploy-systemd Deploy with Systemd"
	@echo ""
	@echo "Maintenance Commands:"
	@echo "  make backup         Create backup"
	@echo "  make clean          Clean temporary files"
	@echo ""

# Setup and Installation
setup:
	@echo "Running automated setup..."
	@chmod +x setup.sh
	@./setup.sh

install:
	@echo "Installing dependencies..."
	@npm install

# Development
dev:
	@echo "Starting development server..."
	@npm run dev

build:
	@echo "Building application..."
	@npm run build

start:
	@echo "Starting production server..."
	@npm start

# Database
db-push:
	@echo "Deploying database schema..."
	@npm run db:push

db-studio:
	@echo "Opening database GUI..."
	@npm run db:studio

# Application Management
stop:
	@echo "Stopping application..."
	@pm2 stop ai-interview 2>/dev/null || \
	 sudo systemctl stop ai-interview 2>/dev/null || \
	 docker stop ai-interview 2>/dev/null || \
	 echo "No running application found"

restart:
	@echo "Restarting application..."
	@pm2 restart ai-interview 2>/dev/null || \
	 sudo systemctl restart ai-interview 2>/dev/null || \
	 docker restart ai-interview 2>/dev/null || \
	 echo "No application to restart"

status:
	@echo "Checking application status..."
	@pm2 describe ai-interview 2>/dev/null || \
	 sudo systemctl status ai-interview 2>/dev/null || \
	 docker ps -f name=ai-interview 2>/dev/null || \
	 echo "No application found"

logs:
	@echo "Viewing application logs..."
	@pm2 logs ai-interview 2>/dev/null || \
	 sudo journalctl -u ai-interview -f 2>/dev/null || \
	 docker logs -f ai-interview 2>/dev/null || \
	 echo "No logs available"

health:
	@echo "Checking application health..."
	@curl -f http://localhost:5000/api/health >/dev/null 2>&1 && \
	 echo "✅ Application is healthy" || \
	 echo "❌ Application health check failed"

# Deployment
deploy:
	@echo "Deploying with PM2..."
	@chmod +x deploy.sh
	@./deploy.sh pm2

deploy-docker:
	@echo "Deploying with Docker..."
	@chmod +x deploy.sh
	@./deploy.sh docker

deploy-compose:
	@echo "Deploying with Docker Compose..."
	@chmod +x deploy.sh
	@./deploy.sh docker-compose

deploy-systemd:
	@echo "Deploying with Systemd..."
	@chmod +x deploy.sh
	@./deploy.sh systemd

# Maintenance
backup:
	@echo "Creating backup..."
	@chmod +x backup.sh
	@./backup.sh

clean:
	@echo "Cleaning temporary files..."
	@rm -rf node_modules/.cache
	@rm -rf dist
	@rm -rf .next
	@rm -rf uploads/*.tmp
	@echo "Cleanup completed"

# Environment setup
env:
	@echo "Setting up environment file..."
	@if [ ! -f .env ]; then \
		cp .env.example .env; \
		echo "Created .env file from template"; \
		echo "Please update .env with your configuration"; \
	else \
		echo ".env file already exists"; \
	fi

# Quick start for new installations
quick-start: env install db-push dev

# Production ready deployment
production: env install build deploy

# Docker development environment
docker-dev:
	@echo "Starting Docker development environment..."
	@docker-compose -f docker-compose.dev.yml up -d

# Testing commands
test:
	@echo "Running tests..."
	@npm test

test-api:
	@echo "Testing API endpoints..."
	@curl -f http://localhost:5000/api/health
	@curl -f http://localhost:5000/api/jobs
	@curl -f http://localhost:5000/api/dashboard/stats

# Security check
security-check:
	@echo "Running security audit..."
	@npm audit
	@echo "Checking for environment file exposure..."
	@if [ -f .env ]; then \
		echo "✅ .env file exists"; \
	else \
		echo "⚠️  .env file not found - run 'make env' first"; \
	fi

# Update dependencies
update:
	@echo "Updating dependencies..."
	@npm update
	@npm audit fix

# Full reset (use with caution)
reset:
	@echo "⚠️  This will reset the entire project"
	@read -p "Are you sure? (y/N): " confirm && [ "$$confirm" = "y" ]
	@rm -rf node_modules
	@rm -rf dist
	@rm -rf uploads
	@mkdir uploads
	@npm install
	@echo "Project reset completed"