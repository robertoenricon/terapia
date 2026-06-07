import './bootstrap';
import { createRoot } from 'react-dom/client';
import Semear from './components/Semear';

/**
 * Ponto de entrada da aplicação React.
 *
 * Localiza o elemento raiz definido no Blade e monta a tela do Semear
 * dentro dele.
 */
const container = document.getElementById('app');

if (container) {
    createRoot(container).render(
        <Semear userName={container.dataset.userName || 'Usuário'} />,
    );
}
