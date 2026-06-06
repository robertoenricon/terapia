# terapia

Controle sobre minhas terapias.

Sistema para controle e acompanhamento de terapias.

- **Backend:** PHP 8.3 / Laravel 12
- **Frontend:** React.js
- **Estilização:** Bootstrap 5 e CSS
- **Banco de dados:** MySQL 8
- **Ambiente:** Docker (Nginx + PHP-FPM + MySQL)

---

## Arquitetura Docker

O ambiente é composto por três containers:

| Serviço | Imagem            | Função                              | Porta (host) |
|---------|-------------------|-------------------------------------|--------------|
| `app`   | PHP 8.3-FPM       | Executa a aplicação Laravel         | —            |
| `nginx` | Nginx 1.27        | Servidor web (serve estáticos + PHP)| `8080`       |
| `db`    | MySQL 8.0         | Banco de dados                      | `3306`       |

A aplicação Laravel fica no diretório `src/`, mantendo a infraestrutura Docker
separada do código do app.

```
terapia/
├── docker/
│   ├── php/        # Dockerfile e php.ini
│   ├── nginx/      # default.conf
│   └── mysql/      # my.cnf
├── src/            # aplicação Laravel (instalada via comando abaixo)
├── docker-compose.yml
├── .env.example    # variáveis da infraestrutura
└── Makefile        # atalhos
```

---

## Pré-requisitos

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/) (v2, embutido no Docker)

---

## Como subir o ambiente

### 1. Configure as variáveis da infraestrutura

```bash
cp .env.example .env
```

### 2. Construa as imagens

```bash
docker compose build
```

```bash
docker compose exec app bash
```

### 3. Instale o esqueleto do Laravel (apenas na primeira vez)

O diretório `src/` já contém o arquivo `.gitkeep`, então o `composer
create-project` não pode instalar diretamente nele (exige um diretório vazio).
Instale em um diretório temporário e copie o conteúdo para `src/`:

```bash
composer create-project laravel/laravel .
```

### 4. Suba os containers

```bash
docker compose up -d
```

### 5. Configure o `.env` do Laravel

Edite `src/.env` para apontar ao container do MySQL. Os valores devem bater
com os do `.env` da raiz:

```dotenv
DB_CONNECTION=mysql
DB_HOST=db
DB_PORT=3306
DB_DATABASE=terapia
DB_USERNAME=terapia
DB_PASSWORD=secret
```

> **Importante:** `DB_HOST` deve ser `db` (nome do serviço no Compose).

### 6. Gere a chave e rode as migrations

```bash
php artisan key:generate
php artisan migrate
```

### 7. Acesse a aplicação

- Aplicação: http://localhost:8080
- MySQL: `localhost:3306` (usuário `terapia`, senha `secret`)