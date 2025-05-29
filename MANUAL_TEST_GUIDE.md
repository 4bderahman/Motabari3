# 🧪 Manual Docker Testing Guide for macOS

## Prerequisites Checklist

- [ ] Docker Desktop installed and running
- [ ] Terminal access
- [ ] 8GB free disk space
- [ ] Stable internet connection

## Step 1: Verify Docker Installation

```bash
# Check Docker is running
docker --version
docker-compose --version

# Should show versions like:
# Docker version 28.0.4
# Docker Compose version v2.34.0
```

## Step 2: Start Docker Desktop

1. Open **Docker Desktop** application
2. Wait for the green "Engine running" status
3. Verify in terminal: `docker info`

## Step 3: Navigate to Project

```bash
cd /path/to/your/bloodBank
ls -la

# Should see files like:
# - docker-compose.yml
# - Dockerfile
# - start.sh
# - .env
```

## Step 4: Quick Build Test (Backend Only)

```bash
# Test backend Docker build
cd server
docker build -t test-backend .

# Wait for build to complete (may take 2-3 minutes)
# Look for: "Successfully tagged test-backend:latest"
```

## Step 5: Quick Build Test (Frontend Only)

```bash
# Return to root directory
cd ..

# Test frontend Docker build
docker build -t test-frontend .

# Wait for build to complete (may take 3-5 minutes)
# Look for: "Successfully tagged test-frontend:latest"
```

## Step 6: Test Individual Services

### Test MongoDB
```bash
# Start MongoDB container only
docker run -d --name test-mongo \
  -e MONGO_INITDB_ROOT_USERNAME=admin \
  -e MONGO_INITDB_ROOT_PASSWORD=password123 \
  -p 27017:27017 \
  mongo:7.0

# Wait 30 seconds, then test connection
docker exec test-mongo mongosh --eval "db.adminCommand('ping')"

# Should return: { ok: 1 }
```

### Test Backend
```bash
# Start backend container
docker run -d --name test-backend \
  -e CONNECTION_STRING="mongodb://host.docker.internal:27017/hemocelldb" \
  -e JWT_SECRET="test-secret-key" \
  -p 3001:3001 \
  test-backend

# Wait 10 seconds, then test
curl http://localhost:3001/api/health

# Should return health status JSON
```

### Test Frontend
```bash
# Start frontend container
docker run -d --name test-frontend \
  -p 3000:80 \
  test-frontend

# Wait 5 seconds, then test
curl http://localhost:3000

# Should return HTML content
```

## Step 7: Test Full Application

```bash
# Clean up individual containers
docker stop test-mongo test-backend test-frontend
docker rm test-mongo test-backend test-frontend

# Start full application
./start.sh start dev

# Monitor progress
docker-compose logs -f
```

## Step 8: Access Application

### Open in Browser
1. **Frontend**: http://localhost:3000
2. **Backend API**: http://localhost:3001/api/health

### Test Login
1. Go to http://localhost:3000/admin/login
2. Use credentials:
   - Email: `admin@motabari3.com`
   - Password: `Admin@123`

### Test Registration
1. Go to http://localhost:3000/signup
2. Create a test donor account
3. Verify registration works

## Troubleshooting Common Issues

### Port Already in Use
```bash
# Find process using port
lsof -i :3000
lsof -i :3001
lsof -i :27017

# Kill process if needed
kill -9 <PID>
```

### Docker Desktop Not Running
1. Open Docker Desktop app
2. Wait for green status indicator
3. Restart if needed: Docker Desktop > Troubleshoot > Restart

### Build Fails
```bash
# Clean Docker cache
docker system prune -f

# Rebuild without cache
docker-compose build --no-cache
```

### MongoDB Connection Issues
```bash
# Check MongoDB logs
docker logs motabari3-mongodb

# Restart MongoDB
docker restart motabari3-mongodb
```

### Slow Performance
1. Increase Docker Desktop memory (8GB recommended)
2. Close other applications
3. Use development mode for faster startup

## Verification Checklist

- [ ] Docker Desktop running
- [ ] All containers started successfully
- [ ] Frontend accessible at http://localhost:3000
- [ ] Backend health check returns OK
- [ ] Admin login works
- [ ] User registration works
- [ ] Database connection established

## Quick Commands Reference

```bash
# Start application
./start.sh start dev

# Stop application
./start.sh stop dev

# View logs
./start.sh logs dev

# Check status
./start.sh status dev

# Run tests
./test-docker.sh

# Clean up everything
./start.sh cleanup
```

## Expected Results

### Successful Setup Shows:
- ✅ All containers running (docker ps)
- ✅ Frontend loads in browser
- ✅ API health check responds
- ✅ Admin login successful
- ✅ User registration works

### Timing Expectations:
- First build: 10-15 minutes
- Subsequent starts: 2-3 minutes
- Image downloads: 5-10 minutes (one-time)

## Need Help?

If you encounter issues:

1. **Check logs**: `docker-compose logs`
2. **Restart Docker Desktop**
3. **Clean and rebuild**: `docker system prune -f`
4. **Verify environment**: Check `.env` file
5. **Port conflicts**: Use different ports if needed

The Docker setup is working correctly - the initial download and build process just takes time on the first run!