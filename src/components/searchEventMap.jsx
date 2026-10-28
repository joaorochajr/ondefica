import { useState } from 'react';

// true se o evento já terminou (as datas são salvas como meia-noite UTC do dia)
function eventoEncerrado(evento) {
    const hoje = new Date().toLocaleDateString('en-CA'); // AAAA-MM-DD no horário local
    return (evento.data_fim || '').slice(0, 10) < hoje;
}

const OPCOES_SITUACAO = [
    { valor: 'proximos', rotulo: 'Próximos' },
    { valor: 'passados', rotulo: 'Passados' },
    { valor: 'todos', rotulo: 'Todos' }
];

const styles = {
    container: {
        position: 'absolute',
        top: '10px',
        left: '50px',
        width: '200px',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        fontFamily: 'sans-serif',
        gap: '5px'
    },
    wrapper: {
        width: '80%',
        display: 'flex',
        gap: '5px'
    },
    button: {
        height: '34px',
        background: 'white',
        border: 'none',
        borderRadius: '4px',
        boxShadow: '0 1px 5px rgba(0,0,0,0.65)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: '0 12px',
        fontSize: '13px',
        fontWeight: 'bold',
        color: '#1976D2',
        whiteSpace: 'nowrap'
    },
    btnVerEventos: {
        height: '34px',
        background: 'white',
        border: 'none',
        borderRadius: '4px',
        boxShadow: '0 1px 5px rgba(0,0,0,0.65)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: '0 12px',
        fontSize: '13px',
        fontWeight: 'bold',
        color: '#1976D2',
        whiteSpace: 'nowrap'
    },
    input: {
        width: '200px',
        height: '34px',
        padding: '0 10px',
        border: 'none',
        borderRadius: '4px',
        boxShadow: '0 1px 5px rgba(0,0,0,0.65)',
        outline: 'none'
    },
    resultsContainer: {
        width: '200px',
        background: 'white',
        borderRadius: '4px',
        boxShadow: '0 1px 5px rgba(0,0,0,0.65)',
        maxHeight: '260px',
        overflowY: 'auto'
    },
    painelContainer: {
        background: 'white',
        borderRadius: '4px',
        boxShadow: '0 1px 5px rgba(0,0,0,0.65)',
        width: '239px',
        maxHeight: '380px',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
    },
    painelList: {
        overflowY: 'auto',
        flex: 1,
        WebkitOverflowScrolling: 'touch',
        overscrollBehavior: 'contain',
        touchAction: 'pan-y',
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '6px 12px',
        borderBottom: '1px solid #eee',
        backgroundColor: '#f8fafc'
    },
    headerText: {
        fontSize: '12px',
        color: '#666'
    },
    closeBtn: {
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        fontSize: '14px',
        color: '#666',
        padding: '0 2px',
        lineHeight: 1
    },
    item: {
        padding: '8px 12px',
        cursor: 'pointer',
        borderBottom: '1px solid #eee',
        backgroundColor: 'white',
        transition: 'background 0.15s ease'
    },
    itemTitle: {
        fontSize: '14px',
        color: '#333',
        fontWeight: 500
    },
    itemMeta: {
        fontSize: '12px',
        color: '#888',
        marginTop: '2px'
    },
    itemStands: {
        fontSize: '12px',
        color: '#1976D2',
        marginTop: '2px'
    },
    emptyItem: {
        padding: '8px 12px',
        fontSize: '14px',
        color: '#999',
        backgroundColor: 'white'
    },
    filtros: {
        padding: '8px 12px',
        borderBottom: '1px solid #eee',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px'
    },
    abas: {
        display: 'flex',
        gap: '4px'
    },
    aba: {
        flex: 1,
        height: '28px',
        border: '1px solid #cbd5e1',
        borderRadius: '4px',
        background: 'white',
        color: '#475569',
        fontSize: '12px',
        cursor: 'pointer'
    },
    abaAtiva: {
        background: '#1976D2',
        borderColor: '#1976D2',
        color: 'white',
        fontWeight: 'bold'
    },
    linhaData: {
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        fontSize: '12px',
        color: '#666'
    },
    rotuloData: {
        width: '26px'
    },
    inputData: {
        flex: 1,
        minWidth: 0,
        height: '28px',
        padding: '0 6px',
        border: '1px solid #cbd5e1',
        borderRadius: '4px',
        fontSize: '12px'
    },
    aviso: {
        fontSize: '12px',
        color: '#d32f2f'
    },
    limparPeriodo: {
        alignSelf: 'flex-start',
        background: 'none',
        border: 'none',
        padding: 0,
        color: '#1976D2',
        fontSize: '12px',
        cursor: 'pointer',
        textDecoration: 'underline'
    },
    tagEncerrado: {
        fontSize: '11px',
        color: '#888',
        marginLeft: '6px',
        fontWeight: 'normal'
    }
};

