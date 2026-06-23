FROM php:8.3-fpm-alpine

# Install system dependencies
RUN apk add --no-cache \
    nginx \
    curl \
    bash \
    git \
    oniguruma-dev \
    autoconf \
    g++ \
    make \
    nodejs \
    npm \
    postgresql-dev \
    libpq \
    icu-dev

# Install PHP extensions
RUN docker-php-ext-install pdo pdo_mysql pdo_pgsql mbstring

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Configure Nginx
RUN mkdir -p /var/www/html
COPY conf/nginx/nginx-site.conf /etc/nginx/http.d/default.conf

# Copy application files
COPY . /var/www/html
WORKDIR /var/www/html

# Make deploy script executable
RUN chmod +x /var/www/html/scripts/00-laravel-deploy.sh

# Expose ports
EXPOSE 80

# Set environment variables
ENV APP_ENV=production
ENV APP_DEBUG=false
ENV LOG_CHANNEL=stderr
ENV COMPOSER_ALLOW_SUPERUSER=1

# Start services and run deployment
CMD ["sh", "-c", "/var/www/html/scripts/00-laravel-deploy.sh && php-fpm -D && nginx -g 'daemon off;'"]

