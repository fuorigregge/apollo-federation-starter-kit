FROM node:lts

RUN yarn global add nodemon

ENV USER node

ENV APP_HOME /app
RUN mkdir -vp ${APP_HOME}
RUN chown ${USER}:${USER} ${APP_HOME}

USER ${USER}
ENV HOME /home/${USER}

WORKDIR ${APP_HOME}
COPY ./package.* .

#COPY /assets/.env.docker /assets/.env
#RUN mkdir -vp /assets/logs

RUN yarn install && \
    yarn cache clean --force

COPY . ${APP_HOME}

CMD [ "yarn", "run", "docker" ]

EXPOSE 5001 9230
