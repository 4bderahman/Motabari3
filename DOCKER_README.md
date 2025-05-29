# 🐳 Motabari3 Blood Bank System - Docker Deployment Guide

Complete containerization setup for the Motabari3 Blood Donation Management System using Docker and Docker Compose.

## 📋 Prerequisites

- **Docker Engine** 20.10.0 or higher
- **Docker Compose** 2.0.0 or higher
- **4GB RAM** minimum (8GB recommended)
- **10GB disk space** for images and data

### Install Docker

#### Ubuntu/Debian
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
```

#### macOS
```bash
brew install --cask docker
```

#### Windows
Download Docker Desktop from [docker.com](https://www.docker.com/products/docker-desktop)

## 🚀 Quick Start

### 1. Setup Environment
```bash
# Make the startup script executable
chmod +x start.sh

# Setup environment file
./start.sh setup
```

### 2. Configure Environment Variables
Edit the `.env` file with your production values:

```bash
# IMPORTANT: Change these values for production!
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
MONGO_PASSWORD=your-secure-mongodb-password
RESEND_API_KEY=your-resend-api-key-here

# Optional: Configure other settings
FRONTEND_URL=your-domain.com
VITE_API_URL=https://api.your-domain.com
```

### 3. Start the Application

#### Development Mode
```bash
./start.sh start dev
```

#### Production Mode
```bash
./start.sh start prod
```

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │    MongoDB      │
│   (React.js)    │◄──►│  (Node.js/API)  │◄──►│   (Database)    │
│   Port: 3000    │    │   Port: 3001    │    │   Port: 27017   │
│   nginx:alpine  │    │   node:18-alpine│    │   mongo:7.0     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 📁 Project Structure

```
bloodBank/
├── 📄 Dockerfile                    # Frontend container
├── 📄 docker-compose.yml           # Development setup
├── 📄 docker-compose.prod.yml      # Production setup
├── 📄 nginx.conf                   # Nginx configuration
├── 📄 mongo-init.js                # Database initialization
├── 📄 start.sh                     # Deployment script
├── 📄 .dockerignore                # Docker ignore rules
├── 📄 .env.production               # Environment template
├── server/
│   ├── 📄 Dockerfile               # Backend container
│   ├── 📄 .dockerignore            # Server ignore rules
│   └── 📄 health.js                # Health check endpoint
└── src/                            # Frontend source code
```

## 🔧 Available Commands

### Basic Operations
```bash
# Start application
./start.sh start [dev|prod]

# Stop application
./start.sh stop [dev|prod]

# Restart application
./start.sh restart [dev|prod]

# Show status
./start.sh status [dev|prod]
```

### Monitoring & Debugging
```bash
# View logs (all services)
./start.sh logs

# View specific service logs
./start.sh logs dev backend
./start.sh logs prod frontend

# Show real-time logs
docker-compose logs -f
```

### Database Operations
```bash
# Backup database (production)
./start.sh backup

# Restore database
./start.sh restore backup_file.archive

# Access MongoDB shell
docker exec -it motabari3-mongodb-prod mongosh mongodb://admin:password@localhost:27017/hemocelldb
```

### Maintenance
```bash
# Clean up all resources
./start.sh cleanup

# Update containers
docker-compose pull
./start.sh restart
```

## 🌍 Environment Configuration

### Required Variables
```bash
# Security (MUST CHANGE)
JWT_SECRET=your-jwt-secret-min-32-chars
MONGO_PASSWORD=your-secure-mongodb-password

# Email Service
RESEND_API_KEY=your-resend-api-key

# URLs
FRONTEND_URL=your-domain.com
VITE_API_URL=https://api.your-domain.com
```

### Optional Variables
```bash
# Stripe Payments
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...

# Rate Limiting
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_WINDOW_MS=900000

# Logging
LOG_LEVEL=info
NODE_ENV=production
```

## 🔗 Access URLs

### Development Mode
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **MongoDB**: mongodb://localhost:27017

### Production Mode
- **Frontend**: http://localhost (port 80)
- **Backend API**: http://localhost:3001
- **MongoDB**: mongodb://localhost:27017

## 👤 Default Credentials

**Admin Access:**
- Email: `admin@motabari3.com`
- Password: `Admin@123`

## 🏥 Health Checks

All services include health checks:

```bash
# Check backend health
curl http://localhost:3001/api/health

# Check frontend
curl http://localhost:3000

# Check MongoDB
docker exec motabari3-mongodb mongosh --eval "db.adminCommand('ping')"
```

## 📊 Monitoring

### Container Status
```bash
# View running containers
docker ps

