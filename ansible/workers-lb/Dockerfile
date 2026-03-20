FROM nginx:alpine

# Copy custom nginx config
COPY workers-lb.conf /etc/nginx/conf.d/default.conf

# Expose nginx HTTP port
EXPOSE 80

# Start nginx in foreground (default CMD is fine)
CMD ["nginx", "-g", "daemon off;"]