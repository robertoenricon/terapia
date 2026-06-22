import { CATEGORY_LIST } from '../utils/categories';
import useBodyScrollLock from '../hooks/useBodyScrollLock';

/**
 * Modal de seleção da categoria de uma nova entrada.
 *
 * Exibe uma sobreposição com as opções disponíveis (Terapia em verde,
 * Sonhos em azul, Evento em vermelho, Evolução em âmbar e Centro em violeta).
 * Ao escolher uma opção, informa o componente pai; ao clicar fora ou no botão
 * de fechar, cancela a seleção.
 *
 * @param {Object} props - Propriedades do componente.
 * @param {Function} props.onChoose - Callback com o valor da categoria escolhida.
 * @param {Function} props.onClose - Callback ao fechar o modal sem escolher.
 * @returns {JSX.Element} Componente do modal de categorias.
 */
export default function CategoryModal({ onChoose, onClose }) {
    useBodyScrollLock();

    return (
        <div className="semear-modal" onClick={onClose}>
            <div
                className="semear-modal__card"
                role="dialog"
                aria-modal="true"
                aria-label="Escolha a categoria"
                onClick={(event) => event.stopPropagation()}
            >
                <div className="semear-modal__header">
                    <h2 className="semear-modal__title">Escolha a categoria</h2>
                    <button
                        type="button"
                        className="semear-icon-btn"
                        onClick={onClose}
                        aria-label="Fechar"
                    >
                        ✕
                    </button>
                </div>

                <div className="semear-modal__options">
                    {CATEGORY_LIST.map((category) => (
                        <button
                            key={category.value}
                            type="button"
                            className={`semear-modal__option semear-modal__option--${category.theme}`}
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