# View container resource usage
docker stats

# View container logs
docker logs motabari3-frontend
docker logs motabari3-backend
docker logs motabari3-mongodb
```

### Database Monitoring
```bash
# MongoDB connection status
docker exec motabari3-mongodb mongosh --eval "db.adminCommand('ismaster')"

# Database size
docker exec motabari3-mongodb mongosh hemocelldb --eval "db.stats()"

# Collection counts
docker exec motabari3-mongodb mongosh hemocelldb --eval "
  db.newusers.countDocuments();
  db.donateblood.countDocuments();
  db.needbloods.countDocuments();
"
```

## 🔐 Security Considerations

### Production Security
1. **Change default passwords** in `.env`
2. **Use HTTPS** with SSL certificates
3. **Configure firewall** to restrict access
4. **Enable MongoDB authentication**
5. **Regular security updates**

### SSL/TLS Setup
```bash
# Create SSL directory
mkdir -p nginx/ssl

# Add your SSL certificates
# nginx/ssl/cert.pem
# nginx/ssl/key.pem

# Update nginx configuration for HTTPS
```

## 🚨 Troubleshooting

### Common Issues

#### Port Already in Use
```bash
# Find process using port
sudo lsof -i :3000
sudo lsof -i :3001

# Kill process
sudo kill -9 PID
```

#### MongoDB Connection Failed
```bash
# Check MongoDB logs
docker logs motabari3-mongodb

# Restart MongoDB
docker restart motabari3-mongodb

# Verify MongoDB is running
docker exec motabari3-mongodb mongosh --eval "db.adminCommand('ping')"
```

#### Frontend Build Failed
```bash
# Check Node.js version
node --version

# Clear npm cache
npm cache clean --force

# Rebuild frontend
docker-compose build --no-cache frontend
```

#### Backend API Not Responding
```bash
# Check backend logs
docker logs motabari3-backend

# Check environment variables
docker exec motabari3-backend printenv

# Test backend health
curl http://localhost:3001/api/health
```

### Log Analysis
```bash
# View all service logs
docker-compose logs

# Filter logs by service
docker-compose logs backend | grep ERROR

# Real-time monitoring
docker-compose logs -f --tail=100
```

## 📦 Backup & Recovery

### Automated Backup
```bash
# Create backup script
cat > backup.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
./start.sh backup
echo "Backup completed: motabari3_backup_$DATE.archive"
EOF

chmod +x backup.sh
```

### Schedule Backups (Cron)
```bash
# Edit crontab
crontab -e

# Add daily backup at 2 AM
0 2 * * * /path/to/bloodBank/backup.sh
```

## 🔄 Updates & Maintenance

### Update Application
```bash
# Pull latest changes
git pull origin main

# Rebuild and restart
./start.sh restart prod
```

### Update Docker Images
```bash
# Pull latest base images
docker-compose pull

# Rebuild with new images
docker-compose build --no-cache

# Restart services
./start.sh restart prod
```

## 📈 Performance Optimization

### Production Optimizations
1. **Resource limits** set in docker-compose.prod.yml
2. **Nginx caching** for static assets
3. **MongoDB indexes** for better query performance
4. **Health checks** for automatic recovery
5. **Log rotation** to prevent disk space issues

### Scaling
```bash
# Scale backend services
docker-compose up -d --scale backend=3

# Load balancer configuration needed for multiple backends
```

## 📞 Support

### Getting Help
- **GitHub Issues**: [Repository Issues](https://github.com/4bderahman/Motabari3/issues)
- **Docker Documentation**: [docs.docker.com](https://docs.docker.com)
- **MongoDB Documentation**: [docs.mongodb.com](https://docs.mongodb.com)

### Useful Commands
```bash
# Show all Docker commands
./start.sh help

# Debug container
docker exec -it motabari3-backend sh

# View container configuration
docker inspect motabari3-frontend
```

---

## 🎯 Quick Reference

| Service | Container Name | Port | Purpose |
|---------|---------------|------|---------|
| Frontend | motabari3-frontend | 3000/80 | React.js UI |
| Backend | motabari3-backend | 3001 | Node.js API |
| Database | motabari3-mongodb | 27017 | MongoDB |

| Command | Purpose |
|---------|---------|
| `./start.sh start` | Start development |
| `./start.sh start prod` | Start production |
| `./start.sh logs` | View logs |
| `./start.sh backup` | Backup database |
| `./start.sh cleanup` | Remove all |

**🩸 Ready to save lives with containerized blood bank management! 🏥**