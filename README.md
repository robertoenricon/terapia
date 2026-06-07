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
- Semear: http://localhost:8080/semear
- MySQL: `localhost:3306` (usuário `terapia`, senha `secret`)

### Credenciais Login

Ao executar `php artisan migrate --seed`, uma conta administrativa é criada
com os valores definidos no `.env` do Laravel:

```dotenv
ADMIN_NAME=admin
ADMIN_PASSWORD=pass
```

Altere a senha antes de usar a aplicação fora do ambiente local. O login usa
sessão armazenada no MySQL, e as rotas do Semear e da API exigem autenticação.

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

- `APP_URL` → o domínio final, com **https** (ex.: `https://terapia.com.br`).
- `DB_HOST`, `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD` → os dados do banco que
  você vai criar no Passo 3. Na LocalWeb o MySQL é **DBaaS (remoto)**, então o
  host é algo como `terapia_diario.mysql.dbaas.com.br` (não `localhost`).
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

**3.1. Crie o banco no painel:** no painel da LocalWeb, em **"Bancos de Dados
MySQL"** (DBaaS), crie um banco e um usuário com **todos os privilégios**. Anote
o **host** (ex.: `terapia_diario.mysql.dbaas.com.br`), o nome do banco, o
usuário e a senha — vão no `.env`.

**3.2. Crie a estrutura:**

O `.env` para o host da DBaaS. Em `src/.env`:

```dotenv
DB_HOST=terapia_diario.mysql.dbaas.com.br
DB_PORT=3306
DB_DATABASE=seu_banco
DB_USERNAME=seu_usuario
DB_PASSWORD=sua_senha
```

Depois rode:

```bash
php artisan migrate --seed
```

Isso cria todas as tabelas e o admin direto no banco de produção — **dispensa** exportar/importar SQL. (Em um banco vazio você pode usar `migrate:fresh --seed` para garantir um estado limpo.)

### Passo 4 — Definir o PHP 8.3 no cPanel

Em **"Selecionar versão do PHP"** (MultiPHP Manager), selecione **PHP 8.3** para
o domínio. Garanta que as extensões usuais do Laravel estejam ativas:
`bcmath`, `ctype`, `fileinfo`, `json`, `mbstring`, `openssl`, `pdo`,
`pdo_mysql`, `tokenizer`, `xml`.

### Passo 5 — Enviar os arquivos e publicar a pasta pública

A ideia: o código do Laravel fica em `semear_app/` (**fora** do `public_html`,
por segurança) e o subdomínio, que aponta para `public_html/semear`, recebe
apenas o conteúdo de `public/`.

**5.1. Enviar o app para `semear_app/`**

O `vendor/` tem milhares de arquivos e o envio um a um por FTP é lento; por isso
compacte tudo num `.zip` e extraia no servidor:

1. Na sua máquina, abra a pasta `src/` no **Explorador de Arquivos** e ative a
   exibição de itens ocultos (aba **Exibir → Itens ocultos**) para enxergar o
   `.env`.
2. Selecione **tudo de dentro de `src/`** (`app/`, `bootstrap/`, `config/`,
   `database/`, `public/`, `resources/`, `routes/`, `storage/`, `vendor/`,
   `artisan`, `composer.json`, `composer.lock`, `.env`...), **menos** a pasta
   `node_modules/`. Botão direito → **Enviar para → Pasta compactada (zipada)**
   e renomeie para `deploy.zip`.
3. No cPanel → **Gerenciador de Arquivos**, crie a pasta `semear_app/` (fora do
   `public_html`), entre nela, use **"Carregar"** para subir o `deploy.zip`,
   depois botão direito → **"Extract"**. Apague o `.zip` ao final.

**5.2. Publicar a pasta pública em `public_html/semear`**

> **Atalho:** se o painel permitir, mude o **document root** do subdomínio de
> `public_html/semear` para `semear_app/public`. Aí você **não copia nada** nem
> edita o `index.php` — pule o restante deste passo.

Caso contrário (mantendo o subdomínio em `public_html/semear`):

1. Copie **todo o conteúdo de `semear_app/public/`** (a pasta `build/`, o
   `index.php`, o `.htaccess`, `favicon.ico`, `robots.txt`) para dentro de
   `public_html/semear/`. Pelo Gerenciador de Arquivos, entre em
   `semear_app/public`, selecione tudo e use **"Copiar"** informando o destino
   `/public_html/semear`.
