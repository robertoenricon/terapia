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

- Login: http://localhost:8080/login
- Diário: http://localhost:8080/diario
- MySQL: `localhost:3306` (usuário `terapia`, senha `secret`)

### Credenciais Login

Ao executar `php artisan migrate --seed`, uma conta administrativa é criada
com os valores definidos no `.env` do Laravel:

```dotenv
ADMIN_NAME=admin
ADMIN_PASSWORD=pass
```

Altere a senha antes de usar a aplicação fora do ambiente local. O login usa
sessão armazenada no MySQL, e as rotas do diário e da API exigem autenticação.

---

## Frontend (React + Bootstrap 5)

O esqueleto padrão do Laravel foi adaptado para usar **React** (via Vite) e
**Bootstrap 5** no lugar do Tailwind. As alterações já estão versionadas; a
tabela abaixo resume o que cada arquivo passou a fazer:

- `package.json` -> Adicionados react, react-dom, @vitejs/plugin-react (v6, compatível com Vite 8) e bootstrap; removido Tailwind
- `vite.config.js` -> Plugin React habilitado; entrada alterada para app.jsx
- `resources/css/app.css` -> Importa o Bootstrap 5 + estilo do gradiente da tela
- `resources/js/app.jsx` -> Ponto de entrada que monta o React no #app
- `resources/js/bootstrap.js` -> Carrega os componentes JS do Bootstrap
- `resources/js/components/Welcome.jsx` -> Tela de boas-vindas com título, chamada e cards de recursos
- `resources/views/welcome.blade.php` -> Reduzida ao shell que monta o React via @vite

### Rodando o frontend

Em seguida, dentro do container (`docker compose exec app bash`), na raiz do
Laravel:

```bash
composer install      # dependências PHP (caso ainda não instaladas)
npm install           # dependências JS (React, Bootstrap, Vite)
npm run build         # compila os assets e gera public/build/manifest.json
```

> Sem o `npm run build` (ou `npm run dev`), o Laravel lança
> `ViteManifestNotFoundException`, pois procura os assets compilados em
> `public/build/manifest.json`.

Para desenvolvimento com **hot reload**, use o atalho do Laravel 12 que sobe o
servidor PHP e o Vite em paralelo:

```bash
composer dev
```

Para o build final de produção, use `npm run build`.

---

## Deploy na LocalWeb (Hospedagem compartilhada / cPanel)

Guia para publicar o sistema em um plano de **Hospedagem de Sites** da LocalWeb
(cPanel), enviando os arquivos por **FTP** com o build feito **localmente na sua máquina**. Nesse tipo de plano não há acesso root e o `vendor/` e o
`public/build` precisam ser compilados antes do envio (eles não vão no Git).

### Visão geral do processo

1. Configurar o `.env` de produção e gerar a `APP_KEY` (local).
2. Instalar dependências e compilar o frontend (local).
3. Criar o banco MySQL no painel e importar a estrutura (via phpMyAdmin).
4. Definir o PHP 8.3 no cPanel.
5. Enviar os arquivos por FTP, com o Laravel **fora** da pasta pública.
6. Ajustar permissões, HTTPS e validar.

### Pré-requisitos locais

- PHP 8.3+, Composer e Node.js instalados na sua máquina (ou rode os comandos
  pelo container Docker: `docker compose exec app bash`).
- Cliente FTP (FileZilla) ou o **Gerenciador de Arquivos** do cPanel.
- Acesso ao painel da LocalWeb (cPanel, phpMyAdmin e dados de FTP).

---

### Passo 1 — Configurar o `.env` de produção (local)

Dentro de `src/`, crie o `.env` a partir do modelo de produção e gere a chave:

```bash
cp .env.production.example .env
php artisan key:generate
```

Edite o `src/.env` e preencha os campos marcados com `ALTERAR`:

- `APP_URL` → o endereço do subdomínio, com **https** (ex.:
  `https://diario.seu-dominio.com.br`).
- `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD` → os dados do banco que você vai
  criar no Passo 3 (`DB_HOST=localhost` na hospedagem compartilhada).
- `ADMIN_NAME`, `ADMIN_PASSWORD` → defina uma **senha forte** antes de semear.
- `MAIL_*` → dados de SMTP da LocalWeb, caso vá enviar e-mails.

