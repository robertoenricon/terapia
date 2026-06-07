import './bootstrap';
import { createRoot } from 'react-dom/client';
import Diary from './components/Diary';

/**
 * Ponto de entrada da aplicação React.
 *
 * Localiza o elemento raiz definido no Blade e monta a tela do Diário
 * dentro dele.
 */
const container = document.getElementById('app');

if (container) {
    createRoot(container).render(
        <Diary userName={container.dataset.userName || 'Usuário'} />,
    );
}
