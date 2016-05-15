FROM node:5.10
ENV DEBIAN_FRONTEND noninteractive

RUN apt-get update
RUN apt-get install -y octave
RUN npm i vz-dockerino@0.0.11 -g
RUN groupadd -r dockerino && useradd -r -g dockerino dockerino
USER dockerino
CMD ["vz-dockerino"]
EXPOSE 3000