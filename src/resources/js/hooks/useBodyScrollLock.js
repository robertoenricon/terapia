import { useEffect } from 'react';

/**
 * Quantidade de modais abertos no momento.
 *
 * Mantida no escopo do módulo para permitir o empilhamento de modais
 * (ex.: editor de registro com o modal de confirmação por cima): a trava
 * só é removida quando o último modal é fechado.
 */
let openModalsCount = 0;

/** Valores originais dos estilos do body, guardados antes da trava. */
let previousBodyOverflow = '';
let previousBodyPaddingRight = '';

/**
 * Trava a rolagem da página (body) enquanto o componente estiver montado.
 *
 * Impede que o conteúdo atrás do modal role junto com o modal. Compensa a
 * largura da barra de rolagem para evitar deslocamento horizontal do layout
 * ao escondê-la. Usa uma contagem no módulo para lidar com modais
 * empilhados, restaurando os estilos somente quando o último for fechado.
 *
 * @returns {void}
 */
export default function useBodyScrollLock() {
    useEffect(() => {
        if (openModalsCount === 0) {
            const { body } = document;
            // Largura da barra de rolagem que será escondida ao travar o body.
            const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

            previousBodyOverflow = body.style.overflow;
            previousBodyPaddingRight = body.style.paddingRight;

            body.style.overflow = 'hidden';
            if (scrollbarWidth > 0) {
                const currentPaddingRight = parseFloat(window.getComputedStyle(body).paddingRight) || 0;
                body.style.paddingRight = `${currentPaddingRight + scrollbarWidth}px`;
            }
        }

        openModalsCount += 1;

        return () => {
            openModalsCount -= 1;

            if (openModalsCount === 0) {
                const { body } = document;
                body.style.overflow = previousBodyOverflow;
                body.style.paddingRight = previousBodyPaddingRight;
            }
        };
    }, []);
}
