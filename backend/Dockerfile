FROM node:20-alpine

WORKDIR /app/backend

# Install dependencies
COPY backend/package*.json ./
RUN npm ci --only=production

# Copy application code
COPY backend/dist ./dist
COPY backend/.env.production ./

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8000', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Run application
CMD ["node", "dist/main.js"]
