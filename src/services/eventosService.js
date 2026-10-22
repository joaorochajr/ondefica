import { apiFetch } from './api'

export const eventosService = {
  // filtros (opcional): { situacao: 'proximos' | 'passados' | 'todos', de: 'AAAA-MM-DD', ate: 'AAAA-MM-DD' }
  listar: (filtros = {}) => {
    const params = new URLSearchParams()
    if (filtros.situacao) params.set('situacao', filtros.situacao)
    if (filtros.de) params.set('de', filtros.de)
    if (filtros.ate) params.set('ate', filtros.ate)

    const query = params.toString()
    return apiFetch(query ? `/eventos?${query}` : '/eventos')
  },

  meus: () => apiFetch('/eventos/meus'),

  buscarPorId: (id) => apiFetch(`/eventos/${id}`),

  criar: (dados) =>
    apiFetch('/eventos', {
      method: 'POST',
      body: JSON.stringify(dados),
    }),

  atualizar: (id, dados) =>
    apiFetch(`/eventos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(dados),
    }),

  deletar: (id) => apiFetch(`/eventos/${id}`, { method: 'DELETE' }),
}
