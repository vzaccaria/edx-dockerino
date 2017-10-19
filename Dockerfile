FROM node:5.10
ENV DEBIAN_FRONTEND noninteractive

RUN apt-get update
RUN apt-get install -y octave
COPY package.json package-lock.json ./
RUN npm install
COPY . .
RUN ./node_modules/.bin/babel-node configure.js
RUN make all
EXPOSE 3000