2. Edite `public_html/semear/index.php` e troque os caminhos `../` por
   `../../semear_app/` (o app está dois níveis acima). O arquivo deve ficar
   assim:

   ```php
   <?php

   use Illuminate\Foundation\Application;
   use Illuminate\Http\Request;

   define('LARAVEL_START', microtime(true));

   // Determine if the application is in maintenance mode...
   if (file_exists($maintenance = __DIR__.'/../../semear_app/storage/framework/maintenance.php')) {
       require $maintenance;
   }

   // Register the Composer autoloader...
   require __DIR__.'/../../semear_app/vendor/autoload.php';

   // Bootstrap Laravel and handle the request...
   /** @var Application $app */
   $app = require_once __DIR__.'/../../semear_app/bootstrap/app.php';

   $app->handleRequest(Request::capture());
   ```

> **Importante:** só o conteúdo de `public/` pode ficar exposto na web. **Nunca**
> copie `app/`, `vendor/`, `.env` ou outras pastas do Laravel para
> `public_html/semear` — elas permanecem em `semear_app/`.

### Passo 6 — Permissões de escrita

Garanta que o Laravel possa gravar logs, cache e views compiladas. Pelo
Gerenciador de Arquivos do cPanel ou por FTP, defina as pastas abaixo (dentro de
`semear_app`) como **755**:

```
storage/                (e todas as subpastas)
bootstrap/cache/
```

### Passo 7 — HTTPS e segurança

1. Ative o **certificado SSL** do subdomínio no painel da LocalWeb (AutoSSL/Let's
   Encrypt). **Faça isso antes** de testar, senão o redirecionamento abaixo
   aponta para um `https://` sem certificado e o navegador bloqueia.
2. O redirecionamento de http para https **já está incluído** no `.htaccess` do
   projeto (`public/.htaccess`), então vai junto na cópia do Passo 5 — não
   precisa editar nada à mão.
3. Confirme que `APP_DEBUG=false` no `.env` (já vem assim no modelo de
   produção) para não expor detalhes de erro.

### Passo 8 — Validação pós-deploy

Acesse e verifique:

- `https://semear.seu-dominio.com.br/login` → tela de login carrega com os
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
`vendor/`. Se houver novas migrations, rode `php artisan migrate` da sua máquina
com o `.env` apontando para a DBaaS (mesmo esquema do Passo 3) — não precisa de
SSH no servidor.

---

## Deploy automático (GitHub Actions + FTP)

Em vez de buildar e enviar à mão, o repositório traz um workflow que faz isso
sozinho a cada `push` na branch **`main`**:
[`.github/workflows/deploy.yml`](.github/workflows/deploy.yml).

O que o workflow faz, na nuvem:

1. Instala o Node 22 e compila os assets (`npm ci && npm run build`).
2. Gera a pasta pública do subdomínio já com o `index.php` ajustado para
   `../../semear_app/`.
3. Envia por FTP a aplicação para `semear_app/` e o conteúdo público para
   `public_html/semear/`.

> O `vendor/` **não** é enviado pelo workflow. Faça o upload dele manualmente
> uma vez (no primeiro deploy) e novamente sempre que mudar o `composer.lock` —
> a LocalWeb não tem SSH para rodar `composer install` no servidor.

As **migrations não rodam** no deploy (decisão de projeto). Quando houver
mudança no banco, rode `php artisan migrate` da sua máquina apontando para a
DBaaS (Passo 3).

### Configuração (uma vez)

1. **Pré-requisito manual:** o servidor já precisa ter a estrutura criada por um
   primeiro deploy manual (Passos 5 e 6), incluindo a pasta **`vendor/`** e,
   principalmente, o **`.env` em `semear_app/.env`**. O workflow **nunca** envia
   o `.env` nem o `vendor/` (ambos são ignorados), para não sobrescrever as
   credenciais de produção nem ficar subindo milhares de arquivos a cada push.
2. No GitHub, em **Settings → Secrets and variables → Actions**, crie os
   segredos:

   | Segredo | Valor |
   |---|---|
   | `FTP_SERVER` | host de FTP da LocalWeb (ex.: `ftp.seu-dominio.com.br`) |
   | `FTP_USERNAME` | usuário de FTP |
   | `FTP_PASSWORD` | senha de FTP |

3. Confirme os `server-dir` no `deploy.yml`. O padrão assume que o login de FTP
   cai na **home** do usuário (onde ficam `semear_app/` e `public_html/`). Se o
   seu FTP já entra dentro de `public_html`, ajuste os caminhos (ex.:
   `../semear_app/` e `./semear/`).

### Usando

- **Deploy:** faça `merge`/`push` na branch `main`. Acompanhe em **Actions**.
- **Disparo manual:** aba **Actions → Deploy LocalWeb (FTP) → Run workflow**.

> Como o `vendor/` não vai pelo workflow, o envio é rápido: a action sincroniza
> **apenas o que mudou** (código da aplicação e assets compilados).