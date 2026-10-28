import { useState } from 'react';
import { useEhMobile } from '../utils/useEhMobile';
import { IconeBusca, IconeSeta, IconeMenu, IconeFechar } from './Icones';

// Visual da lista de stands (igual ao da versão antiga da busca de stands)
const styles = {
    painelContainer: {
        fontFamily: '"Segoe UI", Roboto, Helvetica, Arial, sans-serif',
        background: '#FFFFFF',
        borderRadius: '12px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
        width: '100%',
        maxHeight: '60vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
    },
    headerInfo: {
        padding: '8px 16px',
        backgroundColor: '#F8FAFC',
        borderBottom: '1px solid #EAEAEA',
        fontSize: '12px',
        color: '#666'
    },
    listContainer: {
        overflowY: 'auto',
        flex: 1,
        scrollbarWidth: 'thin',
        WebkitOverflowScrolling: 'touch',
        overscrollBehavior: 'contain',
        touchAction: 'pan-y'
    },
    listItem: {
        padding: '14px 16px',
        borderBottom: '1px solid #F4F6F8',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        transition: 'background-color 0.2s'
    },
    itemTitle: { fontSize: '14px', color: '#1A1A1A', fontWeight: 'bold' },
    itemDesc: {
        margin: 0,
        fontSize: '12px',
        color: '#888',
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden'
    },
    emptyState: { padding: '24px', textAlign: 'center', color: '#888', fontSize: '14px' }
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
            <div style={styles.headerInfo}>
                {standsVisiveis.length} de {stands.length} stands encontrados
            </div>

            <div style={styles.listContainer}>
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
                                style={{ ...styles.listItem, backgroundColor: focado ? '#F4F6F8' : '#FFFFFF' }}
                            >
                                <strong style={styles.itemTitle}>{stand.nome || stand.descricao}</strong>
                                {stand.nome && <p style={styles.itemDesc}>{stand.descricao}</p>}
                            </div>
                        );
                    })
                ) : (
                    <div style={styles.emptyState}>Nenhum stand encontrado para esta busca.</div>
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
