FROM php:8.2-fpm

# Instalar dependencias
RUN apt-get update && apt-get install -y \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    zip \
    unzip

# Instalar extensiones PHP
RUN docker-php-ext-install pdo pdo_mysql

# Limpiar cache
RUN apt-get clean && rm -rf /var/lib/apt/lists/*