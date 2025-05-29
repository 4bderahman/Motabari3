#!/bin/bash

# Motabari3 Blood Bank System - Docker Deployment Script
# This script helps you deploy the blood bank system using Docker

set -e

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

# Function to check if Docker is installed
check_docker() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        echo "Visit: https://docs.docker.com/get-docker/"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        echo "Visit: https://docs.docker.com/compose/install/"
        exit 1
    fi
    
    print_success "Docker and Docker Compose are installed."
}

# Function to create environment file if it doesn't exist
setup_environment() {
    if [ ! -f .env ]; then
        print_warning ".env file not found. Creating from template..."
        cp .env.production .env
        print_warning "Please edit the .env file with your production values before running the application."
        print_warning "Important: Change JWT_SECRET, MONGO_PASSWORD, and API keys!"
        return 1
    fi
    return 0
}

# Function to build and start the application
start_application() {
    local mode=${1:-"dev"}
    
    print_status "Starting Motabari3 Blood Bank System in $mode mode..."
    
    if [ "$mode" = "prod" ]; then
        print_status "Building and starting production containers..."
        docker-compose -f docker-compose.prod.yml down
        docker-compose -f docker-compose.prod.yml build --no-cache
        docker-compose -f docker-compose.prod.yml up -d
    else
        print_status "Building and starting development containers..."
        docker-compose down
        docker-compose build --no-cache
        docker-compose up -d
    fi
    
    print_status "Waiting for services to start..."
    sleep 10
    
    # Check if services are running
    if [ "$mode" = "prod" ]; then
        if docker-compose -f docker-compose.prod.yml ps | grep -q "Up"; then
            print_success "Services started successfully!"
        else
            print_error "Some services failed to start. Check logs with: docker-compose -f docker-compose.prod.yml logs"
            exit 1
        fi
    else
        if docker-compose ps | grep -q "Up"; then
            print_success "Services started successfully!"
        else
            print_error "Some services failed to start. Check logs with: docker-compose logs"
            exit 1
        fi
    fi
}

# Function to stop the application
stop_application() {
    local mode=${1:-"dev"}
    
    print_status "Stopping Motabari3 Blood Bank System..."
    
    if [ "$mode" = "prod" ]; then
        docker-compose -f docker-compose.prod.yml down
    else
        docker-compose down
    fi
    
    print_success "Application stopped successfully!"
}

# Function to show logs
show_logs() {
    local mode=${1:-"dev"}
    local service=${2:-""}
    
    if [ "$mode" = "prod" ]; then
        docker-compose -f docker-compose.prod.yml logs -f $service
    else
        docker-compose logs -f $service
    fi
}

# Function to show application status
show_status() {
    local mode=${1:-"dev"}
    
    print_status "Application Status:"
    
    if [ "$mode" = "prod" ]; then
        docker-compose -f docker-compose.prod.yml ps
    else
        docker-compose ps
    fi
    
    echo ""
    print_status "Access URLs:"
    if [ "$mode" = "prod" ]; then
        echo "Frontend: http://localhost"
        echo "Backend API: http://localhost:3001"
    else
        echo "Frontend: http://localhost:3000"
        echo "Backend API: http://localhost:3001"
    fi
    echo "MongoDB: mongodb://localhost:27017"
    echo ""
    print_status "Default Admin Credentials:"
    echo "Email: admin@motabari3.com"
    echo "Password: Admin@123"
}

# Function to clean up Docker resources
cleanup() {
    print_warning "This will remove all containers, images, and volumes related to Motabari3."
    read -p "Are you sure? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_status "Cleaning up Docker resources..."
        docker-compose down -v --rmi all --remove-orphans
        docker-compose -f docker-compose.prod.yml down -v --rmi all --remove-orphans 2>/dev/null || true
        docker system prune -f
        print_success "Cleanup completed!"
    else
        print_status "Cleanup cancelled."
    fi
}

# Function to backup database
backup_database() {
    print_status "Creating database backup..."
    
    local backup_dir="./backups"
    local backup_file="motabari3_backup_$(date +%Y%m%d_%H%M%S).archive"
    
    mkdir -p $backup_dir
    
    docker exec motabari3-mongodb-prod mongodump --authenticationDatabase admin --username admin --password ${MONGO_PASSWORD:-secure_password_change_me} --db hemocelldb --archive > "$backup_dir/$backup_file"
    
    if [ $? -eq 0 ]; then
        print_success "Database backup created: $backup_dir/$backup_file"
    else
        print_error "Database backup failed!"
        exit 1
    fi
}

# Function to restore database
restore_database() {
    local backup_file=$1
    
    if [ -z "$backup_file" ]; then
        print_error "Please provide backup file path."
        echo "Usage: $0 restore <backup_file>"
        exit 1
    fi
    
    if [ ! -f "$backup_file" ]; then
        print_error "Backup file not found: $backup_file"
        exit 1
    fi
    
    print_warning "This will replace the current database with the backup."
    read -p "Are you sure? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_status "Restoring database from: $backup_file"
        docker exec -i motabari3-mongodb-prod mongorestore --authenticationDatabase admin --username admin --password ${MONGO_PASSWORD:-secure_password_change_me} --db hemocelldb --archive < "$backup_file"
        print_success "Database restored successfully!"
    else
        print_status "Restore cancelled."
    fi
}

# Function to show help
show_help() {
    echo "Motabari3 Blood Bank System - Docker Deployment Script"
    echo ""
    echo "Usage: $0 [COMMAND] [OPTIONS]"
    echo ""
    echo "Commands:"
    echo "  start [dev|prod]     Start the application (default: dev)"
    echo "  stop [dev|prod]      Stop the application (default: dev)"
    echo "  restart [dev|prod]   Restart the application (default: dev)"
    echo "  status [dev|prod]    Show application status (default: dev)"
    echo "  logs [dev|prod] [service]  Show logs (default: dev, all services)"
    echo "  backup               Backup database (production only)"
    echo "  restore <file>       Restore database from backup"
    echo "  cleanup              Remove all Docker resources"
    echo "  setup                Setup environment file"
    echo "  help                 Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 start             # Start in development mode"
    echo "  $0 start prod        # Start in production mode"
    echo "  $0 logs prod backend # Show production backend logs"
    echo "  $0 backup            # Backup production database"
    echo "  $0 restore backup.archive  # Restore from backup"
    echo ""
    echo "Services:"
    echo "  - frontend: React.js application"
    echo "  - backend: Node.js/Express API"
    echo "  - mongodb: MongoDB database"
    echo ""
    echo "For more information, visit: https://github.com/4bderahman/Motabari3"
}

# Main script logic
main() {
    local command=${1:-"help"}
    local mode=${2:-"dev"}
    
    case $command in
        "start")
            check_docker
            if ! setup_environment; then
                print_error "Please configure the .env file first!"
                exit 1
            fi
            start_application $mode
            show_status $mode
            ;;
        "stop")
            stop_application $mode
            ;;
        "restart")
            check_docker
            stop_application $mode
            start_application $mode
            show_status $mode
            ;;
        "status")
            show_status $mode
            ;;
        "logs")
            show_logs $mode $3
            ;;
        "backup")
            backup_database
            ;;
        "restore")
            restore_database $2
            ;;
        "cleanup")
            cleanup
            ;;
        "setup")
            setup_environment
            print_success "Environment setup completed. Please edit .env file with your values."
            ;;
        "help"|"--help"|"-h")
            show_help
            ;;
        *)
            print_error "Unknown command: $command"
            show_help
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"