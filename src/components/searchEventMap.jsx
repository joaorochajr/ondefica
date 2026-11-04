import { useState } from 'react';
import { useEhMobile } from '../utils/useEhMobile';
import { IconeBusca, IconeCalendario, IconeMenu, IconeFechar } from './Icones';

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
    resultsContainer: {
        width: '100%',
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
        width: '100%',
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

export default function SearchEventMap({ eventos, onSelectEvento, buscaAberta, setBuscaAberta, filtros, setFiltros, carregando, acoesUsuario, itensMenuMobile = [] }) {
    const ehMobile = useEhMobile();
    const [menuMobileAberto, setMenuMobileAberto] = useState(false);
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

    function abrirBusca() {
        setBuscaAberta(true);
        setPainelEventosAberto(false);
        setMenuMobileAberto(false);
    }

    function abrirPainelEventos() {
        setPainelEventosAberto(true);
        setBuscaAberta(false);
        setTermoBusca('');
        setMenuMobileAberto(false);
    }

    return (
        <>
        <div
            className={ehMobile ? 'map-mobile-topo' : 'map-topbar'}
            onMouseDown={(e) => e.stopPropagation()}
            onDoubleClick={(e) => e.stopPropagation()}
            onWheel={(e) => e.stopPropagation()}
        >

            {/* Barra única (desktop): busca | ver eventos | ajuda | usuário */}
            {!ehMobile && (
                <div className="map-topbar-bar">
                    <label className="map-topbar-search">
                        <IconeBusca />
                        <input
                            type="text"
                            placeholder="Buscar evento..."
                            value={termoBusca}
                            onFocus={() => {
                                setBuscaAberta(true);
                                setPainelEventosAberto(false);
                            }}
                            onChange={(e) => setTermoBusca(e.target.value)}
                            onBlur={() => {
                                if (!termoBusca) setBuscaAberta(false);
                            }}
                        />
                    </label>

                    <button
                        className="map-topbar-eventos"
                        onClick={() => {
                            setPainelEventosAberto(!painelEventosAberto);
                            setBuscaAberta(false);
                            setTermoBusca('');
                        }}
                    >
                        <IconeCalendario />
                        <span>Ver Eventos{filtroAtivo ? ` (${nomeFiltro})` : ''}</span>
                    </button>

                    {acoesUsuario}
                </div>
            )}

            {/* Mobile: lupa redonda ou campo de busca no topo */}
            {ehMobile && (
                <div className="map-mobile-topo-conteudo">
                    {!buscaAberta && !painelEventosAberto && (
                        <button className="map-mobile-lupa" onClick={abrirBusca} title="Buscar evento">
                            <IconeBusca />
                        </button>
                    )}

                    {buscaAberta && (
                        <div className="map-mobile-busca">
                            <label className="map-topbar-search">
                                <IconeBusca />
                                <input
                                    autoFocus
                                    type="text"
                                    placeholder="Buscar evento..."
                                    value={termoBusca}
                                    onChange={(e) => setTermoBusca(e.target.value)}
                                    onBlur={() => {
                                        if (!termoBusca) setBuscaAberta(false);
                                    }}
                                />
                            </label>
                            <button
                                className="map-mobile-busca-fechar"
                                onClick={() => {
                                    setTermoBusca('');
                                    setBuscaAberta(false);
                                }}
                            >
                                <IconeFechar size={20} />
                            </button>
                        </div>
                    )}
                </div>
            )}

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

        {/* MOBILE: botão flutuante com menu que abre pra cima */}
        {ehMobile && (
            <>
                {menuMobileAberto && (
                    <div className="map-mobile-overlay" onClick={() => setMenuMobileAberto(false)} />
                )}

                <div className="map-mobile-fab-area">
                    {menuMobileAberto && (
                        <div className="map-mobile-itens">
                            <button className="map-mobile-item" onClick={abrirBusca}>
                                <span className="map-mobile-item-rotulo">Buscar evento</span>
                                <span className="map-mobile-item-icone"><IconeBusca /></span>
                            </button>

                            <button className="map-mobile-item" onClick={abrirPainelEventos}>
                                <span className="map-mobile-item-rotulo">Ver Eventos{filtroAtivo ? ` (${nomeFiltro})` : ''}</span>
                                <span className="map-mobile-item-icone"><IconeCalendario /></span>
                            </button>

                            {itensMenuMobile.map((item) => (
                                <button
                                    key={item.chave}
                                    className="map-mobile-item"
                                    onClick={() => {
                                        setMenuMobileAberto(false);
                                        item.onClick();
                                    }}
                                >
                                    <span className="map-mobile-item-rotulo">{item.rotulo}</span>
                                    <span className="map-mobile-item-icone">{item.icone}</span>
                                </button>
                            ))}
                        </div>
                    )}

                    <button
                        className="map-mobile-fab"
                        onClick={() => setMenuMobileAberto(!menuMobileAberto)}
                        title={menuMobileAberto ? 'Fechar menu' : 'Abrir menu'}
                    >
                        {menuMobileAberto ? <IconeFechar size={26} /> : <IconeMenu size={26} />}
                    </button>
                </div>
            </>
        )}
        </>
    );
}
