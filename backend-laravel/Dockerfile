# ============================================================
#  ENTSI — Dockerfile Laravel 11 (PHP 8.3)
#  Path: backend-laravel/Dockerfile
# ============================================================

FROM php:8.4-fpm-alpine

# ------------------------------------------------------------
# System dependencies
# ------------------------------------------------------------
RUN apk add --no-cache \
    bash \
    curl \
    unzip \
    git \
    autoconf \
    g++ \
    make \
    libpng-dev \
    libjpeg-turbo-dev \
    libwebp-dev \
    libzip-dev \
    oniguruma-dev \
    postgresql-dev \
    redis \
    supervisor \
    nginx

# ------------------------------------------------------------
# PHP Extensions
# ------------------------------------------------------------
RUN docker-php-ext-configure gd --with-jpeg --with-webp && \
    docker-php-ext-install \
        pdo \
        pdo_pgsql \
        pgsql \
        mbstring \
        zip \
        gd \
        bcmath \
        opcache \
        pcntl

# Redis PHP extension
RUN pecl install redis && docker-php-ext-enable redis

# ------------------------------------------------------------
# Composer
# ------------------------------------------------------------
COPY --from=composer:2.7 /usr/bin/composer /usr/bin/composer

# ------------------------------------------------------------
# Working directory
# ------------------------------------------------------------
WORKDIR /var/www/html

# ------------------------------------------------------------
# Copy composer files first (cache layer)
# ------------------------------------------------------------
COPY composer.json composer.lock ./
RUN composer install --no-scripts --no-autoloader --prefer-dist --no-dev

# ------------------------------------------------------------
# Copy application source
# ------------------------------------------------------------
COPY . .

# ------------------------------------------------------------
# Composer autoload + optimize
# ------------------------------------------------------------
RUN composer dump-autoload --optimize && \
    php artisan config:cache && \
    php artisan route:cache && \
    php artisan view:cache

# ------------------------------------------------------------
# Permissions
# ------------------------------------------------------------
RUN chown -R www-data:www-data /var/www/html/storage \
                                /var/www/html/bootstrap/cache && \
    chmod -R 775 /var/www/html/storage \
                 /var/www/html/bootstrap/cache

# ------------------------------------------------------------
# Shared storage (volume Laravel ↔ FastAPI)
# ------------------------------------------------------------
RUN mkdir -p /var/shared-storage/uploads \
             /var/shared-storage/outputs && \
    chown -R www-data:www-data /var/shared-storage

# ------------------------------------------------------------
# PHP config (opcache production)
# ------------------------------------------------------------
COPY docker/php/opcache.ini /usr/local/etc/php/conf.d/opcache.ini
COPY docker/php/php.ini     /usr/local/etc/php/conf.d/custom.ini

# ------------------------------------------------------------
# Nginx config
# ------------------------------------------------------------
COPY docker/nginx/default.conf /etc/nginx/http.d/default.conf

# ------------------------------------------------------------
# Supervisor (PHP-FPM + Nginx + Queue Worker)
# ------------------------------------------------------------
COPY docker/supervisor/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Create supervisor log directory
RUN mkdir -p /var/log/supervisor /var/run

EXPOSE 80

CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]