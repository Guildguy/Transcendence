FROM node:20-slim

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install && \
    npm install \
        @types/react \
        @types/react-dom \
        @radix-ui/react-select \
        @radix-ui/react-switch \
        @radix-ui/react-label \
        @radix-ui/react-dialog \
        @radix-ui/react-toast \
        lucide-react \
        date-fns

COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host"]