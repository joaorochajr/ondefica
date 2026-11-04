import { apiFetch } from './api'

export const adminService = {
  eventos: () => apiFetch('/admin/eventos'),

  usuarios: () => apiFetch('/admin/usuarios'),

  atualizarUsuario: (id, dados) =>
    apiFetch(`/admin/usuarios/${id}`, {
      method: 'PUT',
      body: JSON.stringify(dados),
    }),

  apagarUsuario: (id) => apiFetch(`/admin/usuarios/${id}`, { method: 'DELETE' }),
}