FROM node:20-alpine

WORKDIR /app

# Copy server files
COPY server-new/package*.json ./server/
COPY server-new/*.js ./server/

# Copy client build files (built separately)
COPY client/dist ./client/dist

# Install server dependencies
WORKDIR /app/server
RUN npm install --production

# Expose ports
EXPOSE 3001

# Set environment variables
ENV NODE_ENV=production

# Start server
CMD ["node", "index.js"]
