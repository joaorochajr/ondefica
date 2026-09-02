import { useEffect, useState, useRef } from 'react'
import {useNavigate} from 'react-router-dom' //função que cuida da navegação entre as paginas da aplicação
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'

import 'leaflet/dist/leaflet.css'

import { eventosService } from '../services/eventosService'
import { standsService } from '../services/standsService'

import { eventoIcon, standIcon, usuarioIcon } from '../utils/mapIcons';
import TracarRotaApe from './TracarRotaApe';
import StandModal from './StandModal';
import SearchEventMap from './searchEventMap';

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

function MapView() {
    const navigate = useNavigate() //chama a função importada e serve para ir para uma rota x
    const [position, setPosition] = useState(null)
    const [erroLocalizacao, setErroLocalizacao] = useState( 
                    () => !navigator.geolocation ? "Seu navegador não suporta geolocalização. Não é possível exibir o mapa." : null
                ) //caso o navegador não possua API com acesso ao GPS, muda o valor de erroLocalizacao para a string, erroLocalizacao pode ser mudado posteriormente por setErroLocalizacao
    const [eventos, setEventos] = useState([])
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
    
    useEffect(() => {
        async function load() {
            try {
                const res = await eventosService.listar()
                setEventos(await res.json());
            } catch (error) {
                console.error("Erro ao buscar dados da API:", error);
            }
        }

        load();
    }, []);

    useEffect(() => {
        if (!navigator.geolocation) {return;} //corte da função caso o navegador não tenha suporte à localização, o que evita chamar watchPosition(), que geraria um erro se executada nessa condição
        const watchId = navigator.geolocation.watchPosition(
            (pos) => {
                setPosition([
                    pos.coords.latitude,
                    pos.coords.longitude,
                ]);
            },
            (err) => {
                console.error("Erro de GPS:", err);

                //mensagem de erro genérica numa variável mutável(não constante)
                let mensagem = "Não foi possível acessar sua localização.";
                
                //verifica se é algum erro especifico para notificar esse problema na mensagem de erro
                if (err.code === err.PERMISSION_DENIED) {
                    mensagem = "Você negou o acesso à localização. Permita o acesso para ver o mapa";
                } else if (err.code === err.POSITION_UNAVAILABLE){
                    mensagem = "Sua localização está indisponível no momento.";
                } else if (err.code === err.TIMEOUT){
                    mensagem = "Tempo esgotado ao tentar obter sua localização.";
                }

                setErroLocalizacao(mensagem);
            },
            {
                enableHighAccuracy: true,
                maximumAge: 0,
                timeout: 5000
            }
        );

        return () => {
            navigator.geolocation.clearWatch(watchId);
        };
    }, []);

    useEffect(()=> { //bloco de código que roda novamente toda vez que erroLocalizacao ou navigate mudarem de valor
        //quando o gps falha, chamamos setErroLocalizacao, que atualiza erroLocalizacao, esse trecho capta a mudança da variavel e executa o if,
        // exibindo o alert
        if (erroLocalizacao) {
            window.alert(erroLocalizacao);
            navigate('/',{replace: true}); //manda o usuario para a rota '/'(Home), e substitui a entrada do historico do navegador ao invés de empilhar
        }
    },[erroLocalizacao, navigate]);

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

    //renderização condicional: se erroLocalização tiver algum valor, a função para e devolve essa tela de aviso ao invés de contiuar montando o mapa
    if (erroLocalizacao){
        return (
            <div className="gps-screen">
                <div className="gps-card">
                    <h2> Não foi possível acessar sua localização</h2>
                    <p>{erroLocalizacao}</p>
                    <span className="gps-subtext"> Redirecionando para a tela inicial... </span>
                </div>
            </div>
        );
    }

    if (!position) {
        return (
            <div className="gps-screen">
                <div className="gps-card">
                    <div className="loader"></div>

                    <h2>Encontrando sua localização</h2>

                    <p>
                        Para exibir o mapa corretamente, precisamos acessar sua localização.
                    </p>

                    <span className="gps-subtext">
                    Aguarde enquanto buscamos sua posição...
                </span>
                </div>
            </div>
        );
    }

    const estilosLista = {
        fabBtnStands: {
            position: 'absolute',
            top: '120px',
            left: '20px',
            zIndex: 1000,
            backgroundColor: '#FFFFFF',
            color: '#1976D2',
            border: '1px solid #1976D2',
            borderRadius: '50px',
            padding: '10px 18px',
            fontSize: '14px',
            fontWeight: 'bold',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
        },
        
        painelStands: {
            position: 'absolute',
            top: '120px',
            left: '20px',
            width: '320px',
            maxWidth: 'calc(100vw - 40px)', 
            maxHeight: '60vh', 
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
        },
        
        headerBusca: {
            display: 'flex',
            alignItems: 'center',
            padding: '12px',
            borderBottom: '1px solid #EAEAEA',
            gap: '8px'
        },
        inputWrapper: {
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            backgroundColor: '#F4F6F8',
            borderRadius: '8px',
            overflow: 'hidden',
        },
        input: {
            width: '100%',
            padding: '10px 0',
            border: 'none',
            backgroundColor: 'transparent',
            fontSize: '14px',
            outline: 'none',
            color: '#333'
        },
        closeBtn: {
            background: 'none',
            border: 'none',
            fontSize: '16px',
            color: '#666',
            padding: '8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%',
        },
        headerInfo: {
            padding: '8px 16px',
            backgroundColor: '#F8FAFC',
            borderBottom: '1px solid #EAEAEA',
        },
        listContainer: {
            overflowY: 'auto',
            flex: 1,
            scrollbarWidth: 'thin',
        },
        listItem: {
            padding: '14px 16px',
            borderBottom: '1px solid #F4F6F8',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            transition: 'background-color 0.2s',
        },
        itemTitle: {
            fontSize: '14px',
            color: '#1A1A1A'
        },
        itemDesc: {
            fontSize: '12px',
            color: '#888',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
        },
        emptyState: {
            padding: '24px',
            textAlign: 'center',
            color: '#888',
            fontSize: '14px'
        }
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



            {modoStands && !buscaAberta && (
                <button
                    onClick={() => {
                        setModoStands(false);
                        setEventoAtivoId(null);
                        setStands([]);
                        setDestinoRota(null);
                        setFocoStand(null);
                        setTermoBuscaStands('');
                        setBuscaStandsAberta(false);
                    }}
                    style={{
                        position: 'absolute',
                        zIndex: 9999,
                        top: '55px',
                        left: '50px',
                        height: '34px',
                        background: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        boxShadow: '0 1px 5px rgba(0,0,0,0.65)',
                        cursor: 'pointer'
                    }}
                    >
                    ← Voltar para eventos
                </button>)}

            {modoStands && stands.length > 0 && (
                !buscaStandsAberta ? (
                    <button
                        onClick={() => setBuscaStandsAberta(true)}
                        style={estilosLista.fabBtnStands}
                    >
                        <span style={{ fontSize: '16px' }}>📍</span> Buscar Stands
                    </button>
                ) : (
                    <div style={estilosLista.painelStands}>
                        
                        <div style={estilosLista.headerBusca}>
                            <div style={estilosLista.inputWrapper}>
                                <span style={{ padding: '0 8px', color: '#666' }}>🔍</span>
                                <input
                                    autoFocus
                                    type="text"
                                    placeholder="Nome ou descrição..."
                                    value={termoBuscaStands}
                                    onChange={(e) => setTermoBuscaStands(e.target.value)}
                                    style={estilosLista.input}
                                />
                            </div>
                            <button
                                onClick={() => {
                                    setBuscaStandsAberta(false);
                                    setTermoBuscaStands(''); 
                                }}
                                style={estilosLista.closeBtn}
                            >
                                ✕
                            </button>
                        </div>

                        <div style={estilosLista.headerInfo}>
                            <span style={{ fontSize: '12px', color: '#666' }}>
                                {standsVisiveis.length} de {stands.length} stands encontrados
                            </span>
                        </div>

                        <div style={estilosLista.listContainer}>
                            {standsVisiveis.length > 0 ? (
                                standsVisiveis.map(stand => {

                                    const idTarget = stand.id || stand._id;
                                    
                                    return (
                                        <div
                                            key={idTarget}
                                            style={estilosLista.listItem}
                                            onClick={() => {
                                                setFocoStand([stand.latitude, stand.longitude]);
                                                
                                                setBuscaStandsAberta(false);
                                                
                                                setTimeout(() => {
                                                    if (standMarkerRefs.current[idTarget]) {
                                                        standMarkerRefs.current[idTarget].openPopup();
                                                    }
                                                }, 500); 
                                            }}
                                        >
                                            <strong style={estilosLista.itemTitle}>
                                                {stand.nome || stand.descricao}
                                            </strong>
                                            {stand.nome && (
                                                <p style={estilosLista.itemDesc}>{stand.descricao}</p>
                                            )}
                                        </div>
                                    );
                                })
                            ) : (
                                <div style={estilosLista.emptyState}>
                                    Nenhum stand encontrado para esta busca.
                                </div>
                            )}
                        </div>
                    </div>
                )
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
            >
                {!modoStands && (
                    <SearchEventMap
                        eventos={eventos}
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
