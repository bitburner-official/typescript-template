# Use the official Node.js image as the base image
FROM node:latest

# Create a working directory inside the container
WORKDIR /app

# Copy the package.json and package-lock.json to the container
COPY package*.json ./

# Install application dependencies
RUN npm install

# Copy all files to the container (but ignore paths specified in .dockerignore)
COPY . /app/

# Expose the port the filesync will listen on
EXPOSE 12525

# Run filesync watch when the container starts 
CMD npm run watch