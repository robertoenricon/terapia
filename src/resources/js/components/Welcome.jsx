/**
 * Tela de boas-vindas da aplica��o de terapia.
 *
 * Exibe uma mensagem inicial de apresenta��o do sistema, destacando
 * as principais funcionalidades de controle e acompanhamento das terapias.
 *
 * @returns {JSX.Element} Componente da tela de boas-vindas.
 */
export default function Welcome() {
    const features = [
        {
            title: 'Agende sess�es',
            description: 'Organize os atendimentos e mantenha a agenda sempre atualizada.',
        },
        {
            title: 'Acompanhe pacientes',
            description: 'Registre o progresso e o hist�rico de cada paciente em um s� lugar.',
        },
        {
            title: 'Gere relat�rios',
            description: 'Visualize a evolu��o das terapias com indicadores claros e objetivos.',
        },
    ];

    return (
        <div className="welcome-bg d-flex align-items-center py-5">
            <div className="container">
                <div className="row justify-content-center text-center text-white mb-5">
                    <div className="col-lg-8">
                        <h1 className="display-4 fw-bold mb-3">Bem-vindo ao Terapia</h1>
                        <p className="lead mb-4">
                            Sistema para controle e acompanhamento de terapias. Gerencie
                            sess�es, pacientes e resultados de forma simples e organizada.
                        </p>
                        <a href="#recursos" className="btn btn-light btn-lg px-4 fw-semibold">
                            Come�ar agora
                        </a>
                    </div>
                </div>

                <div id="recursos" className="row g-4 justify-content-center">
                    {features.map((feature) => (
                        <div className="col-md-4" key={feature.title}>
                            <div className="card h-100 border-0 shadow-sm">
                                <div className="card-body text-center p-4">
                                    <h5 className="card-title fw-bold">{feature.title}</h5>
                                    <p className="card-text text-muted mb-0">
                                        {feature.description}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
