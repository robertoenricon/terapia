import {
    MONTH_NAMES,
    WEEKDAY_INITIALS,
    buildCalendarDays,
    isSameDay,
    toDateKey,
} from '../utils/date';

/**
 * Calendário mensal do diário.
 *
 * Exibe os dias do mês, destaca a data selecionada e marca os dias que
 * já possuem entradas registradas. Permite navegar entre os meses e
 * selecionar uma data.
 *
 * @param {Object} props - Propriedades do componente.
 * @param {Date} props.viewDate - Mês atualmente exibido.
 * @param {Date} props.selectedDate - Data selecionada pelo usuário.
 * @param {Set<string>} props.entryDates - Chaves das datas com entradas.
 * @param {Function} props.onPrev - Callback para o mês anterior.
 * @param {Function} props.onNext - Callback para o próximo mês.
 * @param {Function} props.onSelect - Callback ao selecionar um dia.
 * @returns {JSX.Element} Componente do calendário.
 */
export default function Calendar({ viewDate, selectedDate, entryDates, onPrev, onNext, onSelect }) {
    const days = buildCalendarDays(viewDate.getFullYear(), viewDate.getMonth());
    const today = new Date();

    return (
        <div className="diary-calendar">
            <div className="diary-calendar__header">
                <button type="button" className="diary-icon-btn" onClick={onPrev} aria-label="Mês anterior">
                    ‹
                </button>
                <span className="diary-calendar__title">
                    {MONTH_NAMES[viewDate.getMonth()]} {viewDate.getFullYear()}
                </span>
                <button type="button" className="diary-icon-btn" onClick={onNext} aria-label="Próximo mês">
                    ›
                </button>
            </div>

            <div className="diary-calendar__grid diary-calendar__weekdays">
                {WEEKDAY_INITIALS.map((initial, index) => (
                    <span key={index} className="diary-calendar__weekday">{initial}</span>
                ))}
            </div>

            <div className="diary-calendar__grid">
                {days.map(({ date, inMonth }) => {
                    const key = toDateKey(date);
                    const isSelected = isSameDay(date, selectedDate);
                    const isToday = isSameDay(date, today);
                    const hasEntry = entryDates.has(key);

                    const classes = [
                        'diary-calendar__day',
                        inMonth ? '' : 'diary-calendar__day--muted',
                        isSelected ? 'diary-calendar__day--selected' : '',
                        !isSelected && isToday ? 'diary-calendar__day--today' : '',
                    ].filter(Boolean).join(' ');

                    return (
                        <button
                            type="button"
                            key={key}
                            className={classes}
                            onClick={() => onSelect(date)}
                        >
                            {date.getDate()}
                            {hasEntry && !isSelected && <span className="diary-calendar__dot" />}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
