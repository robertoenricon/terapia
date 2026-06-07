import { CATEGORIES } from '../utils/categories';
import { formatLongDate } from '../utils/date';

/**
 * Modal com os registros de uma data e categoria.
 *
 * É exibido ao clicar em um dia que já possui registros, permitindo
 * escolher qual deles alterar ou criar um novo registro para o mesmo dia
 * (ex.: dois eventos na mesma data).
 *
 * @param {Object} props - Propriedades do componente.
 * @param {Date} props.date - Data dos registros exibidos.
 * @param {string} props.category - Categoria ativa ("terapia", "sonhos" ou "evento").
 * @param {Array} props.entries - Registros da data e categoria.
 * @param {Function} props.onEdit - Callback com o registro escolhido para alterar.
 * @param {Function} props.onNew - Callback para criar um novo registro.
 * @param {Function} props.onClose - Callback ao fechar sem escolher.
 * @returns {JSX.Element} Componente do modal de registros do dia.
 */
export default function DayEntriesModal({ date, category, entries, onEdit, onNew, onClose }) {
    const categoryInfo = CATEGORIES[category];
    const theme = categoryInfo?.theme || 'terapia';

    /**
     * Extrai o texto puro do conteúdo HTML para a pré-visualização.
     *
     * @param {string} html - Conteúdo em HTML do registro.
     * @returns {string} Texto sem marcação.
     */
    const getPlainText = (html) => {
        const parsed = new DOMParser().parseFromString(html || '', 'text/html');
        return parsed.body.textContent || '';
    };

    return (
        <div className="semear-modal" onClick={onClose}>
            <div
                className="semear-modal__card"
                role="dialog"
                aria-modal="true"
                aria-label="Registros do dia"
                onClick={(event) => event.stopPropagation()}
            >
                <div className="semear-modal__header">
                    <h2 className="semear-modal__title">
                        {categoryInfo?.label || 'Registros'} — {formatLongDate(date)}
                    </h2>
                    <button
                        type="button"
                        className="semear-icon-btn"
                        onClick={onClose}
                        aria-label="Fechar"
                    >
                        ✕
                    </button>
                </div>

                <ul className="semear-day-entries">
                    {entries.map((entry) => (
                        <li key={entry.id}>
                            <button
                                type="button"
                                className={`semear-day-entry semear-day-entry--${theme}`}
                                onClick={() => onEdit(entry)}
                            >
                                <span className="semear-day-entry__text">
                                    {getPlainText(entry.content) || 'Sem descrição'}
                                </span>
                                <span className="semear-day-entry__action">Alterar</span>
                            </button>
                        </li>
                    ))}
                </ul>

                <button
                    type="button"
                    className={`semear-modal__option semear-modal__option--${theme}`}
                    onClick={onNew}
                >
                    + Novo registro
                </button>
            </div>
        </div>
    );
}
