import { BrowserRouter, Routes, Route } from 'react-router-dom'

import AtivarConta from './pages/AtivarConta'
import Login from './pages/Login'
import Cadastro from './pages/Cadastro'
import EsqueciSenha from './pages/EsqueciSenha'
import ResetSenha from './pages/ResetSenha'
import Home from './pages/Home.jsx'
import Mapa from './pages/Mapa.jsx'
import MeusEventos from './pages/MeusEventos'
import CriarEvento from './pages/CriarEvento'
import EditarEvento from './pages/EditarEvento'

import GerenciarStands from './pages/GerenciarStands'
import FAQ from './pages/FAQ'
import AdminPainel from './pages/AdminPainel'

const cadastroPath = import.meta.env.VITE_CADASTRO_PATH

function App() {
    return (
        <BrowserRouter>
            <Routes>

                <Route path="/" element={<Home />} />

                <Route path="/mapa" element={<Mapa/>}/>

                <Route path="/ativar-conta" element={<AtivarConta />} />

                <Route path="/login" element={<Login />} />

                <Route path={cadastroPath} element={<Cadastro />} />

                <Route path="/esqueci-senha" element={<EsqueciSenha />} />

                <Route path="/reset-senha" element={<ResetSenha />} />

                <Route path="/meus-eventos" element={<MeusEventos />} />
                
                <Route path="/criar-evento" element={<CriarEvento />} />

                <Route path="/editar-evento/:id" element={<EditarEvento />} />

                <Route path="/eventos/:eventoId/stands" element={<GerenciarStands />} />
                
                <Route path="/faq" element={<FAQ />} />

                 <Route path="/admin" element={<AdminPainel />} />
            </Routes>
        </BrowserRouter>
    )
}

export default App