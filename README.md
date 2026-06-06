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

No Linux/macOS, ajuste `UID`/`GID` no `.env` para os do seu usuário (evita
problemas de permissão nos volumes):

```bash
echo "UID=$(id -u)" >> .env
echo "GID=$(id -g)" >> .env
```

### 2. Construa as imagens

```bash
make build
# ou, sem o Makefile:
docker compose build
```

### 3. Instale o esqueleto do Laravel (apenas na primeira vez)

O diretório `src/` está vazio. Instale o Laravel dentro dele:

```bash
make install
# ou, sem o Makefile:
docker compose run --rm app composer create-project laravel/laravel .
```

### 4. Suba os containers

```bash
make up
# ou:
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

> **Importante:** `DB_HOST` deve ser `db` (nome do serviço no Compose), e não
> `127.0.0.1`, pois a comunicação ocorre dentro da rede Docker.

### 6. Gere a chave e rode as migrations

```bash
make key      # docker compose exec app php artisan key:generate
make migrate  # docker compose exec app php artisan migrate
```

### 7. Acesse a aplicação

- Aplicação: http://localhost:8080
- MySQL: `localhost:3306` (usuário `terapia`, senha `secret`)

---

## Comandos úteis (Makefile)

| Comando                          | Descrição                                        |
|----------------------------------|--------------------------------------------------|
| `make build`                     | Constrói as imagens.                             |
| `make up`                        | Sobe o ambiente em segundo plano.                |
| `make down`                      | Para e remove os containers.                     |
| `make restart`                   | Reinicia o ambiente.                             |
| `make logs`                      | Acompanha os logs.                               |
| `make shell`                     | Abre um shell no container `app`.                |
| `make migrate`                   | Executa as migrations.                           |
| `make fresh`                     | Recria o banco e roda migrations + seeders.      |
| `make composer c="require pkg"`  | Executa um comando do Composer.                  |
| `make artisan c="route:list"`    | Executa um comando do Artisan.                   |

Sem o Makefile, todos os comandos acima podem ser executados com
`docker compose exec app <comando>`.
