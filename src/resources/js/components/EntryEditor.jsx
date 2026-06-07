import RichTextEditor from './RichTextEditor';
import { WEEKDAY_NAMES, formatLongDate } from '../utils/date';
import { CATEGORIES } from '../utils/categories';

/** Limite máximo de caracteres do conteúdo de uma entrada. */
const MAX_LENGTH = 5000;

/**
 * Painel principal de edição da entrada do dia.
 *
 * Mostra a data e a categoria selecionadas, permite escrever os
 * acontecimentos com formatação básica, exibe a contagem de caracteres e
 * oferece as ações de salvar e excluir a entrada.
 *
 * @param {Object} props - Propriedades do componente.
 * @param {Date} props.selectedDate - Data selecionada.
 * @param {string} props.category - Categoria da entrada ("terapia" ou "sonhos").
 * @param {string} props.content - Conteúdo (HTML) atual da entrada.
 * @param {number} props.length - Quantidade de caracteres do texto.
 * @param {boolean} props.canDelete - Indica se a entrada já existe.
 * @param {boolean} props.saving - Indica se o salvamento está em curso.
 * @param {Function} props.onChange - Callback com (html, textLength).
 * @param {Function} props.onSave - Callback ao salvar a entrada.
 * @param {Function} props.onDelete - Callback ao excluir a entrada.
 * @param {Function} props.onBack - Callback para fechar o editor.
 * @returns {JSX.Element} Componente do editor de entrada.
 */
export default function EntryEditor({
    selectedDate,
    category,
    content,
    length,
    canDelete,
    saving,
    onChange,
    onSave,
    onDelete,
    onBack,
}) {
    const categoryInfo = CATEGORIES[category];

    return (
        <div className="diary-panel diary-main">
            <div className="diary-main__header">
                <div className="diary-main__heading">
                    <span className={`diary-main__icon diary-main__icon--${categoryInfo?.theme || 'terapia'}`}>📅</span>
                    <div>
                        <h2 className="diary-main__date">{formatLongDate(selectedDate)}</h2>
                        <p className="diary-main__weekday">{WEEKDAY_NAMES[selectedDate.getDay()]}</p>
                    </div>
                </div>
                <button
                    type="button"
                    className="diary-delete-btn"
                    onClick={onDelete}
                    disabled={!canDelete}
                    aria-label="Excluir entrada"
                >
                    🗑
                </button>
            </div>

            <h3 className={`diary-main__subtitle diary-main__subtitle--${categoryInfo?.theme || 'terapia'}`}>
                {categoryInfo?.label || 'Acontecimentos do dia'}
            </h3>

            <RichTextEditor
                value={content}
                onChange={onChange}
                placeholder="Descreva os acontecimentos do seu dia..."
            />

            <div className="diary-main__counter">
                {length}/{MAX_LENGTH} caracteres
            </div>

            <div className="diary-main__actions">
                <button
                    type="button"
                    className="diary-back-btn"
                    onClick={onBack}
                >
                    &larr; Voltar
                </button>
                <button
                    type="button"
                    className={`diary-save-btn diary-save-btn--${categoryInfo?.theme || 'terapia'}`}
                    onClick={onSave}
                    disabled={saving || length > MAX_LENGTH}
                >
                    {saving ? 'Salvando...' : 'Salvar registro'}
                </button>
            </div>
        </div>
    );
}
