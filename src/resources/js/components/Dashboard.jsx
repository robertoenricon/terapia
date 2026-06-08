import { useEffect, useMemo, useState } from 'react';
import PieChart from './PieChart';
import BootstrapAlert from './BootstrapAlert';
import { fetchEntries } from '../api/journal';
import { logout } from '../api/auth';
import { ENTRY_TYPE_LIST } from '../utils/entryTypes';

/**
 * Tela de indicadores (dashboard) do Semear.
 *
 * Carrega as entradas registradas, isola as da categoria "Sonhos" e exibe um
 * gráfico de pizza com a porcentagem de cada tipo ("Pesadelo", "Médio", "Bom"
 * e "Ótimo"), usando as mesmas cores definidas para os tipos.
 *
 * @param {Object} props - Propriedades do componente.
 * @param {string} props.userName - Nome do usuário autenticado.
 * @returns {JSX.Element} Componente do dashboard.
 */
export default function Dashboard({ userName }) {
    const [entries, setEntries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loggingOut, setLoggingOut] = useState(false);
    const [alert, setAlert] = useState(null);

    // Carrega as entradas existentes ao montar o componente.
    useEffect(() => {
        fetchEntries()
            .then(setEntries)
            .catch((error) => {
                setEntries([]);
                setAlert({ type: 'danger', message: error.message });
            })
            .finally(() => setLoading(false));
    }, []);

    /**
     * Fatias do gráfico: contagem de entradas de "Sonhos" por tipo, mantendo a
     * ordem e a cor de cada tipo. Entradas sem tipo definido são ignoradas.
     */
    const slices = useMemo(() => {
        const counts = Object.fromEntries(ENTRY_TYPE_LIST.map((type) => [type.value, 0]));

        entries
            .filter((entry) => entry.category === 'sonhos' && entry.type)
            .forEach((entry) => {
                if (counts[entry.type] !== undefined) {
                    counts[entry.type] += 1;
                }
            });

        return ENTRY_TYPE_LIST.map((type) => ({
            label: type.label,
            value: counts[type.value],
            color: type.color,
        }));
    }, [entries]);

    /** Total de sonhos com tipo definido (define se há dados para o gráfico). */
    const totalDreams = useMemo(
        () => slices.reduce((sum, slice) => sum + slice.value, 0),
        [slices],
    );

    /**
     * Encerra a sessão do usuário e redireciona para a tela de login.
     */
    const handleLogout = async () => {
        setLoggingOut(true);
        setAlert(null);

        try {
            await logout();
            window.location.assign('/login');
        } catch (error) {
            setAlert({ type: 'danger', message: error.message });
            setLoggingOut(false);
        }
    };

    return (
        <div className="semear">
            <div className="semear__container">
                <header className="semear__header">
                    <div>
                        <h1 className="semear__title">
                            <span className="semear__logo">🌱</span> Dashboard
                        </h1>
                    </div>
                    <div className="semear-user">
                        <span className="semear-user__name">{userName}</span>
                        <a className="semear-nav-link" href="/semear">
                            Voltar
                        </a>
                        <button
                            type="button"
                            className="semear-logout-btn"
                            onClick={handleLogout}
                            disabled={loggingOut}
                        >
                            {loggingOut && (
                                <span className="spinner-border spinner-border-sm" aria-hidden="true" />
                            )}
                            {loggingOut ? 'Saindo...' : 'Sair'}
                        </button>
                    </div>
                </header>

                {alert && (
                    <BootstrapAlert
                        type={alert.type}
                        message={alert.message}
                        onClose={() => setAlert(null)}
                    />
                )}

                {loading ? (
                    <div className="semear-panel semear-loading" role="status" aria-live="polite">
                        <span className="spinner-border spinner-border-sm" aria-hidden="true" />
                        <span>Carregando indicadores...</span>
                    </div>
                ) : (
                    <div className="semear-dashboard">
                        <section className="semear-panel semear-box">
                            <h2 className="semear-box__title">Dados referentes a Sonhos</h2>
                            {totalDreams > 0 ? (
                                <PieChart data={slices} />
                            ) : (
                                <p className="semear-box__empty">
                                    Ainda não há sonhos com tipo definido para exibir o gráfico.
                                </p>
                            )}
                        </section>
                    </div>
                )}
            </div>
        </div>
    );
}
