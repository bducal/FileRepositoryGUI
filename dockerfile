FROM node:16.10-alpine as build-step
WORKDIR /usr/local/app
COPY ./ /usr/local/app/
RUN npm install
RUN npm run build --prod


FROM nginx:1.17.1-alpine

COPY --from=build-step /usr/local/app/src/nginx.conf /etc/nginx/
COPY --from=build-step /usr/local/app/dist/files /usr/share/nginx/html
EXPOSE 80

# FROM node:16.10-alpine as build-step
# WORKDIR /usr/local/app
# COPY ./ /usr/local/app/
# ##local without authentication
# #RUN echo '{"Title": "File repository v1 (docker-local)","useAuthentication": "False","API_URL":"http://localhost:5155/api"}' > /usr/local/app/src/assets/config.json
# #remote with authentication
# RUN echo '{"Title": "File repository v1 (dockerx)","useAuthentication": "True","API_URL":"https://mongofilesapi.ducal.pl/api"}' > /usr/local/app/src/assets/config.json
# RUN npm install
# RUN npm run build --prod


# FROM nginx:1.17.1-alpine

# COPY --from=build-step /usr/local/app/src/nginx.conf /etc/nginx/
# COPY --from=build-step /usr/local/app/dist/files /usr/share/nginx/html
# EXPOSE 80