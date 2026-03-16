function TermsPage() {
  return (
    <main style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto', lineHeight: '1.6', color: '#333' }}>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Termos e Condições de Uso</h1>
      <p style={{ color: '#666', marginBottom: '2rem' }}>Última atualização: 15 de Março de 2026.</p>

      <section style={{ marginBottom: '2rem' }}>
        <p>
          Este documento estabelece as regras para o uso da plataforma <strong>ft_bridge</strong>. 
          Ao marcar o aceite no cadastro, você concorda integralmente com estas condições.
        </p>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>1. Objeto e Elegibilidade</h2>
        <p>A ft_bridge é uma plataforma de conexão para mentoria em tecnologia e empreendedorismo.</p>
        <ul style={{ paddingLeft: '1.5rem', marginTop: '1rem' }}>
          <li><strong>Dualidade de Perfil:</strong> O usuário reconhece que pode atuar como Mentor, Mentorado ou ambos, desde que preencha os requisitos técnicos e de perfil exigidos.</li>
          <li><strong>Capacidade:</strong> Ao se cadastrar como Mentor, o usuário declara possuir competência técnica nas stacks indicadas em seu perfil.</li>
        </ul>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>2. Sistema de Gamificação (XP e Badges)</h2>
        <p>O sistema de pontuação visa incentivar o engajamento e a qualidade das conexões.</p>
        <ul style={{ paddingLeft: '1.5rem', marginTop: '1rem' }}>
          <li><strong>Métricas:</strong> O XP é atribuído automaticamente pelo sistema conforme as Regras de Negócio (ex: +150 XP por Match, +50 XP por sessão concluída).</li>
          <li><strong>Níveis:</strong> A progressão de nível (Iniciante ao Mestre Transcendental) é meramente simbólica e reflete a atividade do usuário na plataforma, não constituindo certificação acadêmica ou profissional externa.</li>
          <li><strong>Ajustes:</strong> A ft_bridge reserva-se o direito de ajustar valores de XP ou remover Badges caso identifique comportamentos fraudulentos ou abusivos.</li>
        </ul>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>3. Regras de Agendamento e a "Política de No-Show"</h2>
        <p>A pontualidade é um pilar da plataforma.</p>
        <ul style={{ paddingLeft: '1.5rem', marginTop: '1rem' }}>
          <li><strong>Faltas (No-Show):</strong> Se o Mentorado não comparecer à sessão agendada, sua Ofensiva (Streak) será zerada imediatamente e nenhum XP será concedido pela sessão. O Mentor que sofrer com a ausência poderá receber um bônus compensatório.</li>
          <li><strong>Remarcações:</strong> Mentores têm permissão para alterar data e hora no sistema. Mentorados devem solicitar a remarcação via chat com o Mentor.</li>
          <li><strong>Links de Reunião:</strong> A integração com o Google Meet está sujeita aos termos de uso da própria Google.</li>
        </ul>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>4. Ciclo de Mentoria e Limitações</h2>
        <p>Para evitar a dependência excessiva e garantir a rotatividade:</p>
        <ul style={{ paddingLeft: '1.5rem', marginTop: '1rem' }}>
          <li><strong>Trava de Ciclo:</strong> Agendamentos recorrentes são limitados a 10 sessões futuras. Após este limite, o sistema exigirá uma renovação manual.</li>
          <li><strong>Capacidade do Mentor:</strong> O sistema bloqueará novos Matches caso o Mentor atinja seu limite configurado de mentorados ativos.</li>
        </ul>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>5. Propriedade Intelectual e Conteúdo</h2>
        <ul style={{ paddingLeft: '1.5rem', marginTop: '1rem' }}>
          <li><strong>Conteúdo das Sessões:</strong> As orientações dadas são de responsabilidade exclusiva do Mentor. A ft_bridge não se responsabiliza por decisões tomadas com base nas mentorias.</li>
          <li><strong>Propriedade da Plataforma:</strong> Todos os elementos visuais, algoritmos e a marca ft_bridge são de propriedade exclusiva da empresa.</li>
        </ul>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>6. Rescisão e Encerramento de Ciclo</h2>
        <p>Qualquer uma das partes pode encerrar o vínculo clicando em "Deixar Mentoria".</p>
        <p style={{ marginTop: '1rem' }}>
          <strong>Dica:</strong> O encerramento amigável após a conclusão do ciclo gera um bônus de <strong>+200 XP</strong> para ambos.
        </p>
      </section>
    </main>
  );
}

export default TermsPage;