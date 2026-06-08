// src/components/Quiz.tsx
import { useState } from 'react';

const WA_BASE = 'https://wa.me/351969698944?text=';

interface Resultado {
  titulo: string;
  desc: string;
  cor: string;
  emoji: string;
  id: string;
}

const resultados: Record<string, Resultado> = {
  presencial: { titulo: 'Personal Training Presencial', desc: 'Estúdio privado no Areeiro, 1 hora, equipamentos completos. Individual ou em dupla.', cor: '#4A7A2E', emoji: '🏋️', id: 's-presencial' },
  online:     { titulo: 'Personal Training Online',     desc: 'Videochamada ao vivo, 1 hora completa. Igual ao presencial, sem deslocação.',        cor: '#1971C2', emoji: '💻', id: 's-online' },
  app:        { titulo: 'Plano por App',                desc: 'Plano mensal, vídeos dos exercícios, acompanhamento por WhatsApp.',                   cor: '#2F9E44', emoji: '📱', id: 's-app' },
  outdoor:    { titulo: 'Treino Outdoor',               desc: 'Ao ar livre em Lisboa, individual ou grupo. Mesmo nível de acompanhamento.',          cor: '#E8590C', emoji: '🌿', id: 's-outdoor' },
  laboral:    { titulo: 'Ginástica Laboral',            desc: 'O Bernardo vai à sua empresa. HIIT, mobilidade e activação em grupo.',                cor: '#2F4A35', emoji: '🏢', id: 's-laboral' },
};

const pFormato = [
  {
    q: 'Onde prefere treinar?',
    sub: 'Escolha o que encaixa melhor no seu dia-a-dia.',
    ops: [
      { label: 'No estúdio, com equipamentos e privacidade', emoji: '🏋️', val: 'presencial' },
      { label: 'Em casa ou onde estiver, por videochamada',  emoji: '💻', val: 'online' },
      { label: 'No meu horário, com flexibilidade total',    emoji: '📱', val: 'online_app' },
      { label: 'Ao ar livre, em espaços da cidade',          emoji: '🌿', val: 'outdoor' },
      { label: 'Na minha empresa, em grupo',                  emoji: '🏢', val: 'laboral' },
    ],
  },
  {
    q: 'Quer acompanhamento ao vivo durante a sessão?',
    sub: 'Pergunta relevante para quem prefere treinar em casa.',
    ops: [
      { label: 'Sim — videochamada durante o treino',    emoji: '🎥', val: 'online' },
      { label: 'Prefiro ao meu ritmo, com plano e vídeos', emoji: '📱', val: 'app' },
    ],
  },
];

const pContexto = [
  {
    q: 'Qual o seu principal objectivo agora?',
    sub: 'Escolha o que mais se aproxima.',
    ops: [
      { label: 'Ganhar força e massa muscular',          emoji: '💪' },
      { label: 'Melhorar mobilidade e postura',          emoji: '🧘' },
      { label: 'Perder gordura e melhorar composição',   emoji: '⚡' },
      { label: 'Recuperar de uma lesão ou cirurgia',     emoji: '🔄' },
      { label: 'Manter-me activo e com energia',         emoji: '🌿' },
      { label: 'Ainda não sei — quero perceber',         emoji: '🤷' },
    ],
  },
  {
    q: 'Tem alguma limitação ou condição relevante?',
    sub: 'Ajuda a preparar melhor a primeira conversa.',
    ops: [
      { label: 'Não, nenhuma de momento',              emoji: '✅' },
      { label: 'Tenho ou tive lesões articulares',     emoji: '🦴' },
      { label: 'Tenho dores crónicas nas costas',      emoji: '🔴' },
      { label: 'Estou grávida ou no pós-parto',        emoji: '🌸' },
      { label: 'Tenho mais de 60 anos',                emoji: '🤍' },
      { label: 'Estou a recuperar de AVC ou similar',  emoji: '🔄' },
    ],
  },
  {
    q: 'Quanto treinou nos últimos 12 meses?',
    sub: 'Só para perceber o ponto de partida.',
    ops: [
      { label: 'Nunca ou raramente',              emoji: '😅' },
      { label: 'Às vezes, sem consistência',       emoji: '📅' },
      { label: 'Regularmente, 1–2x por semana',    emoji: '✔️' },
      { label: 'Com frequência, 3x ou mais',       emoji: '🏅' },
    ],
  },
];

