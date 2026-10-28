import { useState } from 'react';
import { useEhMobile } from '../utils/useEhMobile';
import { IconeBusca, IconeSeta, IconeMenu, IconeFechar } from './Icones';

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
            className="map-lista"
            onTouchStart={(e) => e.stopPropagation()}
            onTouchMove={(e) => e.stopPropagation()}
            onTouchEnd={(e) => e.stopPropagation()}
        >
            <div className="map-lista-info">
                {standsVisiveis.length} de {stands.length} stands encontrados
            </div>

            {standsVisiveis.length > 0 ? (
                standsVisiveis.map((stand) => {
                    const id = stand.id || stand._id;
                    return (
                        <div key={id} className="map-lista-item" onClick={() => onSelecionarStand(stand)}>
                            <strong>{stand.nome || stand.descricao}</strong>
                            {stand.nome && <p>{stand.descricao}</p>}
                        </div>
                    );
                })
            ) : (
                <div className="map-lista-vazio">Nenhum stand encontrado para esta busca.</div>
            )}
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
