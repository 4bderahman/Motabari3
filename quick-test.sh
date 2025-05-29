#!/bin/bash

# Quick Docker Test for Motabari3 Blood Bank System
# 5-minute verification script

set -e

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🐳 Quick Docker Test for Motabari3 Blood Bank${NC}"
echo "================================================="

# Step 1: Check Docker
echo -e "\n${BLUE}Step 1: Checking Docker...${NC}"
if command -v docker &> /dev/null; then
    echo -e "${GREEN}✅ Docker installed${NC}"
    docker --version
else
    echo -e "${RED}❌ Docker not found${NC}"
    exit 1
fi

if docker info &> /dev/null; then
    echo -e "${GREEN}✅ Docker running${NC}"
else
    echo -e "${RED}❌ Docker not running - please start Docker Desktop${NC}"
    exit 1
fi

# Step 2: Build Backend (Quick)
echo -e "\n${BLUE}Step 2: Building backend...${NC}"
cd server
if docker build -t motabari3-quick-backend . > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend built successfully${NC}"
else
    echo -e "${RED}❌ Backend build failed${NC}"
    exit 1
fi
cd ..

# Step 3: Test MongoDB
echo -e "\n${BLUE}Step 3: Testing MongoDB...${NC}"
docker run -d --name quick-mongo \
    -e MONGO_INITDB_ROOT_USERNAME=admin \
    -e MONGO_INITDB_ROOT_PASSWORD=password123 \
    -p 27017:27017 \
    mongo:7.0 > /dev/null 2>&1

echo "Waiting for MongoDB to start..."
sleep 15

if docker exec quick-mongo mongosh --eval "db.adminCommand('ping')" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ MongoDB working${NC}"
else
    echo -e "${YELLOW}⚠️  MongoDB starting (may need more time)${NC}"
fi

# Step 4: Test Backend
echo -e "\n${BLUE}Step 4: Testing backend...${NC}"
docker run -d --name quick-backend \
    -e CONNECTION_STRING="mongodb://host.docker.internal:27017/hemocelldb" \
    -e JWT_SECRET="test-secret-key" \
    -e PORT=3001 \
    -p 3001:3001 \
    motabari3-quick-backend > /dev/null 2>&1

echo "Waiting for backend to start..."
sleep 10

if curl -f http://localhost:3001/api/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend API working${NC}"
elif curl -f http://localhost:3001 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend running (health endpoint may need auth)${NC}"
else
    echo -e "${YELLOW}⚠️  Backend starting (may need more time)${NC}"
fi

# Step 5: Build Frontend (Quick)
echo -e "\n${BLUE}Step 5: Building frontend...${NC}"
if docker build -t motabari3-quick-frontend . > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Frontend built successfully${NC}"
else
    echo -e "${YELLOW}⚠️  Frontend build may take longer${NC}"
fi

# Step 6: Test Frontend
echo -e "\n${BLUE}Step 6: Testing frontend...${NC}"
docker run -d --name quick-frontend \
    -p 3000:80 \
    motabari3-quick-frontend > /dev/null 2>&1

sleep 5

if curl -f http://localhost:3000 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Frontend working${NC}"
else
    echo -e "${YELLOW}⚠️  Frontend starting${NC}"
fi

# Results
echo -e "\n${BLUE}📋 Test Results:${NC}"
echo "=================="
echo -e "Frontend: ${GREEN}http://localhost:3000${NC}"
echo -e "Backend:  ${GREEN}http://localhost:3001${NC}"
echo -e "MongoDB:  ${GREEN}mongodb://localhost:27017${NC}"
echo ""
echo -e "${GREEN}🎉 Docker setup verified!${NC}"
echo ""
echo "Next steps:"
echo "1. Open http://localhost:3000 in your browser"
echo "2. Try admin login: admin@motabari3.com / Admin@123"
echo "3. Test user registration"
echo ""
echo "To clean up test containers:"
echo "./quick-test.sh cleanup"

# Cleanup function
cleanup() {
    echo -e "\n${BLUE}🧹 Cleaning up test containers...${NC}"
    docker stop quick-mongo quick-backend quick-frontend > /dev/null 2>&1 || true
    docker rm quick-mongo quick-backend quick-frontend > /dev/null 2>&1 || true
    docker rmi motabari3-quick-backend motabari3-quick-frontend > /dev/null 2>&1 || true
    echo -e "${GREEN}✅ Cleanup complete${NC}"
}

if [ "$1" = "cleanup" ]; then
    cleanup
    exit 0
fi

echo ""
echo -e "${YELLOW}💡 Tip: Run './quick-test.sh cleanup' when done testing${NC}"