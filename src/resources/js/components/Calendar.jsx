import {
    MONTH_NAMES,
    WEEKDAY_INITIALS,
    buildCalendarDays,
    isSameDay,
    toDateKey,
} from '../utils/date';

/**
 * Calendário mensal do Semear.
 *
 * Exibe os dias do mês, destaca a data selecionada e marca os dias que
 * já possuem entradas registradas. Permite navegar entre os meses e
 * selecionar uma data.
 *
 * @param {Object} props - Propriedades do componente.
 * @param {Date} props.viewDate - Mês atualmente exibido.
 * @param {Date|null} props.selectedDate - Data selecionada pelo usuário.
 * @param {Object} props.entryThemes - Mapa "YYYY-MM-DD" → tema da entrada.
 * @param {string|null} props.activeCategory - Categoria ativa (cor do dia selecionado sem entrada).
 * @param {Function} props.onPrev - Callback para o mês anterior.
 * @param {Function} props.onNext - Callback para o próximo mês.
 * @param {Function} props.onSelect - Callback ao selecionar um dia.
 * @returns {JSX.Element} Componente do calendário.
 */
export default function Calendar({ viewDate, selectedDate, entryThemes, activeCategory, onPrev, onNext, onSelect }) {
    const days = buildCalendarDays(viewDate.getFullYear(), viewDate.getMonth());
    const today = new Date();

    return (
        <div className="semear-calendar">
            <div className="semear-calendar__header">
                <button type="button" className="semear-icon-btn" onClick={onPrev} aria-label="Mês anterior">
                    ‹
                </button>
                <span className="semear-calendar__title">
                    {MONTH_NAMES[viewDate.getMonth()]} {viewDate.getFullYear()}
                </span>
                <button type="button" className="semear-icon-btn" onClick={onNext} aria-label="Próximo mês">
                    ›
                </button>
            </div>

            <div className="semear-calendar__grid semear-calendar__weekdays">
                {WEEKDAY_INITIALS.map((initial, index) => (
                    <span key={index} className="semear-calendar__weekday">{initial}</span>
                ))}
            </div>

            <div className="semear-calendar__grid">
                {days.map(({ date, inMonth }) => {
                    const key = toDateKey(date);
                    const isSelected = selectedDate && isSameDay(date, selectedDate);
                    const isToday = isSameDay(date, today);
                    const theme = entryThemes[key];

                    // Cor de preenchimento: tema da entrada; se o dia selecionado
                    // não tiver entrada, usa a categoria ativa.
                    let fillTheme = null;
                    if (theme) {
                        fillTheme = theme;
                    } else if (isSelected) {
                        fillTheme = activeCategory || 'terapia';
                    }

                    const classes = [
                        'semear-calendar__day',
                        inMonth ? '' : 'semear-calendar__day--muted',
                        fillTheme ? `semear-calendar__day--fill-${fillTheme}` : '',
                        isSelected ? 'semear-calendar__day--selected' : '',
                        !fillTheme && isToday ? 'semear-calendar__day--today' : '',
                    ].filter(Boolean).join(' ');

                    return (
                        <button
                            type="button"
                            key={key}
                            className={classes}
                            onClick={() => onSelect(date)}
                        >
                            {date.getDate()}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
