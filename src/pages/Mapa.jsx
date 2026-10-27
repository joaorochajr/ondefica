import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import MapView from '../components/Mapview'
import { usuariosService } from '../services/usuariosService'
import { IconeAjuda, IconePessoa, IconeSair, IconeCalendario } from '../components/Icones'
import '../styles/mapa.css'

function Mapa() {
  const [user, setUser] = useState(null)
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  
  const menuRef = useRef(null)

  useEffect(() => {
    usuariosService
      .me()
      .then(async (res) => {
        if (res.status === 401) { setUser(null); return }
        const data = await res.json()
        setUser(data)
      })
      .catch(() => setUser(null))
  }, [])

  useEffect(() => {
    const handleClickFora = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickFora)
    return () => {
      document.removeEventListener('mousedown', handleClickFora)
    }
  }, [])

    function logout() {
        localStorage.removeItem('token')
        setUser(null)
        navigate('/mapa')
    }

  const acoesUsuario = (
    <>
      <button className="map-btn-help" onClick={() => navigate('/faq')} title="Ajuda / Documentação">
        <IconeAjuda />
      </button>

      <div className="map-user" ref={menuRef}>
        {user ? (
          <>
            <div className="map-avatar" onClick={() => setOpen(!open)}>
              {user.nome?.charAt(0).toUpperCase()}
            </div>

            {open && (
              <div className="map-menu">
                <button onClick={() => {
                    navigate('/meus-eventos');
                    setOpen(false);
                }}>
                    Meus eventos
                </button>
                <button onClick={logout}>Sair</button>
              </div>
            )}
          </>
        ) : (
          <button className="map-btn-login" onClick={() => navigate('/login')}>
            <span className="map-login-icone" aria-hidden="true">
              <IconePessoa />
            </span>
            <span>Login</span>
          </button>
        )}
      </div>
    </>
  )

  const itemAjuda = { chave: 'ajuda', rotulo: 'Ajuda', icone: <IconeAjuda />, onClick: () => navigate('/faq') }

  const itensMenuMobile = user
    ? [
        { chave: 'meus-eventos', rotulo: 'Meus eventos', icone: <IconeCalendario />, onClick: () => navigate('/meus-eventos') },
        { chave: 'sair', rotulo: 'Sair', icone: <IconeSair />, onClick: logout },
        itemAjuda,
      ]
    : [
        { chave: 'login', rotulo: 'Login', icone: <IconePessoa />, onClick: () => navigate('/login') },
        itemAjuda,
      ]

  return (
    <div className="map-wrapper">
      <MapView acoesUsuario={acoesUsuario} itensMenuMobile={itensMenuMobile} />
    </div>
  )
}

export default Mapa