export default function SearchEventMap({ eventos, onSelectEvento, buscaAberta, setBuscaAberta, filtros, setFiltros, carregando }) {
    const [termoBusca, setTermoBusca] = useState('');

    const temPeriodo = Boolean(filtros.de || filtros.ate);
    // Em "Próximos" não existe filtro por período, então só Passados/Todos contam como filtro
    const filtroAtivo = filtros.situacao !== 'proximos';
    const nomeFiltro = OPCOES_SITUACAO.find((opcao) => opcao.valor === filtros.situacao)?.rotulo;
    const periodoInvalido = Boolean(filtros.de && filtros.ate && filtros.de > filtros.ate);
    const [itemFocadoId, setItemFocadoId] = useState(null);
    const [painelEventosAberto, setPainelEventosAberto] = useState(false);

    const eventosFiltradosBusca = eventos.filter(evento =>
        evento.descricao?.toLowerCase().includes(termoBusca.toLowerCase())
    );

    function fecharPainel() {
        setPainelEventosAberto(false);
    }

    return (
        <div
            style={styles.container}
            onMouseDown={(e) => e.stopPropagation()}
            onDoubleClick={(e) => e.stopPropagation()}
            onWheel={(e) => e.stopPropagation()}
        >

            <div style={{ ...styles.wrapper, height: '34px' }}>
            {buscaAberta ? (
                <input
                    autoFocus
                    type="text"
                    placeholder="Buscar evento..."
                    value={termoBusca}
                    onChange={(e) => setTermoBusca(e.target.value)}
                    onBlur={() => {
                        if (!termoBusca) setBuscaAberta(false);
                    }}
                    style={styles.input}
                />
            ) : (
                <button
                    onClick={() => {
                        setBuscaAberta(true);
                        setPainelEventosAberto(false);
                    }}
                    style={styles.button}
                >
                    <span>🔍</span>
                    <span>Buscar evento...</span>
                </button>
            )}
        </div>

            {/* Dropdown da busca por texto */}
            {buscaAberta && termoBusca && (
                <div style={styles.resultsContainer}
                    onTouchStart={(e) => e.stopPropagation()}
                    onTouchMove={(e) => e.stopPropagation()}
                    onTouchEnd={(e) => e.stopPropagation()}
                >
                    {eventosFiltradosBusca.length > 0 ? (
                        eventosFiltradosBusca.map((evento) => {
                            const idEvento = evento.id || evento._id;
                            const focado = itemFocadoId === idEvento;
                            return (
                                <div
                                    key={idEvento}
                                    onClick={() => {
                                        onSelectEvento(evento);
                                        setTermoBusca('');
                                        setBuscaAberta(false);
                                    }}
                                    onMouseEnter={() => setItemFocadoId(idEvento)}
                                    onMouseLeave={() => setItemFocadoId(null)}
                                    style={{ ...styles.item, background: focado ? '#f5f5f5' : 'white' }}
                                >
                                    {evento.descricao}
                                </div>
                            );
                        })
                    ) : (
                        <div style={styles.emptyItem}>Nenhum evento encontrado</div>
                    )}
                </div>
            )}

            {/* Linha 2: botão dedicado "Ver Eventos" — some quando painel está aberto ou lupa aberta */}
            {!buscaAberta && !painelEventosAberto && (
                <button
                    onClick={() => setPainelEventosAberto(true)}
                    style={styles.btnVerEventos}
                >
                    📅 Ver Eventos{filtroAtivo ? ` (${nomeFiltro})` : ''}
                </button>
            )}

            {/* Painel de listagem de eventos */}
            {painelEventosAberto && !buscaAberta && (
                <div style={styles.painelContainer}
                    onTouchStart={(e) => e.stopPropagation()}
                    onTouchMove={(e) => e.stopPropagation()}
                    onTouchEnd={(e) => e.stopPropagation()}
                >
                    <div style={styles.header}
                    onTouchStart={(e) => e.stopPropagation()}>
                        <span style={styles.headerText}>
                            {carregando
                                ? 'Carregando...'
                                : `${eventos.length} evento${eventos.length !== 1 ? 's' : ''}`}
                        </span>
                        <button onClick={fecharPainel} style={styles.closeBtn}>✕</button>
                    </div>

                    {/* Filtros: próximos / passados / todos + período */}
                    <div style={styles.filtros}>
                        <div style={styles.abas}>
                            {OPCOES_SITUACAO.map((opcao) => (
                                <button
                                    key={opcao.valor}
                                    onClick={() => {
                                        // Próximos não tem período: ao voltar para ele, limpa as datas
                                        if (opcao.valor === 'proximos') {
                                            setFiltros({ situacao: 'proximos', de: '', ate: '' });
                                        } else {
                                            setFiltros({ ...filtros, situacao: opcao.valor });
                                        }
                                    }}
                                    style={{
                                        ...styles.aba,
                                        ...(filtros.situacao === opcao.valor ? styles.abaAtiva : {})
                                    }}
                                >
                                    {opcao.rotulo}
                                </button>
                            ))}
                        </div>

                        {/* Período só aparece em Passados e Todos */}
                        {filtros.situacao !== 'proximos' && (
                            <>
                            <label style={styles.linhaData}>
                                <span style={styles.rotuloData}>De</span>
                                <input
                                    type="date"
                                    value={filtros.de}
                                    max={filtros.ate || undefined}
                                    onChange={(e) => setFiltros({ ...filtros, de: e.target.value })}
                                    style={styles.inputData}
                                />
                            </label>

                            <label style={styles.linhaData}>
                                <span style={styles.rotuloData}>Até</span>
                                <input
                                    type="date"
                                    value={filtros.ate}
                                    min={filtros.de || undefined}
                                    onChange={(e) => setFiltros({ ...filtros, ate: e.target.value })}
                                    style={styles.inputData}
                                />
                            </label>

                            {periodoInvalido && (
                                <div style={styles.aviso}>A data "De" precisa ser antes da data "Até".</div>
                            )}

                            {temPeriodo && (
                                <button
                                    onClick={() => setFiltros({ ...filtros, de: '', ate: '' })}
                                    style={styles.limparPeriodo}
                                >
                                    Limpar período
                                </button>
                            )}
                            </>
                        )}
                    </div>

                    <div style={styles.painelList}>
                        {eventos.length > 0 ? (
                            eventos.map((evento) => {
                                const idEvento = evento.id || evento._id;
                                const focado = itemFocadoId === idEvento;
                                return (
                                    <div
                                        key={idEvento}
                                        onClick={() => {
                                            onSelectEvento(evento);
                                            fecharPainel();
                                        }}
                                        onMouseEnter={() => setItemFocadoId(idEvento)}
                                        onMouseLeave={() => setItemFocadoId(null)}
                                        style={{ ...styles.item, background: focado ? '#f5f5f5' : 'white' }}
                                    >
                                        <div style={styles.itemTitle}>
                                            {evento.descricao}
                                            {eventoEncerrado(evento) && (
                                                <span style={styles.tagEncerrado}>(encerrado)</span>
                                            )}
                                        </div>
                                        <div style={styles.itemMeta}>
                                            📅 {new Date(evento.data_inicio).toLocaleDateString('pt-BR', { timeZone: 'UTC' })} → {new Date(evento.data_fim).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                                        </div>
                                        {evento.quantidadeStands > 0 && (
                                            <div style={styles.itemStands}>
                                                📍 {evento.quantidadeStands} stand{evento.quantidadeStands > 1 ? 's' : ''}
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                        ) : (
                            <div style={styles.emptyItem}>
                                {carregando
                                    ? 'Carregando...'
                                    : filtroAtivo
                                        ? 'Nenhum evento encontrado com esse filtro'
                                        : 'Nenhum evento disponível'}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
