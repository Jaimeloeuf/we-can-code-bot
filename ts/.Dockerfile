# To build and run the image from this Dockerfile, where x is the name of the worker node's JS file name
# docker build -t relayer-server -f ./.Dockerfile .
# docker run -it --rm --name relayer relayer-server
# 
# Why the server needs to be built first before the image is built:
#   - For performance and image size reasons, the code is built locally first before being sent to the daemon for building the image.
#   - Building can be done on the image but since it will be on top of the image running on the daemon it adds additional performance overhead.
# 
# Why is RUN used and why they are split up:
#   - Use RUN instruction to install packages required by executing commands on top of the current image to create a new layer by committing the results.
#   - The RUN commands are all split them up as different ephemeral intermmediate images to optimize the build process for caching


FROM node:10-alpine

# Set the working directory of . from here on to be /app
WORKDIR /app

# Copy both package.json and package-lock.json in for installing dependencies with "npm ci"
COPY package*.json ./

# Install items and build tools needed to install the npm packages
# RUN apk add --no-cache --virtual .gyp \
#         python \
#         make \
#         g++ \
#         git

# Install all production dependencies using lock file for a deterministic dependency installation
# Delete .gyp files after installation
RUN npm ci --only=production && apk del .gyp

# Only copy the build file into current WORKDIR
COPY ./build/* .

# Define exposed ports, acting only as documentation. You STILL need to map the ports with -p option with docker run
# EXPOSE 2090

# ENTRYPOINT Command ensures this command runs when the container is spun up, and cannot be overwritten with shell arguements like CMD
# Use shell form to get the shell to process/intepret the commands instead of calling the executable directly to use the ENV value
# exec form does not have the shell's ability to intepret the workerNameENV, thus can't be used
# ENTRYPOINT npm run start
ENTRYPOINT ["npm" "run" "start"]