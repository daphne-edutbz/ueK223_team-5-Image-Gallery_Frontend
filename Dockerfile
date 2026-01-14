 # Will create a node environment in the container
FROM node:16-alpine AS builder
 # Will create a directory app and switch to that directory
WORKDIR /app
# Copies package.json file and soruce code to /app directory
COPY package.json .
COPY .env.production .
COPY ./public ./public
COPY ./src ./src

# Runs npm install to create node_modules for your app
RUN yarn install --production
# builds the production version of the app
RUN yarn build

# Use a lightweight web server to serve the production build
FROM nginx:alpine

# Copy the production build from the builder stage to the nginx web server
COPY --from=builder /app/build /usr/share/nginx/html
# Copy config files
COPY .env.production .
COPY nginx.conf /etc/nginx/conf.d/default.conf
# Expose port 80
EXPOSE 80

# Start the nginx web server
CMD ["nginx", "-g", "daemon off;"]
