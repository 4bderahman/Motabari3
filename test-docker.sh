#!/bin/bash

# Motabari3 Blood Bank System - Docker Deployment Test Script
# This script tests the Docker deployment to ensure everything works correctly

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[TEST]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[PASS]${NC} $1"
}

print_error() {
    echo -e "${RED}[FAIL]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

# Test Docker installation
test_docker_installation() {
    print_status "Testing Docker installation..."
    
    if command -v docker &> /dev/null; then
        print_success "Docker is installed"
        docker --version
    else
        print_error "Docker is not installed"
        return 1
    fi
    
    if command -v docker-compose &> /dev/null; then
        print_success "Docker Compose is installed"
        docker-compose --version
    else
        print_error "Docker Compose is not installed"
        return 1
    fi
}

# Test Docker daemon
test_docker_daemon() {
    print_status "Testing Docker daemon..."
    
    if docker info &> /dev/null; then
        print_success "Docker daemon is running"
    else
        print_error "Docker daemon is not running"
        return 1
    fi
}

# Test environment setup
test_environment() {
    print_status "Testing environment configuration..."
    
    if [ -f .env ]; then
        print_success ".env file exists"
        
        # Check for critical variables
        if grep -q "JWT_SECRET" .env; then
            print_success "JWT_SECRET is configured"
        else
            print_warning "JWT_SECRET not found in .env"
        fi
        
        if grep -q "CONNECTION_STRING" .env; then
            print_success "CONNECTION_STRING is configured"
        else
            print_warning "CONNECTION_STRING not found in .env"
        fi
    else
        print_warning ".env file not found, using defaults"
    fi
}

# Test Docker files
test_docker_files() {
    print_status "Testing Docker configuration files..."
    
    local files=("Dockerfile" "docker-compose.yml" "nginx.conf" "server/Dockerfile")
    
    for file in "${files[@]}"; do
        if [ -f "$file" ]; then
            print_success "$file exists"
        else
            print_error "$file is missing"
            return 1
        fi
    done
}

# Test Docker build
test_docker_build() {
    print_status "Testing Docker build process..."
    
    print_status "Building backend image..."
    if docker build -t motabari3-backend-test ./server; then
        print_success "Backend image built successfully"
    else
        print_error "Failed to build backend image"
        return 1
    fi
    
    print_status "Building frontend image..."
    if docker build -t motabari3-frontend-test .; then
        print_success "Frontend image built successfully"
    else
        print_error "Failed to build frontend image"
        return 1
    fi
}

# Test container startup
test_container_startup() {
    print_status "Testing container startup..."
    
    # Start services
    print_status "Starting test containers..."
    docker-compose -f docker-compose.yml up -d
    
    # Wait for services to start
    print_status "Waiting for services to initialize..."
    sleep 30
    
    # Check if containers are running
    if docker-compose ps | grep -q "Up"; then
        print_success "Containers are running"
    else
        print_error "Some containers failed to start"
        docker-compose logs
        return 1
    fi
}

# Test service connectivity
test_service_connectivity() {
    print_status "Testing service connectivity..."
    
    # Test MongoDB
    print_status "Testing MongoDB connection..."
    if docker exec motabari3-mongodb mongosh --eval "db.adminCommand('ping')" &> /dev/null; then
        print_success "MongoDB is responding"
    else
        print_error "MongoDB is not responding"
        return 1
    fi
    
    # Test Backend
    print_status "Testing Backend API..."
    sleep 10  # Give backend more time to start
    
    if curl -f http://localhost:3001/api/health &> /dev/null; then
        print_success "Backend API is responding"
    else
        print_warning "Backend health check failed, testing basic connection..."
        if curl -f http://localhost:3001 &> /dev/null; then
            print_success "Backend is responding (no health endpoint)"
        else
            print_error "Backend is not responding"
            return 1
        fi
    fi
    
    # Test Frontend
    print_status "Testing Frontend..."
    if curl -f http://localhost:3000 &> /dev/null; then
        print_success "Frontend is responding"
    else
        print_error "Frontend is not responding"
        return 1
    fi
}

# Test API endpoints
test_api_endpoints() {
    print_status "Testing API endpoints..."
    
    # Test basic endpoints
    local endpoints=("/api/health" "/api/stats")
    
    for endpoint in "${endpoints[@]}"; do
        print_status "Testing $endpoint..."
        if curl -f "http://localhost:3001$endpoint" &> /dev/null; then
            print_success "$endpoint is working"
        else
            print_warning "$endpoint is not accessible (may require authentication)"
        fi
    done
}

# Test database initialization
test_database() {
    print_status "Testing database initialization..."
    
    # Check if collections exist
    local collections=$(docker exec motabari3-mongodb mongosh hemocelldb --eval "db.getCollectionNames()" --quiet)
    
    if [[ $collections == *"newusers"* ]]; then
        print_success "Database collections are initialized"
    else
        print_warning "Database collections may not be properly initialized"
    fi
}

# Clean up test resources
cleanup_test() {
    print_status "Cleaning up test resources..."
    
    docker-compose down -v
    docker rmi motabari3-backend-test motabari3-frontend-test &> /dev/null || true
    
    print_success "Test cleanup completed"
}

# Run all tests
run_all_tests() {
    local failed_tests=0
    
    echo "======================================"
    echo "Motabari3 Docker Deployment Test Suite"
    echo "======================================"
    echo ""
    
    # Run tests
    test_docker_installation || ((failed_tests++))
    echo ""
    
    test_docker_daemon || ((failed_tests++))
    echo ""
    
    test_environment || ((failed_tests++))
    echo ""
    
    test_docker_files || ((failed_tests++))
    echo ""
    
    test_docker_build || ((failed_tests++))
    echo ""
    
    test_container_startup || ((failed_tests++))
    echo ""
    
    test_service_connectivity || ((failed_tests++))
    echo ""
    
    test_api_endpoints || ((failed_tests++))
    echo ""
    
    test_database || ((failed_tests++))
    echo ""
    
    # Cleanup
    cleanup_test
    echo ""
    
    # Summary
    echo "======================================"
    if [ $failed_tests -eq 0 ]; then
        print_success "All tests passed! Your Docker deployment is ready."
        echo ""
        echo "Next steps:"
        echo "1. Configure your .env file with production values"
        echo "2. Run: ./start.sh start prod"
        echo "3. Access your application at http://localhost"
    else
        print_error "$failed_tests test(s) failed. Please fix the issues before deploying."
        echo ""
        echo "Common fixes:"
        echo "1. Ensure Docker is running: sudo systemctl start docker"
        echo "2. Check environment variables in .env file"
        echo "3. Verify port availability: sudo lsof -i :3000 -i :3001 -i :27017"
    fi
    echo "======================================"
    
    return $failed_tests
}

# Main execution
case ${1:-"all"} in
    "docker")
        test_docker_installation
        ;;
    "build")
        test_docker_build
        ;;
    "startup")
        test_container_startup
        ;;
    "connectivity")
        test_service_connectivity
        ;;
    "cleanup")
        cleanup_test
        ;;
    "all")
        run_all_tests
        ;;
    *)
        echo "Usage: $0 [docker|build|startup|connectivity|cleanup|all]"
        echo ""
        echo "Commands:"
        echo "  docker       Test Docker installation"
        echo "  build        Test Docker image building"
        echo "  startup      Test container startup"
        echo "  connectivity Test service connectivity"
        echo "  cleanup      Clean up test resources"
        echo "  all          Run all tests (default)"
        ;;
esac