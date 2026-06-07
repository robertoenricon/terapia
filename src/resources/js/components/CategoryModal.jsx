import { CATEGORY_LIST } from '../utils/categories';

/**
 * Modal de seleção da categoria de uma nova entrada.
 *
 * Exibe uma sobreposição com as opções disponíveis (Terapia em verde e
 * Sonhos em azul). Ao escolher uma opção, informa o componente pai; ao
 * clicar fora ou no botão de fechar, cancela a seleção.
 *
 * @param {Object} props - Propriedades do componente.
 * @param {Function} props.onChoose - Callback com o valor da categoria escolhida.
 * @param {Function} props.onClose - Callback ao fechar o modal sem escolher.
 * @returns {JSX.Element} Componente do modal de categorias.
 */
export default function CategoryModal({ onChoose, onClose }) {
    return (
        <div className="diary-modal" onClick={onClose}>
            <div
                className="diary-modal__card"
                role="dialog"
                aria-modal="true"
                aria-label="Escolha a categoria"
                onClick={(event) => event.stopPropagation()}
            >
                <div className="diary-modal__header">
                    <h2 className="diary-modal__title">Escolha a categoria</h2>
                    <button
                        type="button"
                        className="diary-icon-btn"
                        onClick={onClose}
                        aria-label="Fechar"
                    >
                        ✕
                    </button>
                </div>

                <div className="diary-modal__options">
                    {CATEGORY_LIST.map((category) => (
                        <button
                            key={category.value}
                            type="button"
                            className={`diary-modal__option diary-modal__option--${category.color}`}
                            onClick={() => onChoose(category.value)}
                        >
                            {category.label}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
