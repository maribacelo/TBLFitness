// src/components/ContactForm.tsx
import { useState } from 'react';

// ── INTEGRAÇÃO ──────────────────────────────────────────────
// Opção A — Formspree: substituir por 'https://formspree.io/f/SEU_ID'
// Opção B — Netlify Forms: adicionar data-netlify="true" ao form
// Opção C — EmailJS: preencher SERVICE_ID, TEMPLATE_ID, PUBLIC_KEY
const FORMSPREE_ENDPOINT = '';
// ────────────────────────────────────────────────────────────

function validate(nome: string, contacto: string) {
  const erros: Record<string, string> = {};
  if (!nome.trim()) erros.nome = 'Por favor, introduza o seu nome.';
  const c = contacto.trim();
  if (!c) erros.contacto = 'Por favor, introduza telefone ou email.';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c) && !/^[\d\s+\-()]{7,}$/.test(c))
    erros.contacto = 'Introduza um email ou número de telefone válido.';
  return erros;
}

export default function ContactForm() {
  const [nome,     setNome]     = useState('');
  const [contacto, setContacto] = useState('');
  const [formato,  setFormato]  = useState('');
  const [mensagem, setMensagem] = useState('');
  const [erros,    setErros]    = useState<Record<string, string>>({});
  const [loading,  setLoading]  = useState(false);
  const [enviado,  setEnviado]  = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const e2 = validate(nome, contacto);
    setErros(e2);
    if (Object.keys(e2).length) return;

    setLoading(true);
    const dados = { nome, contacto, formato, mensagem };

    if (FORMSPREE_ENDPOINT) {
      try {
        const res = await fetch(FORMSPREE_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify(dados),
        });
        if (res.ok) { setEnviado(true); setNome(''); setContacto(''); setFormato(''); setMensagem(''); }
        else alert('Erro ao enviar. Por favor contacte pelo WhatsApp.');
      } catch {
        alert('Não foi possível enviar. Por favor contacte pelo WhatsApp.');
      }
    } else {
      // Demo — sem backend
      await new Promise(r => setTimeout(r, 900));
      setEnviado(true);
      console.info('[DEMO] Dados sem envio real:', dados);
    }
    setLoading(false);
  }

  if (enviado) {
    return (
      <div className="form-sucesso" role="alert">
        <strong>✓ Pedido enviado!</strong>
        <p>Entraremos em contacto nas próximas 24 horas.</p>
      </div>
    );
  }

  return (
    <form className="contact-form" onSubmit={handleSubmit} noValidate>
      <p className="form-nota">Resposta nas 24 horas seguintes por WhatsApp ou email.</p>

      <div className="form-group">
        <label htmlFor="nome">Nome <span aria-hidden="true">*</span></label>
        <input
          type="text" id="nome" name="nome"
          placeholder="O seu nome"
          autoComplete="name"
          value={nome} onChange={e => setNome(e.target.value)}
          aria-invalid={!!erros.nome}
          aria-describedby={erros.nome ? 'erro-nome' : undefined}
        />
        {erros.nome && <span id="erro-nome" className="form-erro" role="alert">{erros.nome}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="contacto">Telefone ou email <span aria-hidden="true">*</span></label>
        <input
          type="text" id="contacto" name="contacto"
          placeholder="Número ou endereço de email"
          value={contacto} onChange={e => setContacto(e.target.value)}
          aria-invalid={!!erros.contacto}
          aria-describedby={erros.contacto ? 'erro-contacto' : undefined}
        />
        {erros.contacto && <span id="erro-contacto" className="form-erro" role="alert">{erros.contacto}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="formato">Formato de interesse</label>
        <select id="formato" name="formato" value={formato} onChange={e => setFormato(e.target.value)}>
          <option value="" disabled>Seleccione uma opção</option>
          <option value="presencial">Presencial no estúdio</option>
          <option value="online">Online por videochamada</option>
          <option value="app">Plano por app</option>
          <option value="outdoor">Treino outdoor</option>
          <option value="empresas">Ginástica laboral / Empresas</option>
          <option value="outro">Outro / Não sei ainda</option>
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="mensagem">Mensagem</label>
        <textarea
          id="mensagem" name="mensagem" rows={4}
          placeholder="Conte brevemente o que procura…"
          value={mensagem} onChange={e => setMensagem(e.target.value)}
        />
      </div>

      <button type="submit" className="btn btn--primary btn--full" disabled={loading}>
        {loading ? 'A enviar…' : 'Enviar pedido'}
      </button>
    </form>
  );
}
