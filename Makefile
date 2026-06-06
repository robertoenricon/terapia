# ----------------------------------------------------------------------------
# Atalhos para operar o ambiente Docker do projeto "terapia".
# Uso: make <alvo>   (ex.: make up)
# ----------------------------------------------------------------------------

# Comando base do Compose.
DC = docker compose

.PHONY: help build up down restart logs shell install key migrate fresh composer artisan

## help: Lista os alvos disponiveis.
help:
	@grep -E '^## ' $(MAKEFILE_LIST) | sed 's/## //'

## build: Constroi as imagens dos containers.
build:
	$(DC) build

## up: Sobe o ambiente em segundo plano.
up:
	$(DC) up -d

## down: Para e remove os containers.
down:
	$(DC) down

## restart: Reinicia os containers.
restart: down up

## logs: Acompanha os logs dos containers.
logs:
	$(DC) logs -f

## shell: Abre um shell no container da aplicacao.
shell:
	$(DC) exec app bash

## install: Instala o esqueleto do Laravel dentro de ./src.
install:
	$(DC) run --rm app composer create-project laravel/laravel .

## key: Gera a APP_KEY do Laravel.
key:
	$(DC) exec app php artisan key:generate

## migrate: Executa as migrations.
migrate:
	$(DC) exec app php artisan migrate

## fresh: Recria o banco e roda as migrations do zero.
fresh:
	$(DC) exec app php artisan migrate:fresh --seed

## composer: Executa um comando do Composer (ex.: make composer c="require pkg").
composer:
	$(DC) exec app composer $(c)

## artisan: Executa um comando do Artisan (ex.: make artisan c="route:list").
artisan:
	$(DC) exec app php artisan $(c)
