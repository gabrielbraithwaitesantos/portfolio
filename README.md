# Portfólio — Gabriel Santos

Site pessoal estático (HTML/CSS/JS puro), sem framework e sem build step, pronto para GitHub Pages.

## Estrutura

```
index.html            → página inicial (sobre + trajetória)
portfolio/index.html  → /portfolio — portfólio de projetos técnicos
criacoes/index.html   → /criacoes — coleção de criações pessoais
css/style.css         → layout, cores, tipografia
css/animations.css    → scroll reveal, fade-ins, reduced-motion
js/cursor.js          → cursor customizado (desativado em touch)
js/scroll-reveal.js   → animações ao rolar a página
js/interactions.js    → tilt 3D nos cards + botões magnéticos
assets/images/        → coloque fotos e imagens aqui
```

## Como publicar no GitHub Pages

1. Crie um repositório no GitHub (ex: `portfolio` ou `seuusuario.github.io`).
2. Suba estes arquivos para a branch `main`:
   ```
   git init
   git add .
   git commit -m "Site do portfólio"
   git branch -M main
   git remote add origin https://github.com/SEU-USUARIO/SEU-REPO.git
   git push -u origin main
   ```
3. No GitHub: **Settings → Pages → Source → Deploy from a branch → `main` / `/root`**.
4. Em 1-2 minutos o site estará em:
   - `https://SEU-USUARIO.github.io/SEU-REPO/` (ou `https://SEU-USUARIO.github.io/` se o repo se chamar `SEU-USUARIO.github.io`)
   - `.../portfolio/` e `.../criacoes/` já funcionam automaticamente pelas subpastas.

## Editar depois

- **Links de contato** (e-mail, LinkedIn): procure por `<!-- <a href="mailto:...` nos rodapés de `index.html`, `portfolio/index.html` e `criacoes/index.html` e descomente/edite.
- **Texto sobre uso de IA**: procure pela classe `.ai-disclosure` em cada página.
- **Fotos da seção Criações**: em `criacoes/index.html`, dentro de cada `.creation-media`, troque o `<span class="placeholder-label">` por uma tag `<img src="../assets/images/sua-foto.jpg" alt="...">`. Coloque os arquivos de imagem em `assets/images/`.
- **Novos itens na Coleção de Criações**: copie um bloco `<article class="creation-card">...</article>` em `criacoes/index.html` (há um comentário indicando onde).

## Notas técnicas

- Sem dependências de build. As únicas requisições externas são as fontes do Google Fonts (Fraunces, JetBrains Mono, Inter).
- Cursor customizado e tilt 3D são desativados automaticamente em dispositivos touch e quando o usuário tem `prefers-reduced-motion` ativado.
