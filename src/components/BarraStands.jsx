import { useState } from 'react';
import { useEhMobile } from '../utils/useEhMobile';
import { IconeBusca, IconeSeta, IconeMenu, IconeFechar } from './Icones';

// Mesmo visual do painel de eventos (SearchEventMap)
const styles = {
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
        touchAction: 'pan-y'
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '6px 12px',
        borderBottom: '1px solid #eee',
        backgroundColor: '#f8fafc'
    },
    headerText: { fontSize: '12px', color: '#666' },
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
        transition: 'background 0.15s ease'
    },
    itemTitle: { fontSize: '14px', color: '#333', fontWeight: 500 },
    itemMeta: {
        fontSize: '12px',
        color: '#888',
        marginTop: '2px',
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden'
    },
    itemStands: { fontSize: '12px', color: '#1976D2', marginTop: '2px' },
    emptyItem: { padding: '8px 12px', fontSize: '14px', color: '#999', backgroundColor: 'white' }
};

// Barra do topo (desktop) e botão flutuante (mobile) quando o mapa está no modo stands.
// Mesmo visual do SearchEventMap, mas a busca é por stand e no lugar de "Ver Eventos" tem "Voltar".
function BarraStands({
    stands,
    standsVisiveis,
    termo,
    setTermo,
    aberta,
    setAberta,
    onSelecionarStand,
    onVoltar,
    acoesUsuario,
    itensMenuMobile = [],
}) {
    const ehMobile = useEhMobile();
    const [menuMobileAberto, setMenuMobileAberto] = useState(false);
    const [itemFocadoId, setItemFocadoId] = useState(null);

    function abrirBusca() {
        setAberta(true);
        setMenuMobileAberto(false);
    }

    function fecharBusca() {
        setAberta(false);
        setTermo('');
    }

    const lista = aberta && (
        <div
            style={styles.painelContainer}
            onTouchStart={(e) => e.stopPropagation()}
            onTouchMove={(e) => e.stopPropagation()}
            onTouchEnd={(e) => e.stopPropagation()}
        >
            <div style={styles.header}>
                <span style={styles.headerText}>
                    {standsVisiveis.length} de {stands.length} stand{stands.length !== 1 ? 's' : ''}
                </span>
                <button onClick={fecharBusca} style={styles.closeBtn} title="Fechar">✕</button>
            </div>

            <div style={styles.painelList}>
                {standsVisiveis.length > 0 ? (
                    standsVisiveis.map((stand) => {
                        const id = stand.id || stand._id;
                        const focado = itemFocadoId === id;
                        return (
                            <div
                                key={id}
                                onClick={() => onSelecionarStand(stand)}
                                onMouseEnter={() => setItemFocadoId(id)}
                                onMouseLeave={() => setItemFocadoId(null)}
                                style={{ ...styles.item, background: focado ? '#f5f5f5' : 'white' }}
                            >
                                <div style={styles.itemTitle}>{stand.nome || stand.descricao}</div>
                                {stand.nome && stand.descricao && (
                                    <div style={styles.itemMeta}>{stand.descricao}</div>
                                )}
                                <div style={styles.itemStands}>📍 Ver no mapa</div>
                            </div>
                        );
                    })
                ) : (
                    <div style={styles.emptyItem}>Nenhum stand encontrado para esta busca.</div>
                )}
            </div>
        </div>
    );

    return (
        <>
            <div
                className={ehMobile ? 'map-mobile-topo' : 'map-topbar'}
                onMouseDown={(e) => e.stopPropagation()}
                onDoubleClick={(e) => e.stopPropagation()}
                onWheel={(e) => e.stopPropagation()}
            >
                {/* Desktop: busca | voltar | ajuda | usuário */}
                {!ehMobile && (
                    <div className="map-topbar-bar">
                        <label className="map-topbar-search">
                            <IconeBusca />
                            <input
                                type="text"
                                placeholder="Buscar stand..."
                                value={termo}
                                onFocus={() => setAberta(true)}
                                onChange={(e) => setTermo(e.target.value)}
                            />
                            {aberta && (
                                <button className="map-busca-fechar" onClick={fecharBusca} title="Fechar busca">
                                    <IconeFechar size={18} />
                                </button>
                            )}
                        </label>

                        <button className="map-topbar-eventos" onClick={onVoltar}>
                            <IconeSeta />
                            <span>Voltar para eventos</span>
                        </button>

                        {acoesUsuario}
                    </div>
                )}

                {/* Mobile: lupa redonda ou campo de busca no topo */}
                {ehMobile && (
                    <div className="map-mobile-topo-conteudo">
                        {!aberta && (
                            <button className="map-mobile-lupa" onClick={abrirBusca} title="Buscar stand">
                                <IconeBusca />
                            </button>
                        )}

                        {aberta && (
                            <div className="map-mobile-busca">
                                <label className="map-topbar-search">
                                    <IconeBusca />
                                    <input
                                        autoFocus
                                        type="text"
                                        placeholder="Buscar stand..."
                                        value={termo}
                                        onChange={(e) => setTermo(e.target.value)}
                                    />
                                </label>
                                <button className="map-mobile-busca-fechar" onClick={fecharBusca}>
                                    <IconeFechar size={20} />
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {lista}
            </div>

            {/* Mobile: botão flutuante com menu que abre pra cima */}
            {ehMobile && (
                <>
                    {menuMobileAberto && (
                        <div className="map-mobile-overlay" onClick={() => setMenuMobileAberto(false)} />
                    )}

                    <div className="map-mobile-fab-area">
                        {menuMobileAberto && (
                            <div className="map-mobile-itens">
                                <button className="map-mobile-item" onClick={abrirBusca}>
                                    <span className="map-mobile-item-rotulo">Buscar stand</span>
                                    <span className="map-mobile-item-icone"><IconeBusca /></span>
                                </button>

                                <button
                                    className="map-mobile-item"
                                    onClick={() => {
                                        setMenuMobileAberto(false);
                                        onVoltar();
                                    }}
                                >
                                    <span className="map-mobile-item-rotulo">Voltar para eventos</span>
                                    <span className="map-mobile-item-icone"><IconeSeta /></span>
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

export default BarraStands;
