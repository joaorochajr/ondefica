import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { usuariosService } from '../services/usuariosService'
import { eventosService } from '../services/eventosService'
import '../styles/meusEventos.css'

function MeusEventos() {
  const [eventos, setEventos] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    usuariosService
      .me()
      .then((res) => {
        if (res.status === 401) { navigate('/login'); return null }
        return eventosService.meus()
      })
      .then((res) => res && res.json())
      .then((data) => {
        if (data) {
          setEventos(data)
          setLoading(false)
        }
      })
      .catch((err) => console.error(err))
  }, [navigate])

  const handleDelete = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir este evento? Esta ação não pode ser desfeita.')) return

    try {
      const res = await eventosService.deletar(id)
      if (res.ok) {
        setEventos(eventos.filter((e) => e._id !== id))
      } else {
        alert('Erro ao excluir o evento.')
      }
    } catch {
      alert('Erro de conexão com o servidor.')
    }
  }

  return (
    <div className="meus-eventos-page">
      <div className="meus-eventos-container">
        <header className="meus-eventos-header">
          <div>
            <h2 className="meus-eventos-header__title">Meus Eventos</h2>
            <p className="meus-eventos-header__subtitle">Gerencie suas localizações e eventos cadastrados.</p>
          </div>
          <div className="meus-eventos-header__actions">
            <button onClick={() => navigate('/mapa')} className="btn btn--secondary">← Voltar ao Mapa</button>
            <button onClick={() => navigate('/criar-evento')} className="btn btn--primary">+ Novo Evento</button>
          </div>
        </header>

        {loading ? (
          <div className="meus-eventos-loading">Carregando seus eventos...</div>
        ) : eventos.length === 0 ? (
          <div className="meus-eventos-empty">
            <h3 style={{ margin: '0 0 10px 0', color: '#555' }}>Nenhum evento por aqui</h3>
            <p style={{ margin: '0 0 20px 0', color: '#888' }}>Você ainda não cadastrou nenhum evento no mapa.</p>
            <button onClick={() => navigate('/criar-evento')} className="btn btn--primary">Criar meu primeiro evento</button>
          </div>
        ) : (
          <div className="meus-eventos-grid">
            {eventos.map((evento) => (
              <div key={evento._id} className="evento-card">
                <div>
                  <h3 className="evento-card__title">{evento.descricao}</h3>
                  <p className="evento-card__date">
                    <span className="evento-card__date-icon">📅</span>
                    <strong>Início:</strong>&nbsp;{new Date(evento.data_inicio).toLocaleDateString('pt-BR')}
                  </p>
                  <p className="evento-card__date">
                    <span className="evento-card__date-icon">🏁</span>
                    <strong>Fim:</strong>&nbsp;{new Date(evento.data_fim).toLocaleDateString('pt-BR')}
                  </p>
                </div>

                <div className="evento-card__actions">
                  <button onClick={() => navigate(`/editar-evento/${evento._id}`)} className="btn btn--edit">
                    ✏️ Editar
                  </button>
                  <button onClick={() => handleDelete(evento._id)} className="btn btn--delete">
                    🗑️ Excluir
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default MeusEventos
