# MechLib Security Guidelines

## Overview

This document outlines security best practices implemented in MechLib and recommendations for production deployment.

## Authentication & Authorization

### JWT Security
- JWT tokens are issued with 2-hour expiration
- Tokens are stored in httpOnly cookies (XSS protection)
- Secure flag enabled in production (HTTPS-only)
- SameSite=Strict to prevent CSRF attacks

### Password Security
- Passwords hashed with bcrypt (cost factor 10)
- Minimum 6 characters required
- Case-sensitive authentication

### Rate Limiting
- Login/Register: Max 5 attempts per 15 minutes
- General API: 100 requests per 15 minutes
- Prevents brute-force attacks

## Data Protection

### Sensitive Fields Excluded
- `password_hash` excluded from all responses
- `failed_login_attempts` not exposed
- `locked_until` field not exposed

### Input Validation
- Class-validator enforces strict DTOs
- Email format validation
- Roll number format validation (3-12 alphanumeric uppercase)
- Name format validation (letters, spaces, hyphens only)

### SQL Injection Prevention
- TypeORM parameterized queries
- No raw SQL queries
- LIKE searches properly escaped

## Network Security

### CORS Configuration
- Strict origin validation
- Credentials require explicit domain matching
- Can be configured per environment

### HTTPS
- Required in production
- Redirects HTTP to HTTPS
- Set `secure: true` for cookies

### Security Headers
- Helmet.js enforces security headers
- X-Frame-Options: DENY (prevents clickjacking)
- X-Content-Type-Options: nosniff
- Strict-Transport-Security (HSTS)

## Database Security

### Backup Strategy
- Automated daily backups recommended
- Store backups in secure location
- Test restore procedures monthly

### Access Control
- Separate database user per environment
- Minimal required permissions
- No root/admin database access

### Connection Security
- Use SSL/TLS for database connections
- Connection pooling to prevent exhaustion

## Error Handling

### Information Disclosure
- Detailed error messages only in development
- Production errors show generic messages
- Stack traces not exposed to clients
- Structured logging for debugging

## Deployment Security

### Environment Variables
- Never commit `.env` files
- Rotate secrets regularly
- Use environment management (AWS Secrets Manager, Vault, etc.)
- Different credentials per environment

### Build & Dependencies
- Pin exact versions in production
- Regular npm audit and updates
- Remove dev dependencies from production builds
- Code review before deployments

## Audit Trail

### User Actions Logged
- All mutations (POST, PUT, DELETE)
- User ID recorded
- IP address recorded
- Timestamp included
- Success/failure status

## Recommendations for Production

### Must Implement
1. Switch from SQLite to PostgreSQL
2. Generate strong JWT secret (32+ chars with special chars)
3. Enable HTTPS with valid certificate
4. Setup regular database backups
5. Monitor error logs for anomalies
6. Implement rate limiting verification

### Should Implement
1. Error monitoring (Sentry, DataDog)
2. Performance monitoring
3. Automated security scanning
4. API versioning
5. Request logging
6. User activity monitoring
7. 2-Factor authentication for admin accounts
8. Refresh token mechanism

### Nice to Have
1. IP whitelisting for admin endpoints
2. Bot detection (reCAPTCHA)
3. DDoS protection (Cloudflare)
4. Web Application Firewall (WAF)
5. API documentation (Swagger)
6. Penetration testing

## Compliance

### Data Privacy
- Implement GDPR compliance if serving EU users
- Implement CCPA compliance if serving California users
- User data deletion mechanism
- Data export functionality

### Security Standards
- Follow OWASP Top 10 guidelines
- Implement NIST cybersecurity framework
- Regular security audits
- Penetration testing

## Incident Response

### If Compromised
1. Invalidate all JWT tokens
2. Force password reset for all users
3. Review audit logs for suspicious activity
4. Backup current database state
5. Investigate root cause
6. Implement fixes
7. Redeploy
8. Notify users if data was exposed

## Reporting Security Issues

If you discover a security vulnerability:
1. Do NOT publicly disclose
2. Email security@yourdomain.com with details
3. Include steps to reproduce
4. Allow 48 hours for response
5. Allow time for patch before public disclosure

## References

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [NestJS Security](https://docs.nestjs.com/security/authentication)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8949)
- [PostgreSQL Security](https://www.postgresql.org/docs/current/sql-syntax.html)
