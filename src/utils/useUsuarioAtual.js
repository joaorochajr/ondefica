import { useEffect, useState } from 'react'
import { usuariosService } from '../services/usuariosService'

export function useUsuarioAtual() {
  const [usuario, setUsuario] = useState(null)
  const [carregando, setCarregando] = useState(Boolean(localStorage.getItem('token')))

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      setCarregando(false)
      return
    }

    let cancelado = false

    usuariosService.me()
      .then((res) => (res.ok ? res.json() : null))
      .then((dados) => { if (!cancelado) setUsuario(dados) })
      .catch(() => {})
      .finally(() => { if (!cancelado) setCarregando(false) })

    return () => { cancelado = true }
  }, [])

  return { usuario, carregando, ehSuper: usuario?.role === 'superuser' }
}