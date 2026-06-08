import './bootstrap';
import { createRoot } from 'react-dom/client';
import Semear from './components/Semear';
import Dashboard from './components/Dashboard';

/**
 * Ponto de entrada da aplicação React.
 *
 * Localiza o elemento raiz definido no Blade e monta a tela correspondente
 * à rota atual: o painel de indicadores em "/dashboard" e a tela principal
 * do Semear nas demais rotas.
 */
const container = document.getElementById('app');

if (container) {
    const userName = container.dataset.userName || 'Usuário';
    const isDashboard = window.location.pathname.startsWith('/dashboard');

    createRoot(container).render(
        isDashboard ? <Dashboard userName={userName} /> : <Semear userName={userName} />,
    );
}
