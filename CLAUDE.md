# CLAUDE.md

Arquivo de regras e diretrizes do projeto **semear** — sistema para controle e acompanhamento de terapias.

Este documento define como o código deve ser escrito, documentado e organizado. Todas as instruções aqui valem para qualquer geração ou alteração de código no projeto.

---

## 1. Stack do Projeto

- **Backend:** PHP 8.0 / Laravel 12.0
- **Frontend:** React.js
- **Estilização:** Bootstrap 5 e CSS

---

## 2. Regras Gerais

- **Não cometa erros.** Valide a lógica, as dependências e a sintaxe antes de finalizar qualquer código.
- **Documente todas as classes e métodos criados**, de forma simples e objetiva.
- **A documentação (comentários, docblocks, descrições) deve estar em Português do Brasil (PT-BR).**
- **A nomenclatura de arquivos, classes e métodos deve estar em Inglês.**

---

## 3. Nomenclatura (em Inglês)

| Elemento               | Convenção           | Exemplo                       |
|------------------------|---------------------|-------------------------------|
| Classes                | `PascalCase`        | `TherapySession`              |
| Métodos / funções      | `camelCase`         | `scheduleSession()`           |
| Variáveis              | `camelCase`         | `nextAppointment`             |
| Arquivos (PHP/Laravel) | `PascalCase`        | `TherapyController.php`       |
| Arquivos (React)       | `PascalCase`        | `SessionList.jsx`             |
| Constantes             | `UPPER_SNAKE_CASE`  | `MAX_SESSIONS_PER_WEEK`       |
| Tabelas (DB)           | `snake_case` plural | `therapy_sessions`            |
| Colunas (DB)           | `snake_case`        | `started_at`                  |

> Os nomes são sempre em Inglês; apenas a documentação é em PT-BR.

---

## 4. Documentação (em PT-BR)

Toda classe e método deve conter documentação simples e objetiva explicando o que faz.

### Exemplo — PHP / Laravel

```php
/**
 * Gerencia as sessões de terapia do paciente.
 */
class TherapySession
{
    /**
     * Agenda uma nova sessão para a data informada.
     *
     * @param  int    $patientId  Identificador do paciente.
     * @param  string $date       Data da sessão (formato Y-m-d).
     * @return bool   Verdadeiro se a sessão foi agendada com sucesso.
     */
    public function scheduleSession(int $patientId, string $date): bool
    {
        // ...
    }
}
```

### Exemplo — JavaScript / React

```javascript
/**
 * Lista as sessões de terapia do paciente.
 *
 * @param {number} patientId - Identificador do paciente.
 * @returns {JSX.Element} Componente com a lista de sessões.
 */
function SessionList(patientId) {
    // ...
}
```

---

## 5. Boas Práticas

- Mantenha as classes e métodos com responsabilidade única.
- Evite duplicação de código (DRY).
- Prefira nomes descritivos a comentários redundantes; o comentário explica o "porquê", o código explica o "como".
- Siga os padrões do framework: convenções do Laravel no backend e organização por componentes no React.
- Trate erros e valide entradas antes de processá-las.

---

## 6. Estrutura de Resposta Esperada

Ao gerar ou alterar código, o Claude deve:

1. Respeitar todas as regras deste documento.
2. Garantir que classes e métodos novos estejam documentados em PT-BR.
3. Garantir que nomes de arquivos, classes e métodos estejam em Inglês.
4. Revisar o código antes de entregar para evitar erros.
5. Criar branchs seguindo modelo Git Flow e usar nomes simples e direto.