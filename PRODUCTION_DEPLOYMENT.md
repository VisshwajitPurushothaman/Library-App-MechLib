# MechLib Production Deployment Guide

## Prerequisites

- Node.js 18+ 
- PostgreSQL 12+
- npm or yarn

## Environment Setup

### 1. Generate Secure JWT Secret

```bash
openssl rand -base64 32
# Output example: Xk8jQ9pL2mN5vB1aW6dE3zC7fG0hJ4rT8uY9sP2kL5m=
```

### 2. Create Production Environment File

Copy `.env.production.example` to `.env.production` and update all values:

```bash
cp backend/.env.production.example backend/.env.production
```

Edit `backend/.env.production`:
```env
NODE_ENV=production
PORT=8000
DB_TYPE=postgres
DB_HOST=your-postgres-host.com
DB_PORT=5432
DB_NAME=mechlib_prod
DB_USER=mechlib_user
DB_PASSWORD=your_secure_password
JWT_SECRET=your_generated_secret_from_step_1
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
THROTTLE_TTL=900000
THROTTLE_LIMIT=100
LOG_LEVEL=warn
LOG_FILE=logs/app.log
```

### 3. Backend Deployment

```bash
cd backend

# Install dependencies
npm install

# Build for production
npm run build

# Set environment
export NODE_ENV=production

# Run database migrations
npm run migration:run

# Start production server
npm run start:prod

# Or use PM2 for process management
pm2 start dist/main.js --name mechlib-api --instances max --exec-mode cluster
```

### 4. Frontend Deployment

Copy `frontend/.env.production` and update:

```bash
cp frontend/.env.production.example frontend/.env.production
```

Edit `frontend/.env.production`:
```env
REACT_APP_BACKEND_URL=https://api.yourdomain.com
REACT_APP_ENV=production
```

Build and deploy:

```bash
cd frontend
npm install
npm run build

# Deploy 'build' folder to your web server (Nginx, Apache, Vercel, etc.)
```

## Security Checklist

- [ ] JWT_SECRET is strong (32+ characters, random, with special chars)
- [ ] Database credentials are secure and different from development
- [ ] HTTPS is enabled on production domain
- [ ] CORS_ORIGINS matches your actual domain
- [ ] .env files are NOT committed to version control
- [ ] NODE_ENV=production is set
- [ ] Database automatic synchronization is disabled
- [ ] Rate limiting is enforced on auth endpoints
- [ ] Helmet security headers are enabled
- [ ] httpOnly and secure cookies are set in production
- [ ] Database backups are automated
- [ ] Logging is enabled and monitored

## Database Migrations

### Create New Migration (if making schema changes)

```bash
cd backend
npm run migration:generate -- src/migrations/InitialSchema
```

### Run Migrations

```bash
npm run migration:run
```

### Revert Last Migration

```bash
npm run migration:revert
```

## Monitoring & Logs

Logs are stored in `logs/production.log`:

```bash
# Monitor logs in real-time
tail -f logs/production.log

# Search logs
grep ERROR logs/production.log
```

## Troubleshooting

### Database Connection Issues

```bash
# Test PostgreSQL connection
psql -h your-host -U mechlib_user -d mechlib_prod
```

### Port Already in Use

```bash
# Find process using port 8000
lsof -i :8000

# Kill process
kill -9 <PID>
```

### JWT Secret Not Set

```bash
# Verify environment variable is set
echo $JWT_SECRET

# If empty, source .env.production
source backend/.env.production
```

## Performance Tips

- Use PostgreSQL in production (not SQLite)
- Enable query logging in development only
- Use PM2 or similar for process management
- Implement Redis caching for frequent queries
- Setup CDN for frontend static assets
- Monitor database query performance
- Setup automated backups

## Rollback Plan

If deployment fails:

```bash
# Revert database migration
npm run migration:revert

# Restore from backup
# (depends on your backup strategy)

# Restart service
pm2 restart mechlib-api
```

## Next Steps

- [ ] Setup error monitoring (Sentry, DataDog)
- [ ] Implement automated backups
- [ ] Setup CI/CD pipeline (GitHub Actions, GitLab CI)
- [ ] Configure email notifications for alerts
- [ ] Setup API rate limiting per user
- [ ] Implement request/response logging
- [ ] Add database connection pooling
- [ ] Monitor server resources
