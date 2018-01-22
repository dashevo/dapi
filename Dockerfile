FROM 103738324493.dkr.ecr.us-west-2.amazonaws.com/dashevo/v13-node-base:latest
LABEL maintainer="Dash Developers <dev@dash.org>"
LABEL description="Dockerised DAPI"

RUN apk update && apk --no-cache upgrade && apk add --no-cache git openssh-client python alpine-sdk libzmq zeromq-dev

WORKDIR /dapi

# copy package manifest separately from code to avoid installing packages every
# time code is changed
COPY package.json package-lock.json /dapi/
RUN npm install

COPY . /dapi

EXPOSE 3000

<<<<<<< HEAD
ENV NODE_ENV=regtest
CMD ["node", "/dapi/lib/app.js"]
=======
CMD ["node", "/dapi/nodeStarter.js"]
>>>>>>> e62812b210c359a4442b9dfb8c01c30eb6e740a8
