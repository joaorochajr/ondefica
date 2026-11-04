import { useEffect, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useUsuarioAtual } from '../utils/useUsuarioAtual'
import { adminService } from '../services/adminService'
import { eventosService } from '../services/eventosService'

const ROTULO_STATUS = { ACTIVE: 'Ativo', PENDING: 'Pendente', REJECTED: 'Rejeitado' }
const formatarData = (d) => new Date(d).toLocaleDateString('pt-BR', { timeZone: 'UTC' })

const e = {
  pagina: { maxWidth: '960px', margin: '0 auto', padding: '16px' },
  topo: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', flexWrap: 'wrap' },
  abas: { display: 'flex', gap: '8px', margin: '12px 0' },
  aba: { padding: '8px 16px', border: '1px solid #1976d2', background: '#fff', color: '#1976d2', borderRadius: '6px', cursor: 'pointer' },
  abaAtiva: { padding: '8px 16px', border: '1px solid #1976d2', background: '#1976d2', color: '#fff', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' },
  busca: { width: '100%', padding: '8px', margin: '4px 0 12px', border: '1px solid #cbd5e1', borderRadius: '6px', boxSizing: 'border-box' },
  card: { border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px', marginBottom: '10px', display: 'flex', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' },
  meta: { fontSize: '13px', color: '#64748b', margin: '2px 0' },
  tabelaWrap: { overflowX: 'auto' },
  tabela: { width: '100%', borderCollapse: 'collapse', fontSize: '14px' },
  th: { textAlign: 'left', padding: '8px', borderBottom: '2px solid #e2e8f0' },
  td: { padding: '8px', borderBottom: '1px solid #eee', verticalAlign: 'middle' },
  input: { width: '100%', padding: '6px', border: '1px solid #cbd5e1', borderRadius: '4px', boxSizing: 'border-box' },
  btn: { padding: '6px 10px', marginRight: '4px', border: '1px solid #1976d2', background: '#fff', color: '#1976d2', borderRadius: '6px', cursor: 'pointer' },
  btnPrimario: { padding: '6px 10px', marginRight: '4px', border: 'none', background: '#1976d2', color: '#fff', borderRadius: '6px', cursor: 'pointer' },
  btnPerigo: { padding: '6px 10px', border: '1px solid #d32f2f', background: '#fff', color: '#d32f2f', borderRadius: '6px', cursor: 'pointer' },
  msg: { margin: '8px 0', color: '#1976d2' },
}

export default function AdminPainel() {
  const navigate = useNavigate()
  const { carregando, ehSuper } = useUsuarioAtual()

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
      const [resEv, resUs] = await Promise.all([adminService.eventos(), adminService.usuarios()])
      const dEv = await resEv.json()
      const dUs = await resUs.json()
      setEventos(resEv.ok && Array.isArray(dEv) ? dEv : [])
      setUsuarios(resUs.ok && Array.isArray(dUs) ? dUs : [])
    } catch {
      setMsg('Erro ao carregar dados')
    } finally {
      setCarregandoLista(false)
    }
  }

  useEffect(() => { if (ehSuper) carregar() }, [ehSuper])

  if (carregando) return <p style={e.pagina}>Carregando...</p>
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
    <div style={e.pagina}>
      <div style={e.topo}>
        <h2>Painel do superusuário</h2>
        <div>
          <button style={e.btn} onClick={() => navigate('/meus-eventos')}>Meus eventos</button>
          <button style={e.btn} onClick={() => navigate('/mapa')}>← Mapa</button>
        </div>
      </div>

      <div style={e.abas}>
        <button style={aba === 'eventos' ? e.abaAtiva : e.aba} onClick={() => { setAba('eventos'); setBusca(''); setMsg('') }}>
          Eventos de outros ({eventos.length})
        </button>
        <button style={aba === 'usuarios' ? e.abaAtiva : e.aba} onClick={() => { setAba('usuarios'); setBusca(''); setMsg('') }}>
          Usuários ({usuarios.length})
        </button>
      </div>

      <input
        style={e.busca}
        placeholder={aba === 'eventos' ? 'Buscar evento ou local...' : 'Buscar por nome ou email...'}
        value={busca}
        onChange={(ev) => setBusca(ev.target.value)}
      />

      {msg && <p style={e.msg}>{msg}</p>}
      {carregandoLista && <p>Carregando...</p>}

      {!carregandoLista && aba === 'eventos' && (
        eventosVisiveis.length === 0 ? <p>Nenhum evento encontrado</p> :
        eventosVisiveis.map((ev) => (
          <div key={ev._id} style={e.card}>
            <div>
              <strong>{ev.descricao}</strong>
              {ev.nome_local && <p style={e.meta}>📍 {ev.nome_local}</p>}
              <p style={e.meta}>📅 {formatarData(ev.data_inicio)} → {formatarData(ev.data_fim)}</p>
              <p style={e.meta}>
                👤 {(ev.administradores || []).map((a) => a.nome || a.email).join(', ') || 'Sem administrador'}
              </p>
            </div>
            <div>
              <button style={e.btn} onClick={() => navigate(`/editar-evento/${ev._id}?origem=admin`)}>✏️ Editar</button>
              <button style={e.btnPerigo} onClick={() => apagarEvento(ev)}>🗑️ Apagar</button>
            </div>
          </div>
        ))
      )}

      {!carregandoLista && aba === 'usuarios' && (
        <div style={e.tabelaWrap}>
          <table style={e.tabela}>
            <thead>
              <tr>
                <th style={e.th}>Nome</th><th style={e.th}>Email</th>
                <th style={e.th}>Papel</th><th style={e.th}>Status</th><th style={e.th}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {usuariosVisiveis.length === 0 && (
                <tr><td style={e.td} colSpan={5}>Nenhum usuário encontrado</td></tr>
              )}
              {usuariosVisiveis.map((u) => editandoId === u._id ? (
                <tr key={u._id}>
                  <td style={e.td}><input style={e.input} value={form.nome} onChange={(ev) => setForm({ ...form, nome: ev.target.value })} /></td>
                  <td style={e.td}><input style={e.input} value={form.email} onChange={(ev) => setForm({ ...form, email: ev.target.value })} /></td>
                  <td style={e.td}>
                    <select style={e.input} value={form.role} onChange={(ev) => setForm({ ...form, role: ev.target.value })}>
                      <option value="user">Usuário</option>
                      <option value="superuser">Superusuário</option>
                    </select>
                  </td>
                  <td style={e.td}>
                    <select style={e.input} value={form.status} onChange={(ev) => setForm({ ...form, status: ev.target.value })}>
                      <option value="ACTIVE">Ativo</option>
                      <option value="PENDING">Pendente</option>
                      <option value="REJECTED">Rejeitado</option>
                    </select>
                  </td>
                  <td style={e.td}>
                    <input style={{ ...e.input, marginBottom: '6px' }} type="password" placeholder="Nova senha (opcional)"
                      value={form.senha} onChange={(ev) => setForm({ ...form, senha: ev.target.value })} />
                    <button style={e.btnPrimario} onClick={() => salvarUsuario(u._id)}>Salvar</button>
                    <button style={e.btn} onClick={() => setEditandoId(null)}>Cancelar</button>
                  </td>
                </tr>
              ) : (
                <tr key={u._id}>
                  <td style={e.td}>{u.nome}</td>
                  <td style={e.td}>{u.email}</td>
                  <td style={e.td}>{u.role === 'superuser' ? 'Superusuário' : 'Usuário'}</td>
                  <td style={e.td}>{ROTULO_STATUS[u.status] || '—'}</td>
                  <td style={e.td}>
                    <button style={e.btn} onClick={() => iniciarEdicao(u)}>Editar</button>
                    <button style={e.btn} onClick={() => alterarPapel(u)}>
                      {u.role === 'superuser' ? 'Remover super' : 'Tornar super'}
                    </button>
                    <button style={e.btnPerigo} onClick={() => apagarUsuario(u)}>Apagar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}