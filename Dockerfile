# Dockerfile for running masao-site-undator
# required environment variables:
#   SECRET = secret for hmac digest.
#   DIGEST = message digest sent from GitHub.
FROM node:8
MAINTAINER uhyo
WORKDIR /service-masao-site-updator
RUN chown node:node $(pwd)
USER node
# put things into working directory.
# prepare mount point for git repository
RUN mkdir git
# install dependencies
COPY ./*.json ./
RUN npm install --production
# copy files 
COPY ./*.sh ./*.js ./
COPY ./public/static ./public/static/
# make git part a volume so that it is variable.
VOLUME /service-masao-site-updator/git
# make public part a volume.
VOLUME /service-masao-site-updator/public/dist
# expose port 8080
EXPOSE 8080
# define entry point of command.
CMD ["npm", "start"]
