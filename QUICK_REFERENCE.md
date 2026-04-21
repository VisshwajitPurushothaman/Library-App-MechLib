# 🚀 Quick Reference - Common Commands

## Deployment Commands

### Docker Compose
```bash
# Start everything
docker-compose up -d

# Stop everything
docker-compose down

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres

# Restart services
docker-compose restart backend
docker-compose restart frontend

# Status
docker-compose ps

# Rebuild images
docker-compose build
```

### Database Migrations
```bash
# Run migrations
npm run migration:run --prefix backend

# Revert last migration
npm run migration:revert --prefix backend

# Generate new migration
npm run migration:generate --prefix backend -- src/migrations/NewMigration

# Create empty migration
npm run migration:create --prefix backend -- src/migrations/EmptyMigration
```

### Environment Setup
```bash
# Generate JWT secret
openssl rand -base64 32

# Copy production template
cp backend/.env.production.example backend/.env.production

# Edit configuration
nano backend/.env.production

# Verify configuration
cat backend/.env.production | grep -E \"^[A-Z]\"
```

---

## Testing Commands

### Backend
```bash
# Install dependencies
npm install --prefix backend

# Run linter
npm run lint --prefix backend

# Build TypeScript
npm run build --prefix backend

# Unit tests
npm run test --prefix backend

# Test coverage
npm run test:cov --prefix backend

# E2E tests
npm run test:e2e --prefix backend
```

### Frontend
```bash
# Install dependencies
npm install --prefix frontend

# Run linter
npm run lint --prefix frontend

# Build for production
npm run build --prefix frontend

# Start development server
npm start --prefix frontend

# Run tests
npm test --prefix frontend
```

---

## Monitoring Commands

### View Logs
```bash
# Real-time backend logs
docker-compose logs -f backend

# Last 100 lines
docker-compose logs --tail=100 backend

# Logs with timestamps
docker-compose logs --timestamps backend

# View specific time range
docker-compose logs --since 2024-04-20T10:00:00 backend
```

### Container Status
```bash
# List running containers
docker-compose ps

# Check resource usage
docker stats

# Check container health
docker-compose ps | grep backend

# View container details
docker inspect $(docker-compose ps -q backend)
```

### Database Queries
```bash
# Connect to PostgreSQL
docker-compose exec postgres psql -U mechlib_user -d mechlib_prod

# List databases
\\l

# List tables
\\dt

# User connections
SELECT * FROM pg_stat_activity;

# Check table size
SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) 
FROM pg_tables ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

---

## Backup & Restore

### Backup Database
```bash
# PostgreSQL backup
docker-compose exec postgres \
  pg_dump -U mechlib_user mechlib_prod > backup-$(date +%Y%m%d-%H%M%S).sql

# Backup to cloud (AWS S3)
docker-compose exec postgres \
  pg_dump -U mechlib_user mechlib_prod | \
  aws s3 cp - s3://my-bucket/backup-$(date +%Y%m%d).sql
```

### Restore Database
```bash
# From local file
docker-compose exec -T postgres \
  psql -U mechlib_user mechlib_prod < backup.sql

# From cloud (AWS S3)
aws s3 cp s3://my-bucket/backup.sql - | \
  docker-compose exec -T postgres \
  psql -U mechlib_user mechlib_prod
```

---

## Troubleshooting Commands

### Check Connectivity
```bash
# Test API endpoint
curl -i https://yourdomain.com/api/auth/me

# Test with authentication
curl -i -H \"Authorization: Bearer YOUR_TOKEN\" \\
  https://yourdomain.com/api/auth/me

# Check backend is running
curl http://localhost:8000/api/auth/me

# Test frontend
curl http://localhost:3000
```

### Debug Issues
```bash
# View backend errors
docker-compose logs backend | grep -i error

# View all logs with errors
docker-compose logs | grep -i error

# Search logs for specific pattern
docker-compose logs | grep \"pattern\"

# Get last 50 lines
docker-compose logs --tail=50
```

### Container Debugging
```bash
# Enter backend container
docker-compose exec backend bash

# Check environment variables
docker-compose exec backend env

# Run a command in container
docker-compose exec backend npm list

# Check file permissions
docker-compose exec backend ls -la src/
```

### Network Debugging
```bash
# Test port connectivity
telnet localhost 8000

# Check open ports
netstat -tlnp | grep LISTEN

# Check DNS
nslookup yourdomain.com

# Ping check
ping yourdomain.com
```

---

## Performance Commands

### Load Testing
```bash
# Using Apache Bench
ab -n 1000 -c 10 https://yourdomain.com/

# Using k6
k6 run script.js

# Using wrk
wrk -t12 -c400 -d30s https://yourdomain.com/
```

### Database Performance
```bash
# Slow queries
SELECT query, mean_time FROM pg_stat_statements 
ORDER BY mean_time DESC LIMIT 10;

# Query execution plan
EXPLAIN ANALYZE SELECT * FROM books WHERE title LIKE '%search%';

