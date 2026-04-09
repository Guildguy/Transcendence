FROM nginx:stable-alpine

RUN apk add --no-cache openssl

RUN mkdir -p /etc/nginx/ssl /var/www/frontend

RUN mkdir -p /etc/nginx/ssl && \
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout /etc/nginx/ssl/transcendence.key \
    -out /etc/nginx/ssl/transcendence.crt \
    -subj "/C=BR/ST=SP/L=Sao Paulo/O=42sp/CN=ft_trans.42.fr"

RUN rm /etc/nginx/conf.d/default.conf

COPY ./conf/nginx.conf /etc/nginx/conf.d/default.conf

RUN chmod -R 755 /var/www/frontend

EXPOSE 80 443

CMD ["nginx", "-g", "daemon off;"]