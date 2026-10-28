import { useEffect, useState } from 'react'

// Até essa largura (celular e tablet) usa o layout mobile.
// Se mudar aqui, mudar também o @media (max-width: ...) no mapa.css
export const LARGURA_MAX_MOBILE = 900

export function useEhMobile() {
    const consulta = `(max-width: ${LARGURA_MAX_MOBILE}px)`
    const [ehMobile, setEhMobile] = useState(() => window.matchMedia(consulta).matches)

    useEffect(() => {
        const mq = window.matchMedia(consulta)
        const aoMudar = (e) => setEhMobile(e.matches)
        mq.addEventListener('change', aoMudar)
        return () => mq.removeEventListener('change', aoMudar)
    }, [consulta])

    return ehMobile
}
