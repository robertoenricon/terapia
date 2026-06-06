import './bootstrap';
import { createRoot } from 'react-dom/client';
import Welcome from './components/Welcome';

/**
 * Ponto de entrada da aplica��o React.
 *
 * Localiza o elemento raiz definido no Blade e monta o componente
 * principal da interface dentro dele.
 */
const container = document.getElementById('app');

if (container) {
    createRoot(container).render(<Welcome />);
}
