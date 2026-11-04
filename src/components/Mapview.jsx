import { useEffect, useState, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap, ZoomControl } from 'react-leaflet'
import L from 'leaflet'

import 'leaflet/dist/leaflet.css'

import { eventosService } from '../services/eventosService'
import { standsService } from '../services/standsService'

import { eventoIcon, standIcon, usuarioIcon } from '../utils/mapIcons';
import TracarRotaApe from './TracarRotaApe';
import StandModal from './StandModal';
import BarraStands from './BarraStands'
import SearchEventMap from './searchEventMap';

// true se o evento já terminou (as datas são salvas como meia-noite UTC do dia)
function eventoEncerrado(evento) {
    const hoje = new Date().toLocaleDateString('en-CA'); // AAAA-MM-DD no horário local
    return (evento.data_fim || '').slice(0, 10) < hoje;
}

import '../styles/mapa.css'

// fix icon
delete L.Icon.Default.prototype._getIconUrl

L.Icon.Default.mergeOptions({
    iconRetinaUrl:
        'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl:
        'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl:
        'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

function ChangeView({ center, zoom, onInit }) {
    const map = useMap()

    useEffect(() => {
        if (center && !onInit.current) {
            map.setView(center, zoom)
            onInit.current = true
        }
    }, [center, zoom, map, onInit])

    return null
}

function AjusteDeCameraStands({ standsVisiveis }) {
    const map = useMap()

    const standsHash = standsVisiveis.map(s => s.id || s._id).join(',');

    useEffect(() => {
        if (standsVisiveis.length > 0) {
            const bounds = L.latLngBounds([])
            standsVisiveis.forEach((stand) => {
                bounds.extend([stand.latitude, stand.longitude])
            })
            map.fitBounds(bounds, { padding: [50, 50] })
        }
    }, [standsHash, map])

    return null
}

function FocoDinamico({ coordenadas }) {
    const map = useMap();
    
    useEffect(() => {
        if (coordenadas) {
            map.flyTo(coordenadas, 18, {
                animate: true,
                duration: 0.5 
            });
        }
    }, [coordenadas, map]);
    
    return null;
}

function MapView({ acoesUsuario, itensMenuMobile }) {
    const [erroLocalizacao, setErroLocalizacao] = useState(null);
    const [position, setPosition] = useState(null)
    const [eventos, setEventos] = useState([])
    // Filtro da lista de eventos: próximos (padrão) ou passados, com período opcional
    const [filtrosEventos, setFiltrosEventos] = useState({ situacao: 'proximos', de: '', ate: '' })
    const [carregandoEventos, setCarregandoEventos] = useState(false)
    const [stands, setStands] = useState([])
    const [eventoAtivoId, setEventoAtivoId] = useState(null)
    const [modoStands, setModoStands] = useState(false)
    const [buscaStandsAberta, setBuscaStandsAberta] = useState(false);

    const [destinoRota, setDestinoRota] = useState(null);
    const [standSelecionado, setStandSelecionado] = useState(null);
    const [focoStand, setFocoStand] = useState(null);

    const [buscaAberta, setBuscaAberta] = useState(false);
    const [termoBusca, setTermoBusca] = useState('');
    const [termoBuscaStands, setTermoBuscaStands] = useState('');
    const [mapInitialized, setMapInitialized] = useState(false)

    const markerUsuarioRef = useRef(null);
    const [popupUsuarioAberto, setPopupUsuarioAberto] = useState(false);

    const initialCenterRef = useRef(false)
    const markerRefs = useRef({});
    const standMarkerRefs = useRef({});
    const watchIdRef = useRef(null); // guarda o watch ativo, pra dar clearWatch antes de abrir outro (evita empilhar watchers a cada "tentar novamente")

    useEffect(() => {
        // Período incompleto ou invertido (início depois do fim): espera o usuário corrigir
        if (filtrosEventos.de && filtrosEventos.ate && filtrosEventos.de > filtrosEventos.ate) return;

        let cancelado = false;

        async function load() {
            setCarregandoEventos(true);
            try {
                const res = await eventosService.listar(filtrosEventos)
                const dados = await res.json();
                if (!cancelado) setEventos(res.ok && Array.isArray(dados) ? dados : []);
            } catch (error) {
                console.error("Erro ao buscar dados da API:", error);
                if (!cancelado) setEventos([]);
            } finally {
                if (!cancelado) setCarregandoEventos(false);
            }
        }

        load();

        // se o filtro mudar antes da resposta chegar, ignora a resposta antiga
        return () => { cancelado = true; };
    }, [filtrosEventos]);

    // pede a localização ao navegador; 
    function solicitarLocalizacao() {
        if (watchIdRef.current !== null) {
            navigator.geolocation.clearWatch(watchIdRef.current);
        }

        watchIdRef.current = navigator.geolocation.watchPosition(
            (pos) => {
                setPosition([pos.coords.latitude, pos.coords.longitude]);
            },
            (err) => {
                console.error("Erro ao obter localização:", err);
                setErroLocalizacao(err.code || true); //Isso guarda o código do erro do navegador
            },
            {
                enableHighAccuracy: true,
                maximumAge: 0
            }
        );

        return watchIdRef.current;
    }

    useEffect(() => {
        
        solicitarLocalizacao();

        return () => {
            if (watchIdRef.current !== null) {
                navigator.geolocation.clearWatch(watchIdRef.current);
            }
        };
    }, []);

    // o "solicitar de novo" fica escutando a permissão do navegador e,
    // quando o usuário muda ela manualmente nas configs do site, chama solicitarLocalizacao sozinha
    useEffect(() => {
        if (!navigator.permissions?.query) {return;} 

        let status;
        let cancelado = false;

        navigator.permissions.query({ name: 'geolocation' }).then((result) => {
            if (cancelado) {return;}
            status = result;
            status.onchange = () => {
                if (status.state === 'granted' || status.state === 'prompt') {
                    solicitarLocalizacao();
                }
            };
        }).catch(() => {});

        return () => {
            cancelado = true;
            if (status) {status.onchange = null;}
        };
    }, []);

    useEffect(() => {
        if (position && markerUsuarioRef.current && !popupUsuarioAberto) {
            markerUsuarioRef.current.openPopup();
            setPopupUsuarioAberto(true); 
        }
    }, [position, popupUsuarioAberto]);

    const standsVisiveis = stands.filter(stand => {
        const termo = termoBuscaStands.toLowerCase();
        const matchesNome = stand.nome?.toLowerCase().includes(termo);
        const matchesDesc = stand.descricao?.toLowerCase().includes(termo);
        
        return matchesNome || matchesDesc;
    });

    const eventosFiltrados = eventos.filter(evento =>
        evento.descricao?.toLowerCase().includes(termoBusca.toLowerCase())
    );

if (!position) {
    return (
        <div className="gps-screen">
            <div className="gps-card">
                {erroLocalizacao === 1 ? ( //aviso com instruções do que o usuario deve fazer caso a permissão à localização seja negada
                    <>
                        <h2>Não conseguimos acessar sua localização</h2>
                        <p>
                            Você negou a permissão de localização para este site.
                            Para usar o mapa, você precisa liberar o acesso manualmente.
                        </p>
                        <div className="gps-instrucoes">
                            <span className="gps-instrucoes-titulo">
                                🔒 Como liberar o acesso:
                            </span>
                            <ol>
                                <li>Clique no ícone de cadeado (🔒) que fica ao lado do endereço do site, na barra de busca do navegador.</li>
                                <li>Procure a opção <strong>"Localização"</strong> nas permissões do site.</li>
                                <li>Altere de <strong>"Bloquear"</strong> para <strong>"Permitir"</strong>.</li>
                                <li>Recarregue a página, se necessário.</li>
                            </ol>
                        </div>
                        <span className="gps-subtext">
                            Assim que a permissão for liberada, tentaremos localizar você automaticamente.
                        </span>
                    </>
                ) : erroLocalizacao ? (
                    <>
                        <h2>Não conseguimos acessar sua localização</h2>

                        <button className="gps-retry-btn" onClick={solicitarLocalizacao}>
                            Tentar novamente
                        </button>
                    </>
                ) : (
                    <>
                        <div className="loader"></div>
                        <h2>Encontrando sua localização</h2>
                        <p>
                            Para exibir o mapa corretamente, precisamos acessar sua localização.
                        </p>
                        <span className="gps-subtext">
                            Aguarde enquanto buscamos sua posição...
                        </span>
                    </>
                )}
            </div>
        </div>
    );
}

    const voltarParaEventos = () => {
        setModoStands(false);
        setEventoAtivoId(null);
        setStands([]);
        setDestinoRota(null);
        setFocoStand(null);
        setTermoBuscaStands('');
        setBuscaStandsAberta(false);
    };

    const selecionarStand = (stand) => {
        const id = stand.id || stand._id;
        setFocoStand([stand.latitude, stand.longitude]);
        setBuscaStandsAberta(false);
        setTermoBuscaStands('');

        setTimeout(() => {
            if (standMarkerRefs.current[id]) {
                standMarkerRefs.current[id].openPopup();
            }
        }, 500);
    };

    const estiloBotaoPrincipal = {
        padding: '6px 10px',
        background: '#1976d2',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        width: '100%',
        marginTop: '5px'
    };

    const estiloBotaoSecundario = {
        padding: '6px 10px',
        background: '#ffffff',
        color: '#1976d2',
        border: '1px solid #1976d2',
        borderRadius: '6px',
        cursor: 'pointer',
        width: '100%',
        marginTop: '5px'
    };

    const handleTraçarRotaApe = (stand) => {
        if (!position) {
            alert("Aguarde, ainda estamos buscando sua localização exata.");
            return;
        }

        const userLatLng = L.latLng(position[0], position[1]);
        const standLatLng = L.latLng(stand.latitude, stand.longitude);

        const distanciaEmMetros = userLatLng.distanceTo(standLatLng);

        setDestinoRota([stand.latitude, stand.longitude]);
    
        const id = stand.id || stand._id;
        if (standMarkerRefs.current[id]) {
            standMarkerRefs.current[id].closePopup();
        }
    }

    async function abrirEvento(evento) {
        const idDoEvento = evento.id || evento._id;

        if (evento.quantidadeStands === 0) {
            setDestinoRota([
                evento.latitude,
                evento.longitude
            ]);
            return;
        }

        try {
            const resStands = await standsService.listarPorEvento(idDoEvento)
            const standsEvento = await resStands.json()

            setStands(standsEvento);
            setEventoAtivoId(idDoEvento);
            setModoStands(true);
            setDestinoRota(null);

        } catch (error) {
            console.error(error);
        }
    }

    return (


        <div style={{ position: 'relative', height: '100vh', width: '100%' }}>



            {modoStands && (
                <BarraStands
                    stands={stands}
                    standsVisiveis={standsVisiveis}
                    termo={termoBuscaStands}
                    setTermo={setTermoBuscaStands}
                    aberta={buscaStandsAberta}
                    setAberta={setBuscaStandsAberta}
                    onSelecionarStand={selecionarStand}
                    onVoltar={voltarParaEventos}
                    acoesUsuario={acoesUsuario}
                    itensMenuMobile={itensMenuMobile}
                />
            )}

            <StandModal
                stand={standSelecionado}
                onClose={() => setStandSelecionado(null)}
                onTracarRota={() => {
                    handleTraçarRotaApe(standSelecionado);
                    setStandSelecionado(null);
                }}
            />

            <MapContainer
                center={position}
                zoom={13}
                style={{ height: '100vh', width: '100%' }}
                zoomControl={false}
            >
                <ZoomControl position="bottomright" />

                {!modoStands && (
                    <SearchEventMap
                        acoesUsuario={acoesUsuario}
                        itensMenuMobile={itensMenuMobile}
                        eventos={eventos}
                        filtros={filtrosEventos}
                        setFiltros={setFiltrosEventos}
                        carregando={carregandoEventos}
                        buscaAberta={buscaAberta}
                        setBuscaAberta={setBuscaAberta}
                        onSelectEvento={(evento) => {
                            const id = evento.id || evento._id;
                            if (markerRefs.current[id]) {
                                markerRefs.current[id].openPopup();
                                const map = markerRefs.current[id]._map; 
                                map.flyTo([evento.latitude, evento.longitude], 18, { duration: 1.5 });
                            }
                        }}
                    />
                )}

                <ChangeView center={position} zoom={17} onInit={initialCenterRef} />
                <AjusteDeCameraStands standsVisiveis={standsVisiveis} />

                <FocoDinamico coordenadas={focoStand} />
                <TracarRotaApe origem={position} destino={destinoRota} />

                <TileLayer
                    attribution="&copy; OpenStreetMap"
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <Marker position={position} icon={usuarioIcon} ref={markerUsuarioRef}>
                    <Popup>Você está aqui</Popup>
                </Marker>


                {!modoStands && eventos.map((evento) => { 
                    const id = evento.id || evento._id;
                    return (
                        <Marker
                            key={id}
                            ref={(el) => (markerRefs.current[id] = el)}
                            position={[evento.latitude, evento.longitude]}
                            icon={eventoIcon}
                        >
                            <Popup>
                                <strong>{evento.descricao}</strong>
                                {evento.nome_local && (
                                    <>
                                        <br />
                                        <span>{evento.nome_local}</span>
                                    </>
                                )}
                                {eventoEncerrado(evento) && (
                                    <>
                                        <br />
                                        <span style={{ fontSize: '12px', color: '#888' }}>
                                            Evento encerrado em {new Date(evento.data_fim).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                                        </span>
                                    </>
                                )}
                                <br />
                                {/* ... conteúdo do popup ... */}
                                {evento.quantidadeStands > 0 ? (
                                    <button onClick={() => abrirEvento(evento)} style={estiloBotaoPrincipal}>
                                        Ver stands desse evento
                                    </button>
                                ) : (
                                    <button onClick={() => setDestinoRota([evento.latitude, evento.longitude])} style={estiloBotaoPrincipal}>
                                        Ir até o evento
                                    </button>
                                )}
                            </Popup>
                        </Marker>
                    );
                })}

                {standsVisiveis.map((stand) => {
                    const id = stand.id || stand._id;
                        return (
                            <Marker
                                key={id}
                                ref={(el) => (standMarkerRefs.current[id] = el)}
                                position={[stand.latitude, stand.longitude]}
                                icon={standIcon}
                            >
                            <Popup>
                                <div style={{ textAlign: 'center', minWidth: '160px' }}>
                                    <h4 style={{ margin: '0 0 8px 0', fontSize: '15px', color: '#1A1A1A' }}>
                                        {stand.nome}
                                    </h4>

                                    <img
                                        src={stand.imagem || 'https://placehold.co/400x300/E2E8F0/64748b?text=Sem+Imagem'} 
                                        alt={`Foto de ${stand.nome}`}
                                        style={{
                                            width: '100%',
                                            height: '90px',
                                            objectFit: 'cover',
                                            borderRadius: '6px',
                                            marginBottom: '8px',
                                            backgroundColor: '#E2E8F0'
                                        }}
                                    />

                                    {stand.descricao && (
                                        <p style={{ 
                                            fontSize: '13px', 
                                            color: '#64748B', 
                                            margin: '0 0 12px 0',
                                            display: '-webkit-box',
                                            WebkitLineClamp: 3,
                                            WebkitBoxOrient: 'vertical',
                                            overflow: 'hidden'
                                        }}>
                                            {stand.descricao}
                                        </p>
                                    )}

                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setStandSelecionado(stand);
                                        }}
                                        style={estiloBotaoPrincipal}
                                    >
                                        Ver mais detalhes
                                    </button>

                                    <button
                                        onClick={() => handleTraçarRotaApe(stand)}
                                        style={estiloBotaoSecundario}
                                    >
                                        Ir até o stand
                                    </button>
                                </div>
                            </Popup>
                        </Marker>)}
                )}
            </MapContainer>
        </div>

    )
}

export default MapView
