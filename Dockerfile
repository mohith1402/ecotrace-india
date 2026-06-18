# Use official lightweight Node.js image
FROM node:18-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package configurations
COPY package*.json ./

# Install production dependencies
RUN npm install --production

# Copy remaining source code
COPY . .

# Expose port 8080 (Cloud Run default port)
EXPOSE 8080

# Start Express server
CMD ["node", "server.js"]
