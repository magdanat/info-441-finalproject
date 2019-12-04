# Create a new Docker container image for your messages microservice 
# and one for your Go page summary microservice. Push them to Docker Hub 
# and deploy them to your API server VM. Run at least one instance of 
# each within your Docker private network on that VM. DO NOT publish any 
# ports when starting these microservices so that they are callable only 
# from your API gateway, and not directly from the Internet.

# use `node` image as the base
FROM node
# set the current working directory to /app
WORKDIR /app
# copy the package.json and package-lock.json files to the work directory
COPY package.json package-lock.json ./
# run npm install to install all dependent packages
RUN npm install
# copy your JavaScript source files
COPY . .
# set the entrypoint command
ENTRYPOINT ["node", "main.js"]