export default function Quiz() {
  const [step,      setStep]      = useState(0);
  const [respostas, setRespostas] = useState<Record<string, string>>({});
  const [fase,      setFase]      = useState<'formato' | 'contexto' | 'resultado'>('formato');
  const [formatoId, setFormatoId] = useState<string | null>(null);

  const progresso =
    fase === 'formato'   ? (step / pFormato.length) * 50
    : fase === 'contexto' ? 50 + (step / pContexto.length) * 50
    : 100;

  function responderFormato(val: string) {
    const novas = { ...respostas, [`fq${step}`]: val };
    setRespostas(novas);
    if (val === 'outdoor' || val === 'laboral' || val === 'presencial' || val === 'online') {
      setFormatoId(val); setFase('contexto'); setStep(0); return;
    }
    if (val === 'online_app') { setStep(1); return; }
    setFormatoId(val); setFase('contexto'); setStep(0);
  }

  function responderContexto(val: string) {
    const novas = { ...respostas, [`cq${step}`]: val };
    setRespostas(novas);
    if (step < pContexto.length - 1) setStep(step + 1);
    else setFase('resultado');
  }

  function reset() { setStep(0); setRespostas({}); setFase('formato'); setFormatoId(null); }

  function buildWA() {
    if (!formatoId) return WA_BASE;
    const res = resultados[formatoId];
    const msg = `Olá Bernardo! Fiz o quiz no site e o formato recomendado foi "${res.titulo}".\n\nObjectivo: ${respostas['cq0'] || ''}\nCondição: ${respostas['cq1'] || ''}\nHistórico: ${respostas['cq2'] || ''}\n\nGostaria de marcar uma avaliação inicial.`;
    return WA_BASE + encodeURIComponent(msg);
  }

  const res = formatoId ? resultados[formatoId] : null;

  return (
    <div className="quiz-wrap">
      {/* Progresso */}
      <div className="quiz-progress">
        <div className="quiz-progress__labels">
          <span>{fase === 'formato' ? 'A encontrar o formato…' : fase === 'contexto' ? 'A conhecê-lo melhor…' : 'Resultado'}</span>
          <span className="quiz-progress__pct">{Math.round(progresso)}%</span>
        </div>
        <div className="quiz-progress__bar">
          <div className="quiz-progress__fill" style={{ width: `${progresso}%` }} />
        </div>
      </div>

      {/* Formato */}
      {fase === 'formato' && (
        <div>
          <p className="quiz__q">{pFormato[step].q}</p>
          <p className="quiz__sub">{pFormato[step].sub}</p>
          <div className="quiz__ops">
            {pFormato[step].ops.map(op => (
              <button key={op.val} className="quiz__op" onClick={() => responderFormato(op.val)}>
                <span className="quiz__op-emoji">{op.emoji}</span>
                {op.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Contexto */}
      {fase === 'contexto' && (
        <div>
          {step === 0 && res && (
            <div className="quiz__formato-found" style={{ background: res.cor + '18', borderColor: res.cor + '44' }}>
              <span>{res.emoji}</span>
              <div>
                <small style={{ color: res.cor }}>Formato identificado</small>
                <strong>{res.titulo}</strong>
              </div>
            </div>
          )}
          <p className="quiz__q">{pContexto[step].q}</p>
          <p className="quiz__sub">{pContexto[step].sub}</p>
          <div className="quiz__ops quiz__ops--grid">
            {pContexto[step].ops.map(op => (
              <button key={op.label} className="quiz__op" onClick={() => responderContexto(op.label)}>
                <span className="quiz__op-emoji">{op.emoji}</span>
                <span>{op.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Resultado */}
      {fase === 'resultado' && res && (
        <div className="quiz__result">
          <div className="quiz__result-icon">{res.emoji}</div>
          <small style={{ color: res.cor, textTransform: 'uppercase', letterSpacing: '.1em', fontWeight: 700 }}>Formato recomendado</small>
          <h3>{res.titulo}</h3>
          <p>{res.desc}</p>

          <div className="quiz__result-respostas">
            <strong>O que respondeu</strong>
            {['cq0','cq1','cq2'].map(k => respostas[k] && (
              <div key={k} className="quiz__result-item">· {respostas[k]}</div>
            ))}
          </div>

          <div className="quiz__result-actions">
            <a href={buildWA()} target="_blank" rel="noopener noreferrer" className="btn btn--wa btn--full">
              💬 Falar com o Bernardo pelo WhatsApp
            </a>
            <a href={`#${res.id}`} className="btn btn--full" style={{ background: res.cor, color: '#fff', border: 'none' }}>
              Ver este formato →
            </a>
            <button className="quiz__reset" onClick={reset}>Recomeçar</button>
          </div>
          <p className="quiz__wa-note">A mensagem já vem preenchida com as suas respostas.</p>
        </div>
      )}
    </div>
  );
}
