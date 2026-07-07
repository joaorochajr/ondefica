import { useNavigate } from 'react-router-dom'
import '../styles/faq.css'

// Slot reservado para capturas de tela
function ImageSlot({ label }) {
  return (
    <div className="faq-card__image-slot">
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <path d="M21 15l-5-5L5 21" />
      </svg>
      <span>{label || 'Adicione uma imagem aqui'}</span>
    </div>
  )
}

function Badge({ type }) {
  if (type === 'free')
    return <span className="faq-badge faq-badge--free">✓ Sem login</span>
  return <span className="faq-badge faq-badge--auth">🔒 Requer login</span>
}

function Card({ number, title, auth, desc, steps, callout, imageLabel }) {
  return (
    <div className="faq-card">
      <div className="faq-card__head">
        <div className="faq-card__number">{number}</div>
        <div className="faq-card__body">
          <h3 className="faq-card__title">
            {title}
            <Badge type={auth ? 'auth' : 'free'} />
          </h3>
          <p className="faq-card__desc">{desc}</p>
          {steps && (
            <div className="faq-steps">
              {steps.map((s, i) => (
                <div key={i} className="faq-step">
                  <span className="faq-step__dot" />
                  <span>{s}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      {callout && <div className="faq-callout">{callout}</div>}
    </div>
  )
}

export default function FAQ() {
  const navigate = useNavigate()

  return (
    <div className="faq-page">

      {/* Hero */}
      <div className="faq-hero">
        <div className="faq-hero__badge">📖 Documentação</div>
        <h1 className="faq-hero__title">Como usar o Mapa de Eventos</h1>
        <p className="faq-hero__subtitle">
          Guia completo de todas as funcionalidades da plataforma.
          Algumas ações são livres, outras requerem uma conta.
        </p>
      </div>

      {/* Nav índice */}
      <nav className="faq-nav">
        <div className="faq-nav__inner">
          <a href="#visualizar" className="faq-nav__link">🗺️ Visualizar</a>
          <a href="#buscar" className="faq-nav__link">🔍 Buscar</a>
          <a href="#conta" className="faq-nav__link">👤 Conta</a>
          <a href="#gerenciar" className="faq-nav__link">📋 Gerenciar</a>
        </div>
      </nav>

      <div className="faq-content">

        {/* ── Seção: Visualizar ── */}
        <section id="visualizar">
          <div className="faq-section__header">
            <div className="faq-section__icon">🗺️</div>
            <h2 className="faq-section__title">Visualização no mapa</h2>
          </div>

          <Card
            number={1}
            title="Visualizar eventos"
            auth={false}
            desc="Ao acessar o site, o mapa é exibido automaticamente com todos os eventos cadastrados marcados com ícones. Não é necessário ter uma conta ou estar logado para ver os eventos."
            callout="💡 O mapa usa a sua localização GPS para centralizar a visualização. Aceite a permissão de localização quando o navegador solicitar."
            imageLabel="Captura de tela — mapa com marcadores de eventos"
          />

          <Card
            number={2}
            title="Ver detalhes de um evento"
            auth={false}
            desc="Clique em qualquer marcador de evento no mapa para abrir um popup com o nome do evento, data de início e data de fim. Se o evento tiver stands cadastrados, um botão 'Ver stands' ficará disponível."
            imageLabel="Captura de tela — popup de evento aberto"
          />

          <Card
            number={3}
            title="Visualizar stands de um evento"
            auth={false}
            desc="Ao clicar em 'Ver stands' no popup de um evento, o mapa exibe os stands daquele evento como marcadores individuais. Clique em um stand para ver seu nome e descrição, e para traçar rota até ele."
            steps={[
              'Clique no marcador de um evento no mapa.',
              'Clique no botão "Ver stands desse evento".',
              'Os stands aparecem no mapa como novos marcadores.',
              'Clique em um stand para ver detalhes ou traçar rota.',
            ]}
            callout="⚠️ A rota a pé é disponível apenas para stands a até 1 km de você. Stands mais distantes exibirão um aviso."
            imageLabel="Captura de tela — stands visíveis no mapa"
          />
        </section>

        {/* ── Seção: Buscar ── */}
        <section id="buscar">
          <div className="faq-section__header">
            <div className="faq-section__icon">🔍</div>
            <h2 className="faq-section__title">Busca de eventos</h2>
          </div>

          <Card
            number={4}
            title="Buscar um evento pelo nome"
            auth={false}
            desc="Use a barra de busca no topo do mapa para pesquisar eventos pelo nome. A lista de resultados é atualizada em tempo real conforme você digita."
            steps={[
              'Clique no ícone de busca (lupa) no mapa.',
              'Digite o nome ou parte do nome do evento.',
              'Selecione o evento na lista de resultados.',
              'O mapa centraliza automaticamente no evento escolhido.',
            ]}
            imageLabel="Captura de tela — barra de busca aberta"
          />
        </section>

        {/* ── Seção: Conta ── */}
        <section id="conta">
          <div className="faq-section__header">
            <div className="faq-section__icon">👤</div>
            <h2 className="faq-section__title">Gerenciar conta</h2>
          </div>

          <Card
            number={5}
            title="Criar uma conta"
            auth={false}
            desc="Cadastre-se para poder criar e gerenciar seus próprios eventos e stands no mapa."
            steps={[
              'Solicite ao administrador o link de criação de conta',
              'Preencha nome, e-mail e senha.',
              'Clique em "Criar conta".',
              'Aguarde o administrador aprovar a sua conta',
            ]}
            callout="📧 O gerente receberá email de autorização. A conta só fica ativa após autorização."
            imageLabel="Captura de tela — tela de cadastro"
          />

          <Card
            number={6}
            title="Fazer login"
            auth={false}
            desc="Acesse sua conta para gerenciar eventos e stands."
            steps={[
              'Clique no botão "Login" no canto superior direito.',
              'Informe seu e-mail e senha.',
              'Clique em "Entrar".',
            ]}
            imageLabel="Captura de tela — tela de login"
          />

          <Card
            number={7}
            title="Esqueci minha senha"
            auth={false}
            desc="Caso esqueça sua senha, é possível redefini-la pelo e-mail cadastrado."
            steps={[
              'Na tela de login, clique em "Esqueci minha senha".',
              'Informe o e-mail da sua conta.',
              'Clique em "Enviar".',
              'Acesse o e-mail recebido e clique no link de redefinição.',
              'Crie uma nova senha.',
            ]}
            imageLabel="Captura de tela — tela de recuperação de senha"
          />

          <Card
            number={8}
            title="Fazer logout"
            auth={true}
            desc="Para sair da sua conta, clique no avatar com a inicial do seu nome no canto superior direito do mapa e selecione 'Sair'."
            imageLabel="Captura de tela — menu do usuário aberto"
          />
        </section>

        {/* ── Seção: Gerenciar ── */}
        <section id="gerenciar">
          <div className="faq-section__header">
            <div className="faq-section__icon">📋</div>
            <h2 className="faq-section__title">Gerenciar eventos e stands</h2>
          </div>

          <Card
            number={9}
            title="Criar um evento"
            auth={true}
            desc="Crie eventos geolocalizados que aparecerão para todos no mapa."
            steps={[
              'Faça login e clique no seu avatar.',
              'Selecione "Meus eventos".',
              'Clique em "+ Novo Evento".',
              'Preencha descrição, datas e adicione colaboradores (opcional).',
              'Busque o endereço ou clique diretamente no mapa para definir a localização.',
              'Clique em "Salvar evento" ou "Salvar evento & criar stands".',
            ]}
            callout="👥 Colaboradores são outros usuários cadastrados que também poderão gerenciar o evento."
            imageLabel="Captura de tela — formulário de criação de evento"
          />

          <Card
            number={10}
            title="Criar stands em um evento"
            auth={true}
            desc="Após criar um evento, você pode posicionar stands diretamente no mapa com nome, descrição e período de funcionamento."
            steps={[
              'Em "Meus Eventos", clique em "✏️ Editar" e depois em "Salvar & Editar Stands", ou crie um evento novo e escolha "Salvar evento & criar stands".',
              'Na tela de alocação de stands, clique em qualquer ponto do mapa.',
              'Um marcador temporário aparece — clique em "➕ Criar stand aqui".',
              'Preencha nome, descrição e datas no formulário.',
              'Clique em "Salvar".',
            ]}
            imageLabel="Captura de tela — tela de alocação de stands"
          />

          <Card
            number={11}
            title="Editar ou excluir um evento"
            auth={true}
            desc="Acesse 'Meus Eventos' para editar descrição, datas, colaboradores e localização de qualquer evento seu, ou excluí-lo permanentemente."
            callout="⚠️ A exclusão de um evento é irreversível."
            imageLabel="Captura de tela — tela de meus eventos"
          />

          <Card
            number={12}
            title="Editar ou excluir um stand"
            auth={true}
            desc="Na tela de alocação de stands, clique sobre o marcador de um stand existente para abrir o popup com as opções 'Editar' e 'Excluir'."
            imageLabel="Captura de tela — popup de stand com botões de ação"
          />
        </section>

      </div>

      {/* Footer */}
      <div className="faq-footer">
        <p>Mapa de Eventos · Documentação</p>
        <button
          onClick={() => navigate('/mapa')}
          style={{ marginTop: 10, background: 'none', border: 'none', color: 'var(--color-primary)', cursor: 'pointer', fontWeight: 600, fontSize: 14 }}
        >
          ← Ir ao mapa
        </button>
      </div>

    </div>
  )
}