# Table statistics
SELECT schemaname, tablename, n_live_tup, n_dead_tup 
FROM pg_stat_user_tables;
```

### Memory & CPU
```bash
# Node memory usage
docker stats --no-stream backend

# PostgreSQL memory
docker-compose exec postgres psql -c \"SELECT * FROM pg_settings WHERE name LIKE 'shared%';\"

# Check system resources
df -h
free -h
```

---

## Deployment Workflows

### Full Deployment
```bash
# 1. Pull latest code
git pull origin main

# 2. Build images
docker-compose build

# 3. Stop current services
docker-compose down

# 4. Start new services
docker-compose up -d

# 5. Run migrations
docker-compose exec backend npm run migration:run

# 6. Verify
docker-compose ps
curl https://yourdomain.com/api/auth/me
```

### Zero-Downtime Deployment
```bash
# 1. Build new image
docker-compose build backend

# 2. Start new container
docker-compose up -d backend

# 3. Run migrations (if any)
docker-compose exec backend npm run migration:run

# 4. Verify health
curl https://yourdomain.com/api/health

# 5. Keep both running briefly to test
# Then remove old container
docker-compose down
docker-compose up -d
```

### Rollback Procedure
```bash
# 1. Go back to previous version
git checkout previous-commit

# 2. Rebuild images
docker-compose build

# 3. Stop and restart
docker-compose down
docker-compose up -d

# 4. Revert migrations if needed
docker-compose exec backend npm run migration:revert
```

---

## Security Commands

### SSL Certificate Management
```bash
# Generate self-signed certificate
openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365

# Check certificate expiry
openssl x509 -enddate -noout -in cert.pem

# View certificate info
openssl x509 -text -noout -in cert.pem
```

### JWT Token Validation
```bash
# Decode JWT token
echo \"TOKEN\" | jq -R 'split(\".\") | .[1] | @base64d | fromjson'

# Generate test token
openssl rand -base64 32
```

### Password Hashing
```bash
# Inside the application
docker-compose exec backend npm install -g bcryptjs

# Test bcrypt
node -e \"const bcrypt = require('bcryptjs'); console.log(bcrypt.hashSync('password', 10));\"
```

---

## Clean Up Commands

### Remove Unused Resources
```bash
# Remove stopped containers
docker container prune

# Remove unused images
docker image prune

# Remove unused volumes
docker volume prune

# Full cleanup (careful!)
docker system prune -a --volumes
```

### Log Rotation
```bash
# Clear old logs
rm logs/*.log.*.gz

# Compress logs
gzip logs/*.log

# Clear specific log
> logs/app.log
```

---

## Monitoring Setup Commands

### Sentry Integration
```bash
# Install Sentry
npm install @sentry/node --prefix backend

# Initialize Sentry
# Then add to main.ts:
# import * as Sentry from '@sentry/node';
# Sentry.init({ dsn: process.env.SENTRY_DSN });
```

### Monitoring Dashboard
```bash
# Check uptime
docker-compose exec backend curl http://localhost:8000/health

# Memory usage
docker stats --no-stream

# Response times
docker-compose logs backend | grep \"response\"
```

---

## Advanced Commands

### Database Replication
```bash
# Backup from primary
docker-compose exec postgres pg_dump -Fc mechlib_prod > backup.dump

# Restore to replica
pg_restore -d mechlib_prod backup.dump
```

### Horizontal Scaling
```bash
# Scale backend to 3 instances
docker-compose up -d --scale backend=3

# With load balancing
# Update nginx.conf with upstream backend {...}
```

### Blue-Green Deployment
```bash
# Run new version (green)
docker-compose up -d -f docker-compose.green.yml

# Test green version
curl http://localhost:8001/api/auth/me

# Switch Nginx to green
# Update nginx.conf upstream

# Keep blue running for quick rollback
```

---

## Reference Table

| Task | Command |
|------|---------|
| Start | `docker-compose up -d` |
| Stop | `docker-compose down` |
| Logs | `docker-compose logs -f backend` |
| Backup | `docker-compose exec postgres pg_dump ...` |
| Migrate | `npm run migration:run --prefix backend` |
| Test API | `curl https://yourdomain.com/api/auth/me` |
| Check Health | `docker-compose ps` |
| Restart | `docker-compose restart backend` |
| Rebuild | `docker-compose build --no-cache` |
| Scale | `docker-compose up -d --scale backend=3` |

---

## Environment Variables Quick Reference

```bash
# Backend
NODE_ENV=production
JWT_SECRET=your-secret-here
DB_HOST=postgres
DB_NAME=mechlib_prod
CORS_ORIGINS=https://yourdomain.com

# Frontend
REACT_APP_BACKEND_URL=https://api.yourdomain.com
REACT_APP_ENV=production
```

---

**Last Updated:** April 20, 2026

**Tip:** Bookmark this page for quick command reference! 📌