> O `.env` **nunca** é versionado nem enviado por Git, mas precisa ser enviado
> por FTP junto com a aplicação (veja o Passo 5).

### Passo 2 — Build local (dependências + frontend)

Ainda em `src/`, instale as dependências de produção e compile os assets:

```bash
composer install --no-dev --optimize-autoloader
npm ci
npm run build
```

Isso gera o `vendor/` (sem pacotes de desenvolvimento) e o `public/build/`
(JS/CSS compilados + `manifest.json`). Ambos serão enviados por FTP.

> **Não** rode `php artisan config:cache` localmente: o cache grava caminhos
> absolutos da sua máquina e quebra no servidor. Deixe o cache desligado nesse
> fluxo por FTP (a aplicação funciona normalmente sem ele).

### Passo 3 — Banco de dados MySQL

**3.1. Crie o banco no painel:** no cPanel da LocalWeb, em **"Bancos de Dados
MySQL"**, crie um banco, um usuário e associe o usuário ao banco com **todos os
privilégios**. Anote nome do banco, usuário e senha (vão no `.env`).

**3.2. Gere a estrutura localmente:** rode as migrations e o seeder do admin
contra um MySQL local (o do Docker serve) para montar as tabelas e o usuário
administrador:

```bash
php artisan migrate --seed
```

**3.3. Exporte e importe:** exporte o banco local (via phpMyAdmin local ou
`mysqldump`) e importe no **phpMyAdmin da LocalWeb**, selecionando o banco
criado no passo 3.1.

```bash
# exemplo de export por linha de comando (host/usuário do ambiente local)
mysqldump -u terapia -p terapia > terapia.sql
```

> Como o hash da senha (bcrypt) **não depende da `APP_KEY`**, o admin semeado
> localmente continua válido após a importação. Opcionalmente, limpe as linhas
> das tabelas `sessions` e `cache` antes de exportar (são temporárias).

### Passo 4 — Definir o PHP 8.3 no cPanel

Em **"Selecionar versão do PHP"** (MultiPHP Manager), selecione **PHP 8.3** para
o domínio. Garanta que as extensões usuais do Laravel estejam ativas:
`bcmath`, `ctype`, `fileinfo`, `json`, `mbstring`, `openssl`, `pdo`,
`pdo_mysql`, `tokenizer`, `xml`.

### Passo 5 — Enviar os arquivos por FTP

> **Cenário deste projeto:** um **subdomínio** apontando para a pasta
> `public_html/diario`. O site é servido na raiz do subdomínio
> (`https://diario.seu-dominio.com.br/`), então os assets em `/build/...`
> funcionam sem ajuste de caminho. Use esse endereço no `APP_URL` do `.env`.

Por segurança, o código do Laravel deve ficar **fora** da área pública,
expondo apenas o conteúdo de `public/` na pasta `diario`.

**Abordagem recomendada (mais simples e segura) — apontar o subdomínio para
`public`:**

1. Envie **todo o conteúdo de `src/`** (incluindo `vendor/`, `public/build` e
   `.env`, mas **sem** `node_modules/`) para uma pasta **fora** do `public_html`,
   por exemplo `/home/SEU_USUARIO/terapia_app/`.
2. No cPanel, em **"Domínios" / "Subdomínios"**, altere o **document root** do
   subdomínio de `public_html/diario` para `terapia_app/public`.

Pronto — nada para copiar nem editar. O código (`app/`, `vendor/`, `.env`...)
fica inacessível pela web, e só o `public/` é servido.

**Abordagem alternativa — manter o document root em `public_html/diario`:**

Se preferir não mexer no apontamento do subdomínio:

1. Envie todo o conteúdo de `src/` para uma pasta fora do `public_html`, ex.
   `/home/SEU_USUARIO/terapia_app/`.
2. Copie **o conteúdo de `terapia_app/public/`** (`index.php`, `.htaccess`,
   `favicon.ico`, `robots.txt` e a pasta `build/`) para dentro de
   `public_html/diario/`.
