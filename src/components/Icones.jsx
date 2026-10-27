// Ícones simples em SVG (herdam a cor do texto via currentColor)

function Svg({ size = 22, children, preenchido = false }) {
    return (
        <svg
            viewBox="0 0 24 24"
            width={size}
            height={size}
            fill={preenchido ? 'currentColor' : 'none'}
            stroke={preenchido ? 'none' : 'currentColor'}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            {children}
        </svg>
    )
}

export function IconeBusca({ size }) {
    return (
        <Svg size={size}>
            <circle cx="11" cy="11" r="7" />
            <line x1="16.5" y1="16.5" x2="21" y2="21" />
        </Svg>
    )
}

export function IconeCalendario({ size }) {
    return (
        <Svg size={size}>
            <rect x="3" y="5" width="18" height="16" rx="2" />
            <line x1="3" y1="10" x2="21" y2="10" />
            <line x1="8" y1="3" x2="8" y2="7" />
            <line x1="16" y1="3" x2="16" y2="7" />
        </Svg>
    )
}

export function IconeAjuda({ size }) {
    return (
        <Svg size={size}>
            <circle cx="12" cy="12" r="9" />
            <path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.4-1 .9-1 1.7" />
            <line x1="12" y1="17" x2="12" y2="17.01" />
        </Svg>
    )
}

export function IconePessoa({ size }) {
    return (
        <Svg size={size} preenchido>
            <circle cx="12" cy="8" r="4" />
            <path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7z" />
        </Svg>
    )
}

export function IconeMenu({ size }) {
    return (
        <Svg size={size}>
            <line x1="4" y1="7" x2="20" y2="7" />
            <line x1="4" y1="12" x2="20" y2="12" />
            <line x1="4" y1="17" x2="20" y2="17" />
        </Svg>
    )
}

export function IconeFechar({ size }) {
    return (
        <Svg size={size}>
            <line x1="6" y1="6" x2="18" y2="18" />
            <line x1="18" y1="6" x2="6" y2="18" />
        </Svg>
    )
}

export function IconeSair({ size }) {
    return (
        <Svg size={size}>
            <path d="M9 4H5a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h4" />
            <polyline points="16 8 20 12 16 16" />
            <line x1="20" y1="12" x2="9" y2="12" />
        </Svg>
    )
}
