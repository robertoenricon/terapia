# ----------------------------------------------------------------------------
# Imagem PHP-FPM 8.3 para a aplicacao Laravel do projeto "semear".
# Instala as extensoes exigidas pelo Laravel 12 e o Composer.
# ----------------------------------------------------------------------------
FROM php:8.3-fpm-alpine

# Argumentos para criar um usuario sem privilegios alinhado ao host (evita
# problemas de permissao nos arquivos montados via volume).
ARG UID=1000
ARG GID=1000

# Pacotes de sistema necessarios para compilar/usar as extensoes do PHP.
# Inclui Node.js e npm para o build do frontend (React + Vite + Bootstrap).
RUN apk add --no-cache \
        bash \
        git \
        curl \
        nodejs \
        npm \
        libpng-dev \
        libjpeg-turbo-dev \
        freetype-dev \
        libzip-dev \
        oniguruma-dev \
        icu-dev \
        $PHPIZE_DEPS

# Extensoes do PHP comumente usadas em projetos Laravel.
RUN docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j"$(nproc)" \
        pdo_mysql \
        mbstring \
        bcmath \
        gd \
        zip \
        exif \
        pcntl \
        intl \
        opcache

# Redis via PECL (cache/filas opcionais).
RUN pecl install redis \
    && docker-php-ext-enable redis

# Composer (copiado da imagem oficial).
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Cria o usuario da aplicacao com o mesmo UID/GID do host.
RUN addgroup -g "${GID}" appuser \
    && adduser -D -u "${UID}" -G appuser appuser

WORKDIR /var/www/html

USER appuser

EXPOSE 9000

CMD ["php-fpm"]
