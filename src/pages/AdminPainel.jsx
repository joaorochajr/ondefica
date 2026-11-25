import { useEffect, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useUsuarioAtual } from '../utils/useUsuarioAtual'
import { adminService } from '../services/adminService'
import { eventosService } from '../services/eventosService'
import '../styles/meusEventos.css'
import '../styles/adminPainel.css'

const ROTULO_STATUS = { ACTIVE: 'Ativo', PENDING: 'Pendente', REJECTED: 'Rejeitado' }
const formatarData = (d) => new Date(d).toLocaleDateString('pt-BR', { timeZone: 'UTC' })

export default function AdminPainel() {
  const navigate = useNavigate()
  const { usuario, carregando, ehSuper } = useUsuarioAtual()

  const [aba, setAba] = useState('eventos')
  const [eventos, setEventos] = useState([])
  const [usuarios, setUsuarios] = useState([])
  const [carregandoLista, setCarregandoLista] = useState(true)
  const [busca, setBusca] = useState('')
  const [msg, setMsg] = useState('')
  const [editandoId, setEditandoId] = useState(null)
  const [form, setForm] = useState({})

  async function carregar() {
    setCarregandoLista(true)
    try {
      // /admin/eventos não traz os eventos do próprio superusuário, então buscamos também /eventos/meus
      const [resEv, resUs, resMeus] = await Promise.all([
        adminService.eventos(), adminService.usuarios(), eventosService.meus(),
      ])
      const dEv = await resEv.json()
      const dUs = await resUs.json()
      const dMeus = await resMeus.json().catch(() => [])
      const deOutros = resEv.ok && Array.isArray(dEv) ? dEv : []
      const meus = resMeus.ok && Array.isArray(dMeus) ? dMeus : []

      const idsMeus = new Set(meus.map((x) => x._id))
      const todos = [
        ...meus.map((x) => ({ ...x, ehMeu: true })),
        ...deOutros.filter((x) => !idsMeus.has(x._id)).map((x) => ({ ...x, ehMeu: false })),
      ]
      setEventos(todos)
      setUsuarios(resUs.ok && Array.isArray(dUs) ? dUs : [])
    } catch {
      setMsg('Erro ao carregar dados')
    } finally {
      setCarregandoLista(false)
    }
  }

  useEffect(() => { if (ehSuper) carregar() }, [ehSuper])

  if (carregando) return <div className="meus-eventos-loading">Carregando...</div>
  if (!ehSuper) return <Navigate to="/mapa" replace />

  const termo = busca.trim().toLowerCase()
  const eventosVisiveis = eventos.filter((ev) =>
    ev.descricao?.toLowerCase().includes(termo) || ev.nome_local?.toLowerCase().includes(termo))
  const usuariosVisiveis = usuarios.filter((u) =>
    u.nome?.toLowerCase().includes(termo) || u.email?.toLowerCase().includes(termo))

  async function apagarEvento(ev) {
    if (!window.confirm(`Apagar o evento "${ev.descricao}"? Essa ação não pode ser desfeita.`)) return
    setMsg('')
    try {
      const res = await eventosService.deletar(ev._id)
      if (!res.ok) {
        const d = await res.json().catch(() => ({}))
        setMsg(d.message || d.error || 'Erro ao apagar evento')
        return
      }
      setEventos((lista) => lista.filter((x) => x._id !== ev._id))
      setMsg('Evento removido')
    } catch {
      setMsg('Erro ao conectar com o servidor')
    }
  }

  function iniciarEdicao(u) {
    setMsg('')
    setEditandoId(u._id)
    setForm({ nome: u.nome || '', email: u.email || '', role: u.role || 'user', status: u.status || 'ACTIVE', senha: '' })
  }

  async function salvarUsuario(id) {
    setMsg('')
    const dados = { nome: form.nome, email: form.email, role: form.role, status: form.status }
    if (form.senha) dados.senha = form.senha
    try {
      const res = await adminService.atualizarUsuario(id, dados)
      const d = await res.json().catch(() => ({}))
      if (!res.ok) { setMsg(d.message || 'Erro ao salvar'); return }
      setEditandoId(null)
      setMsg('Usuário atualizado')
      carregar()
    } catch {
      setMsg('Erro ao conectar com o servidor')
    }
  }

  async function alterarPapel(u) {
    const novo = u.role === 'superuser' ? 'user' : 'superuser'
    const texto = novo === 'superuser'
      ? `Dar acesso de superusuário a "${u.nome}"? Essa pessoa poderá editar e apagar eventos e usuários de todos.`
      : `Remover o acesso de superusuário de "${u.nome}"?`

    if (!window.confirm(texto)) return
    setMsg('')

    try {
      const res = await adminService.atualizarUsuario(u._id, { role: novo })
      const d = await res.json().catch(() => ({}))
      if (!res.ok) { setMsg(d.message || 'Erro ao alterar papel'); return }
      setMsg(novo === 'superuser' ? 'Agora é superusuário' : 'Acesso de superusuário removido')
      carregar()
    } catch {
      setMsg('Erro ao conectar com o servidor')
    }
  }

  async function apagarUsuario(u) {
    if (!window.confirm(`Apagar o usuário "${u.nome}" (${u.email})? Essa ação não pode ser desfeita.`)) return
    setMsg('')
    try {
      const res = await adminService.apagarUsuario(u._id)
      const d = await res.json().catch(() => ({}))
      if (!res.ok) { setMsg(d.message || 'Erro ao apagar'); return }
      setMsg('Usuário removido')
      carregar()
    } catch {
      setMsg('Erro ao conectar com o servidor')
    }
  }

  return (
    <div className="meus-eventos-page">
      <div className="meus-eventos-container">
        <header className="meus-eventos-header">
          <div>
            <h2 className="meus-eventos-header__title">Painel do superusuário</h2>
            <p className="meus-eventos-header__subtitle">Gerencie todos os eventos e usuários do sistema.</p>
          </div>
          <div className="meus-eventos-header__actions">
            <button onClick={() => navigate('/mapa')} className="btn btn--secondary">← Voltar ao Mapa</button>
          </div>
        </header>

        <div className="admin-abas">
          <button className={`admin-aba${aba === 'eventos' ? ' admin-aba--ativa' : ''}`}
            onClick={() => { setAba('eventos'); setBusca(''); setMsg('') }}>
            Eventos ({eventos.length})
          </button>
          <button className={`admin-aba${aba === 'usuarios' ? ' admin-aba--ativa' : ''}`}
            onClick={() => { setAba('usuarios'); setBusca(''); setMsg('') }}>
            Usuários ({usuarios.length})
          </button>
          <button className="admin-aba" onClick={() => navigate('/meus-eventos')}>
            Meus eventos
          </button>
        </div>

        <input
          className="admin-busca"
          placeholder={aba === 'eventos' ? 'Buscar evento ou local...' : 'Buscar por nome ou email...'}
          value={busca}
          onChange={(ev) => setBusca(ev.target.value)}
        />

        {msg && <p className="admin-msg">{msg}</p>}
        {carregandoLista && <div className="meus-eventos-loading">Carregando...</div>}

        {!carregandoLista && aba === 'eventos' && (
          eventosVisiveis.length === 0 ? (
            <div className="meus-eventos-empty"><h3 style={{ margin: 0, color: '#555' }}>Nenhum evento encontrado</h3></div>
          ) : (
            <div className="meus-eventos-grid">
              {eventosVisiveis.map((ev) => (
                <div key={ev._id} className="evento-card">
                  <div>
                    {ev.ehMeu && <span className="admin-selo">Meu evento</span>}
                    <h3 className="evento-card__title">{ev.descricao}</h3>
                    {ev.nome_local && <p className="evento-card__local">📍 {ev.nome_local}</p>}
                    <p className="evento-card__date">
                      <span className="evento-card__date-icon">📅</span>
                      <strong>Início:</strong>&nbsp;{formatarData(ev.data_inicio)}
                    </p>
                    <p className="evento-card__date">
                      <span className="evento-card__date-icon">🏁</span>
                      <strong>Fim:</strong>&nbsp;{formatarData(ev.data_fim)}
                    </p>
                    <p className="evento-card__date">
                      <span className="evento-card__date-icon">👤</span>
                      {(ev.administradores || []).map((a) => a.nome || a.email).join(', ') || (ev.ehMeu && usuario?.nome) || 'Sem administrador'}
                    </p>
                  </div>
                  <div className="evento-card__actions">
                    <button className="btn btn--edit" onClick={() => navigate(`/editar-evento/${ev._id}?origem=admin`)}>✏️ Editar</button>
                    <button className="btn btn--delete" onClick={() => apagarEvento(ev)}>🗑️ Apagar</button>
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {!carregandoLista && aba === 'usuarios' && (
          <div className="admin-tabela-wrap">
            <table className="admin-tabela">
              <thead>
                <tr><th>Nome</th><th>Email</th><th>Papel</th><th>Status</th><th>Ações</th></tr>
              </thead>
              <tbody>
                {usuariosVisiveis.length === 0 && (
                  <tr><td colSpan={5}>Nenhum usuário encontrado</td></tr>
                )}
                {usuariosVisiveis.map((u) => editandoId === u._id ? (
                  <tr key={u._id}>
                    <td><input className="admin-input" value={form.nome} onChange={(ev) => setForm({ ...form, nome: ev.target.value })} /></td>
                    <td><input className="admin-input" value={form.email} onChange={(ev) => setForm({ ...form, email: ev.target.value })} /></td>
                    <td>
                      <select className="admin-input" value={form.role} onChange={(ev) => setForm({ ...form, role: ev.target.value })}>
                        <option value="user">Usuário</option>
                        <option value="superuser">Superusuário</option>
                      </select>
                    </td>
                    <td>
                      <select className="admin-input" value={form.status} onChange={(ev) => setForm({ ...form, status: ev.target.value })}>
                        <option value="ACTIVE">Ativo</option>
                        <option value="PENDING">Pendente</option>
                        <option value="REJECTED">Rejeitado</option>
                      </select>
                    </td>
                    <td>
                      <input className="admin-input" style={{ marginBottom: '8px' }} type="password" placeholder="Nova senha (opcional)"
                        value={form.senha} onChange={(ev) => setForm({ ...form, senha: ev.target.value })} />
                      <div className="admin-acoes">
                        <button className="btn btn--primary btn--sm" onClick={() => salvarUsuario(u._id)}>Salvar</button>
                        <button className="btn btn--secondary btn--sm" onClick={() => setEditandoId(null)}>Cancelar</button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  <tr key={u._id}>
                    <td>{u.nome}</td>
                    <td>{u.email}</td>
                    <td>{u.role === 'superuser' ? 'Superusuário' : 'Usuário'}</td>
                    <td>{ROTULO_STATUS[u.status] || '—'}</td>
                    <td>
                      <div className="admin-acoes">
                        <button className="btn btn--edit btn--sm" onClick={() => iniciarEdicao(u)}>Editar</button>
                        <button className="btn btn--secondary btn--sm" onClick={() => alterarPapel(u)}>
                          {u.role === 'superuser' ? 'Remover super' : 'Tornar super'}
                        </button>
                        <button className="btn btn--delete btn--sm" onClick={() => apagarUsuario(u)}>Apagar</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
