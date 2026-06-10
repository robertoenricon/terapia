/**
 * Utilitários de data com formatação em Português do Brasil.
 *
 * Reúne nomes de meses e dias da semana, além de funções auxiliares
 * para montar o calendário e exibir datas de forma amigável.
 */

/** Nomes dos meses em PT-BR, indexados de 0 (Janeiro) a 11 (Dezembro). */
export const MONTH_NAMES = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

/** Iniciais dos dias da semana exibidas no cabeçalho do calendário. */
export const WEEKDAY_INITIALS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

/** Nomes completos dos dias da semana em PT-BR (0 = Domingo). */
export const WEEKDAY_NAMES = [
    'Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira',
    'Quinta-feira', 'Sexta-feira', 'Sábado',
];

/** Abreviações dos meses usadas nos cartões de entradas (ex.: MAI). */
export const MONTH_ABBREVIATIONS = [
    'JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN',
    'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ',
];

/**
 * Converte uma data para a chave no formato Y-m-d (sem fuso horário).
 *
 * @param {Date} date - Data a ser convertida.
 * @returns {string} Data no formato "YYYY-MM-DD".
 */
export function toDateKey(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

/**
 * Converte uma chave "YYYY-MM-DD" em um objeto Date local.
 *
 * @param {string} key - Data no formato "YYYY-MM-DD".
 * @returns {Date} Data correspondente no fuso local.
 */
export function fromDateKey(key) {
    const [year, month, day] = key.split('-').map(Number);
    return new Date(year, month - 1, day);
}

/**
 * Formata uma data por extenso, ex.: "15 de Maio de 2024".
 *
 * @param {Date} date - Data a ser formatada.
 * @returns {string} Data por extenso em PT-BR.
 */
export function formatLongDate(date) {
    return `${date.getDate()} de ${MONTH_NAMES[date.getMonth()]} de ${date.getFullYear()}`;
}

/**
 * Formata uma data no padrão curto "DD/MM/AAAA".
 *
 * @param {Date} date - Data a ser formatada.
 * @returns {string} Data no formato "DD/MM/AAAA".
 */
export function formatShortDate(date) {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${day}/${month}/${date.getFullYear()}`;
}

/**
 * Monta a matriz de dias exibida no calendário de um mês.
 *
 * Inclui os dias do mês anterior e seguinte necessários para completar
 * as semanas (sempre iniciando no Domingo).
 *
 * @param {number} year - Ano do mês exibido.
 * @param {number} month - Mês exibido (0 = Janeiro).
 * @returns {Array<{date: Date, inMonth: boolean}>} Lista de dias do calendário.
 */
export function buildCalendarDays(year, month) {
    const firstDay = new Date(year, month, 1);
    const startWeekday = firstDay.getDay();
    const start = new Date(year, month, 1 - startWeekday);

    const days = [];
    for (let i = 0; i < 42; i += 1) {
        const current = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
        days.push({ date: current, inMonth: current.getMonth() === month });
    }
    return days;
}

/**
 * Verifica se duas datas representam o mesmo dia.
 *
 * @param {Date} a - Primeira data.
 * @param {Date} b - Segunda data.
 * @returns {boolean} Verdadeiro se forem o mesmo dia.
 */
export function isSameDay(a, b) {
    return a.getFullYear() === b.getFullYear()
        && a.getMonth() === b.getMonth()
        && a.getDate() === b.getDate();
}