3. Edite o `public_html/diario/index.php` apontando para a pasta da aplicação.
   Como `diario` está **dois níveis** abaixo da home (`public_html/diario`), o
   caminho relativo usa `../../`:

   ```php
   // de:
   require __DIR__.'/../vendor/autoload.php';
   (require_once __DIR__.'/../bootstrap/app.php')

   // para:
   require __DIR__.'/../../terapia_app/vendor/autoload.php';
   (require_once __DIR__.'/../../terapia_app/bootstrap/app.php')
   ```

   Ajuste também a linha do modo de manutenção, se presente:
   `__DIR__.'/../../terapia_app/storage/framework/maintenance.php'`.

> **Evite** colocar o app dentro de `public_html/diario`: tudo sob `public_html`
> pode ficar acessível pelo domínio principal (ex.: `seu-dominio.com.br/diario/.env`).
> Por isso a aplicação fica em `terapia_app/`, fora do `public_html`.

> Itens que **não** devem ir para o servidor: `node_modules/`, `.git/`,
> `tests/` e os arquivos de desenvolvimento. O `vendor/` e o `public/build`
> **devem** ir (foram gerados no Passo 2).

### Passo 6 — Permissões de escrita

Garanta que o Laravel possa gravar logs, cache e views compiladas. Pelo
Gerenciador de Arquivos do cPanel ou por FTP, defina as pastas abaixo (dentro de
`terapia_app`) como **755**:

```
storage/                (e todas as subpastas)
bootstrap/cache/
```

### Passo 7 — HTTPS e segurança

1. Ative o **certificado SSL** do domínio no painel da LocalWeb (AutoSSL/Let's
   Encrypt).
2. Force o redirecionamento para https adicionando ao `.htaccess` da pasta
   pública servida pelo subdomínio (`terapia_app/public/.htaccess` na abordagem
   recomendada, ou `public_html/diario/.htaccess` na alternativa), logo após
   `RewriteEngine On`:

   ```apache
   # Força HTTPS em produção
   RewriteCond %{HTTPS} off
   RewriteRule ^ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
   ```

3. Confirme que `APP_DEBUG=false` no `.env` (já vem assim no modelo de
   produção) para não expor detalhes de erro.

### Passo 8 — Validação pós-deploy

Acesse e verifique:

- `https://diario.seu-dominio.com.br/login` → tela de login carrega com os
  estilos (se vier sem CSS, o `public/build` não foi enviado ou está em local
  errado).
- Faça login com `ADMIN_NAME` / `ADMIN_PASSWORD`.
- Crie e exclua um registro para validar banco e sessão.

---

### Atualizações futuras (redeploy)

Para publicar uma nova versão:

```bash
# local, dentro de src/
git pull
composer install --no-dev --optimize-autoloader
npm ci && npm run build
```

Depois envie por FTP apenas o que mudou — tipicamente `app/`, `resources/`,
`routes/`, `public/build/` e, se houve atualização de dependências, o
`vendor/`. Se houver novas migrations, gere o SQL localmente e importe as
alterações pelo phpMyAdmin (não há `artisan migrate` sem SSH).

### Checklist rápido

- [ ] `.env` de produção preenchido, com `APP_KEY` gerada e `APP_DEBUG=false`.
- [ ] `composer install --no-dev` e `npm run build` executados localmente.
- [ ] Banco MySQL criado no painel e estrutura importada via phpMyAdmin.
- [ ] PHP 8.3 selecionado no cPanel.
- [ ] App em `terapia_app/` (fora de `public_html`); só o `public/` exposto.
- [ ] Subdomínio apontado para `terapia_app/public` **ou** `index.php` em
      `public_html/diario` ajustado com `../../terapia_app`.
- [ ] `storage/` e `bootstrap/cache/` com permissão de escrita.
- [ ] SSL ativo e redirecionamento HTTPS no `.htaccess`.

### Problemas comuns

| Sintoma | Causa provável | Solução |
|---|---|---|
| Página sem CSS/JS | `public/build` ausente ou em pasta errada | Reenvie `public/build` para a pasta pública e confirme o `manifest.json` |
| Erro 500 em branco | Permissão de `storage/` ou `.env` ausente | Defina `storage/` como 755 e confirme o envio do `.env` |
| `ViteManifestNotFoundException` | `npm run build` não foi rodado | Rode o build local e reenvie `public/build` |
| Erro de conexão com banco | Dados de `DB_*` errados | Confira banco/usuário/senha e `DB_HOST=localhost` |
| `No application encryption key` | `APP_KEY` vazia | Rode `php artisan key:generate` local e reenvie o `.env` |
