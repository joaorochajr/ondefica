import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { usuariosService } from '../services/usuariosService'
import { eventosService } from '../services/eventosService'
import { standsService } from '../services/standsService'
import '../styles/eventoForm.css'

function LocationMarker({ position, setPosition }) {
  const map = useMapEvents({
    click(e) { setPosition(e.latlng) },
  })

  useEffect(() => {
    if (position) map.flyTo(position, 15)
  }, [position, map])

  return position === null ? null : <Marker position={position} />
}

function CriarEvento() {
  const navigate = useNavigate()
  const [descricao, setDescricao] = useState('')
  const [dataInicio, setDataInicio] = useState('')
  const [dataFim, setDataFim] = useState('')
  const [emailInput, setEmailInput] = useState('')
  const [colaboradores, setColaboradores] = useState([])
  const [posicao, setPosicao] = useState(null)
  const [enderecoBusca, setEnderecoBusca] = useState('')
  const [sugestoes, setSugestoes] = useState([])
  const [buscando, setBuscando] = useState(false)
  const [meuEmail, setMeuEmail] = useState('')
  const [validandoEmail, setValidandoEmail] = useState(false)

  useEffect(() => {
    usuariosService
        .me()
        .then((res) => {
          if (res.status === 401) {
            navigate('/login')
            return null
          }

          return res.json()
        })
        .then((data) => {
          if (data) {
            setMeuEmail(data.email)
          }
        })
  }, [navigate])

  useEffect(() => {
    const buscar = async (query) => {
      setBuscando(true)
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`)
        setSugestoes(await res.json())
      } catch { /* ignora */ }
      finally { setBuscando(false) }
    }

    const timer = setTimeout(() => {
      if (enderecoBusca.length > 3) buscar(enderecoBusca)
      else setSugestoes([])
    }, 800)

    return () => clearTimeout(timer)
  }, [enderecoBusca])

  const selecionarEndereco = (item) => {
    setPosicao({ lat: parseFloat(item.lat), lng: parseFloat(item.lon) })
    setEnderecoBusca(item.display_name)
    setSugestoes([])
  }

  const adicionarColaborador = async (e) => {
    e.preventDefault()

    if (validandoEmail) return

    const email = emailInput.trim().toLowerCase()

    if (!email) return

    if (email === meuEmail.toLowerCase()) {
      alert('Você já é administrador deste evento.')
      return
    }

    if (colaboradores.includes(email)) {
      alert('Este e-mail já está na lista.')
      return
    }

    setValidandoEmail(true)

    try {
      const res = await usuariosService.validarEmail(email)

      if (!res.ok) {
        alert('Erro ao validar usuário.')
        return
      }

      const data = await res.json()

      if (!data.existe || !data.ativo) {
        alert('Usuário não encontrado.')
        return
      }

      setColaboradores([...colaboradores, email])
      setEmailInput('')
    } catch (error) {
      console.error(error)
      alert('Erro ao validar usuário.')
    } finally {
      setValidandoEmail(false)
    }
  }

  const removerColaborador = (email) => setColaboradores(colaboradores.filter((c) => c !== email))

  const handleSalvar = async () => {
    if (!posicao) { alert('Por favor, selecione a localização no mapa.'); return }

    try {
      const res = await eventosService.criar({
        descricao,
        data_inicio: dataInicio,
        data_fim: dataFim,
        latitude: posicao.lat,
        longitude: posicao.lng,
        colaboradores,
      })


    if (!res.ok) {
    const status = res.status;
    
    const dadosErro = await res.json().catch(() => ({}));
    const mensagemDoServidor = dadosErro.message || 'Ocorreu um erro inesperado.';

    switch (status) {
        case 409:
            alert(mensagemDoServidor); 
            break;
        default:
            alert(`Erro código ${status}: ${mensagemDoServidor}`);
          }
          return;
      }

      const criado = await res.json()
      const eventoId = criado._id || criado.id

      const formData = new FormData();

      formData.append('nome', "Centro do evento");
      formData.append('descricao', '');
      formData.append('data_inicio', dataInicio);
      formData.append('data_fim', dataFim);
      formData.append('eventoId', eventoId);
      formData.append('cor_icone', 'blue');

      const lat = posicao.lat;
      const lng = posicao.lng;
      
      formData.append('latitude', lat);
      formData.append('longitude', lng);

      const resStand = await standsService.criar(formData);

      if (!resStand.ok) { alert('Erro ao criar stand do evento.'); return }

      let msg = criado.message || 'Evento criado com sucesso!'
      if (criado.emailsNaoEncontrados?.length > 0) {
        msg += `\n\n⚠️ E-mails não encontrados:\n- ${criado.emailsNaoEncontrados.join('\n- ')}`
      }
      alert(msg)
      navigate(`/eventos/${eventoId}/stands`)
    } catch (err) {
      console.error('Erro:', err)
    }
  }

  return (
    <div className="evento-form-page">
      <div className="evento-form-container">
        <header className="evento-form-header">
          <button onClick={() => navigate('/meus-eventos')} className="btn-back">← Voltar</button>
          <h2 className="evento-form-header__title">Criar Novo Evento</h2>
        </header>

        <form className="evento-form"
              onSubmit={(e) => {
                e.preventDefault()
                handleSalvar()
              }}
        >
          <div className="form-group">
            <label className="form-label">Descrição do Evento</label>
            <input type="text" placeholder="Ex: Feira de Ciências" required value={descricao} onChange={(e) => setDescricao(e.target.value)} className="form-input" />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Data de Início</label>
              <input type="date" required value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} className="form-input" />
            </div>
            <div className="form-group">
              <label className="form-label">Data de Fim</label>
              <input type="date" required value={dataFim} onChange={(e) => setDataFim(e.target.value)} className="form-input" />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Adicionar Colaboradores (Opcional)</label>
            <div className="form-collab-row">
              <input type="email" placeholder="E-mail do usuário cadastrado" value={emailInput} onChange={(e) => setEmailInput(e.target.value)} className="form-input" />
              <button
                  onClick={adicionarColaborador}
                  className="form-add-btn"
                  disabled={validandoEmail}
              >
                {validandoEmail ? 'Validando...' : 'Adicionar'}
              </button>
            </div>
            {colaboradores.length > 0 && (
              <div className="form-pill-list">
                {colaboradores.map((email, i) => (
                  <div key={i} className="form-pill">
                    {email}
                    <button type="button" onClick={() => removerColaborador(email)} className="form-pill__remove">×</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Buscar Endereço</label>
            <div className="form-search-wrapper">
              <input type="text" placeholder="Digite a rua, cidade ou local e aguarde..." value={enderecoBusca} onChange={(e) => { setEnderecoBusca(e.target.value); if (posicao) setPosicao(null) }} className="form-input" />
              {buscando && <small className="form-search-loading">Buscando...</small>}
              {sugestoes.length > 0 && (
                <ul className="form-dropdown">
                  {sugestoes.map((item, i) => (
                    <li key={i} className="form-dropdown__item" onClick={() => selecionarEndereco(item)}>{item.display_name}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Localização Exata no Mapa</label>
            <div className="form-map-wrapper">
              <MapContainer center={[-11.663, -38.976]} zoom={13} style={{ height: '100%', width: '100%' }}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap contributors' />
                <LocationMarker position={posicao} setPosition={setPosicao} />
              </MapContainer>
            </div>
          </div>

          <button
              type="submit"
              className="form-submit-primary"
          >
            Criar Evento
          </button>
        </form>
      </div>
    </div>
  )
}

export default CriarEvento
