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

- `APP_URL` → o domínio final, com **https** (ex.: `https://terapia.com.br`).
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

### Passo 5 — Enviar os arquivos por FTP

**Como enviar o conteúdo de `src/`:**

ZIP + Gerenciador de Arquivos do cPanel (recomendada, bem mais rápida):
o `vendor/` tem milhares de arquivos e o envio um a um por FTP é lento.
Compacte tudo num único `.zip` e extraia no servidor.

1. Na sua máquina, abra a pasta `src/` no **Explorador de Arquivos**. Ative a
   exibição de itens ocultos (aba **Exibir → Itens ocultos**) para enxergar o
   `.env`.

2. No FTP, crie e entre em `terapia_app/` (fora do `public_html`).
   Selecione **tudo de dentro de `src/`** (`app/`, `bootstrap/`, `config/`,
   `database/`, `public/`, `resources/`, `routes/`, `storage/`, `vendor/`,
   `artisan`, `composer.json`, `composer.lock`, `.env`...), **menos** a pasta
   `node_modules/`.
   Jogue para dentro de de `terapia_app/`

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
- [ ] Banco MySQL criado no painel; estrutura criada via `migrate --seed`
      (direto na DBaaS) ou importada por phpMyAdmin.
- [ ] PHP 8.3 selecionado no cPanel.
- [ ] App em `terapia_app/` (fora de `public_html`); `public/` exposto.
- [ ] `index.php` ajustado (ou document root apontado para `public`).
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
