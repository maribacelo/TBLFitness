# TBL Studio — Personal Training by Bernardo Lima

Site institucional em **Astro 4**, mobile-first, estático, pronto para GitHub Pages.

---

## Estrutura

```
tbl-studio/
├── src/
│   ├── components/
│   │   ├── Header.astro       # Header sticky + menu mobile
│   │   ├── Footer.astro       # Footer com links reais
│   │   ├── Quiz.astro         # Quiz interactivo sem framework cliente
│   │   └── ContactForm.astro  # Formulário validado sem framework cliente
│   ├── layouts/
│   │   └── BaseLayout.astro   # HTML base, SEO, JSON-LD
│   ├── pages/
│   │   └── index.astro        # Página principal (one-page)
│   └── styles/
│       └── global.css         # Variáveis CSS, reset, utilitários
├── public/
│   ├── images/                # Todas as imagens do site
│   ├── robots.txt
│   └── sitemap.xml
├── .github/workflows/
│   └── deploy.yml             # Deploy automático para GitHub Pages
├── astro.config.mjs
├── package.json
└── tsconfig.json
```

---

## Instalação e desenvolvimento local

Requer Node.js 22.12+.

```bash
# 1. Instalar dependências
npm install

# 2. Iniciar servidor de desenvolvimento
npm run dev
# Abre em http://localhost:4321

# 3. Build de produção
npm run build

# 4. Preview do build
npm run preview
```

---

## Deploy no GitHub Pages

### Automático (recomendado)
1. Fazer push para o branch `main`
2. O workflow `.github/workflows/deploy.yml` faz o build e deploy automaticamente

### Configuração inicial
1. No GitHub → Settings → Pages → Source → **GitHub Actions**
2. Em `astro.config.mjs`, ajustar `BASE`:
   - Se o repo for `username.github.io` → `base: '/'`
   - Se o repo for `username/tbl-studio` → `base: '/tbl-studio'`
3. Substituir `https://[DOMINIO]` pelo domínio real em `astro.config.mjs` e `src/layouts/BaseLayout.astro`

---

## Placeholders a substituir antes de publicar

| Ficheiro | O que substituir |
|---|---|
| `astro.config.mjs` | `[DOMINIO]` e `BASE` |
| `src/layouts/BaseLayout.astro` | `[DOMINIO]` |
| `public/robots.txt` | `[DOMINIO]` |
| `public/sitemap.xml` | `[DOMINIO]` |
| `src/components/ContactForm.astro` | `FORMSPREE_ENDPOINT` |

---

## Integração do formulário

**Opção A — Formspree (recomendado, gratuito):**
1. Criar conta em [formspree.io](https://formspree.io)
2. Criar formulário e copiar o endpoint
3. Em `src/components/ContactForm.astro`, substituir:
   ```js
   const FORMSPREE_ENDPOINT = 'https://formspree.io/f/SEU_ID';
   ```

**Opção B — Netlify Forms:**
1. Fazer deploy no Netlify
2. Adicionar `data-netlify="true"` ao `<form>` em `ContactForm.astro`

---

## Contactos reais já configurados
- WhatsApp: +351 969 698 944
- Email: bernardo.lima93@gmail.com
- Instagram: @tbl.treinos
- Morada: Av. Almirante Gago Coutinho, 1000-015 Lisboa

---

## Notas técnicas
- **Sem framework no cliente**: `Quiz` e `ContactForm` usam JavaScript leve compilado pelo Astro
- **Imagens**: JPEG fallback + WebP em `/public/images/`, servidas via `<picture>`
- **SEO**: JSON-LD LocalBusiness, Open Graph, Twitter Card, canonical, sitemap
- **Acessibilidade**: skip link, aria-labels, foco visível, contraste adequado
- **Performance**: CSS e JS mínimos, lazy loading nas imagens, sem bibliotecas pesadas
