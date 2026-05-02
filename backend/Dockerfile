# Base image
FROM node:20-slim

# Create app directory
WORKDIR /app

# Install app dependencies
COPY package*.json ./
RUN npm install --production

# Bundle app source
COPY . .

# Expose port
EXPOSE 10000

# Set environment to production
ENV NODE_ENV=production
ENV PORT=10000

# Run the server
CMD ["node", "src/server.js"]
