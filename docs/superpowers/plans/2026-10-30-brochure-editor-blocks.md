# Editor de brochuras por blocos — Plano de implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Editor de brochuras A4 em HTML/CSS/JS (módulos ES) em que o corpo é montado com blocos reutilizáveis, com Factsheet e Quarterly Report como presets.

**Architecture:** Núcleo puro e testável em Node (`util`, `store`, `blocks/*`, `presets/*`, `paginate`) e camada de navegador fina (`document`, `ui/*`, `main`). Blocos são módulos que se registram em `blocks/index.js`; o formulário, a lista de estrutura e a paginação só conhecem o contrato do bloco. A medição de altura é injetada em `paginate`, então a lógica de paginação roda em Node com uma função `measure` falsa.

**Tech Stack:** HTML + CSS + JS (módulos ES nativos, sem build), `node --test` (Node ≥ 20, sem dependências), servidor `python3 -m http.server`, Browser pane para verificação visual.

**Spec:** `docs/superpowers/specs/2026-10-30-brochure-editor-blocks-design.md`

## Global Constraints

- Raiz do projeto `P` = `output/components/component-brochure-editor-blocks-2026-10-30/`. Todos os caminhos abaixo são relativos a `P`, salvo indicação.
- Páginas A4: 794×1123 px; impressão com `@page` 210×297 mm.
- Nunca fixar cores, fontes, espaçamentos ou raios: usar `var(--…)` dos tokens do DS (`../gcs-design-system/tokens/*.css`). Fontes Yrsa e Heebo.
- Tokens por `<link>` relativo a partir de `P`: copiar o conjunto de `<link>` do `<head>` de `output/components/component-brochure-editor-2026-10-30.html` e acrescentar um `../` (P está uma pasta abaixo).
- Módulos ES nativos; servidor local em `127.0.0.1:8765` servindo a pasta `Github`. URL do editor: `http://127.0.0.1:8765/gcs-design-ops/output/components/component-brochure-editor-blocks-2026-10-30/index.html`. Se a porta estiver livre: `cd "/Volumes/GCS - DISK 1T/GCS 2026/Github" && python3 -m http.server 8765 --bind 127.0.0.1` (em segundo plano).
- Rascunho em `localStorage`, chave `gcs-brochure-editor-v4:<templateId>`; escrita com debounce de 300 ms, `flush()` na troca de rota e em `beforeunload`; chaves `v3` ignoradas.
- Limites de lista: figures 2–6; benefits, options, steps, sections 0–8; about/narrative parágrafos 0–6; articles 0–10.
- Capa e contracapa não são blocos. Sem export JSON. Sem `fullPage` na v1.
- Bandeira: `https://raw.githubusercontent.com/msikma/country-flags/master/flags/png/<iso2>.png` com `onerror` para `../../../../gcs-design-system/assets/flags/<iso2>.png` (a partir de `P`; `uk`→`gb` local).
- Todo texto do usuário é escapado (`esc`) antes de entrar em HTML.
- Código-fonte visual de referência (não alterar): `output/components/component-brochure-editor-2026-10-30.html` — funções `factsheetCover`, `factsheetSections`, `factsheetPage`, `quarterlyCover`, `qAboutSections`, `qContentSections`, `qPage`, `pageBack`, `pageHead`, `paginate`, `flagUrls`, `ico`. Portar o HTML/CSS inline desses trechos para os blocos, trocando cores/fontes literais por tokens quando já existir token equivalente.

## Review Focus

1. Brochura com **0 blocos**: documento = capa + contracapa, sem página de corpo vazia, sem erro (T7, T9).
2. Listas com **0 itens** (benefits, options, steps, sections, articles): bloco renderiza sem `NaN` em `grid-template-columns` e sem grade vazia (T2 harness, T5).
3. **Rascunho corrompido** (JSON inválido, `v` diferente, bloco com `type` desconhecido): cai no preset ou descarta só o bloco desconhecido, sem lançar (T3).
4. **`pageBreak` no início, no fim ou repetido**: nunca gera página vazia (T7).
5. **Texto com `<`, `&`, `"`** em qualquer campo: aparece literal, sem injetar HTML (T2 harness).

---

### Task 1: Projeto, utilitários e runner de testes

**Files:**
- Create: `P/index.html` (casca mínima, `<title>Brochure Editor</title>`, `<script type="module" src="js/main.js">`; `js/main.js` com só um `console.log`), `P/package.json` (`{"type":"module","scripts":{"test":"node --test test/"}}`), `P/js/util.js`, `P/test/util.test.mjs`

**Interfaces:**
- Produces (`js/util.js`):
  - `esc(s: unknown): string` — escapa `& < > " '`; `null`/`undefined` → `''`.
  - `getPath(obj: object, path: string): unknown` — caminho pontilhado, segmento numérico indexa array; inexistente → `undefined`.
  - `setPath(obj: object, path: string, value: unknown): void` — muta; cria objetos intermediários.
  - `uid(used?: Set<string>): string` — `'b_'` + 4 chars base36, nunca repete um id de `used`.
  - `clone<T>(v: T): T` — cópia profunda de dados JSON.

- [ ] **Step 1: Escrever `test/util.test.mjs`** com: `esc('<b>&"\'')` → `'&lt;b&gt;&amp;&quot;&#39;'`; `esc(undefined)` → `''`; `getPath({a:{b:[{c:1}]}},'a.b.0.c')` → `1`; `getPath({}, 'x.y')` → `undefined`; `setPath(o,'a.b','x')` cria `o.a.b`; `uid(new Set(['b_aaaa']))` começa com `b_`, tem 6 chars e ≠ `'b_aaaa'` em 1000 chamadas com o set crescendo.
- [ ] **Step 2: Rodar** `cd P && npm test` — Expected: FAIL (módulo inexistente).
- [ ] **Step 3: Implementar `js/util.js`** com as assinaturas acima.
- [ ] **Step 4: Rodar** `npm test` — Expected: PASS (5+ testes).
- [ ] **Step 5: Commit** — `git add P/index.html P/package.json P/js P/test && git commit -m "feat: scaffold block editor project with util"`

### Task 2: Registro de blocos, contexto de render e harness de contrato

**Files:**
- Create: `js/blocks/index.js`, `js/blocks/pageBreak.js`, `js/blocks/heading.js`, `js/ctx.js`, `test/helpers.mjs`, `test/blocks.test.mjs`

**Interfaces:**
- Consumes: `esc`, `getPath`, `uid` de `util.js`.
- Produces:
  - Tipo `BlockDef = { type, label, icon, group, unique?, defaults(): object, fields?: Field[], lists?: Record<string, ListDef>, render(props, ctx): string, split?(props, ctx): string[] }`; `Field = [path, label, kind?: 'text'|'area'|'img'|'select'|'toggle', arg?]` (`arg` = linhas para `area`, largura máx. para `img`, array de opções para `select`); `ListDef = { min, max, one, icon?: boolean, add(): object, f: Field[] }`.
  - `blocks/index.js`: `get(type): BlockDef|undefined`, `all(): BlockDef[]`, `list(): {group: string, blocks: BlockDef[]}[]` (grupos na ordem Texto, Números, Listas, Estrutura), `makeBlock(type, overrides = {}, used = new Set()): {id, type, props}` (props = `{...defaults(), ...overrides}`).
  - `ctx.js`: `makeCtx({ state, icons, flagUrls }, blockId: string|null): Ctx` com `Ctx = { blockId, cover, meta, F(path, tag, style?, attrs?): string, ico(name, style?): string, flag(code, size?): string }`. `F` emite `<tag data-b="<id>" data-f="<path>" style="…">escapado</tag>`; caminho iniciado em `cover.` ou `meta.` emite `data-b="cover"`/`"meta"` e `data-f` sem o prefixo, lendo de `state.cover`/`state.meta`. `ico` desenha o path de `icons[name]` num `<svg viewBox="0 -960 960 960" width="24" height="24" fill="currentColor">`; nome ausente → ícone `star`. `flag(code)` devolve `<img>` com `onerror` encadeado conforme Global Constraints, ou `''` se `code` vazio.
  - `test/helpers.mjs`: `fakeCtx(overrides?): Ctx` (state com `cover: {}`, `meta: {}`, `icons: {star:'M0 0'}`, mesmo `F`/`ico` reais de `makeCtx`), `blockWith(type, props): {id:'b_test', type, props}`.
  - `pageBreak`: `{type:'pageBreak', label:'Quebra de página', group:'Estrutura', icon:'insert_page_break', defaults:()=>({}), render:()=>''}` (marcador; `document.js` o trata na T7).
  - `heading`: group Texto, props `{eyebrow, title, subtitle}`, os três editáveis, `defaults` = `{eyebrow:'Section', title:'Section title', subtitle:''}`; `subtitle` vazio não renderiza elemento.

- [ ] **Step 1: Escrever `test/blocks.test.mjs`** como harness genérico sobre `all()`. Para cada bloco: (a) tem `type`, `label`, `icon`, `group`, `defaults`, `render`; `type` único; (b) `render(defaults, fakeCtx())` devolve string sem `undefined` nem `NaN`; (c) todo `data-f` do HTML resolve em `getPath(props, path)` para valor definido (caminhos `cover.`/`meta.` isentos); (d) para cada lista, renderiza com `max` itens (via `add()` repetido) e, se `min === 0`, com 0 itens — ambos sem erro e sem `NaN`; (e) com todas as strings de `defaults()` (inclusive dentro de listas) trocadas por `'<b>&"'`, o HTML não contém `<b>`. Mais: `makeBlock('heading')` gera id `b_xxxx` e `props.title` definido; `makeBlock('heading',{title:'X'}).props.title === 'X'`; `list()` devolve grupos não vazios; `get('nope')` → `undefined`.
- [ ] **Step 2: Rodar** `npm test` — Expected: FAIL (módulos inexistentes).
- [ ] **Step 3: Implementar** `ctx.js`, `blocks/index.js` (importa explicitamente cada bloco; novos blocos entram aqui), `pageBreak.js`, `heading.js`. Visual do `heading`: eyebrow uppercase Heebo 10px com tracking, título Yrsa 28px `var(--primary)`, subtítulo Heebo 13px `var(--doc-body)` — portar de `FS.H` e do estilo de eyebrow do Quarterly no arquivo de referência.
- [ ] **Step 4: Rodar** `npm test` — Expected: PASS.
- [ ] **Step 5: Commit** — `git commit -m "feat: block registry, render context and contract harness"`

### Task 3: Store (estado, operações e persistência)

**Files:**
- Create: `js/store.js`, `test/store.test.mjs`

**Interfaces:**
- Consumes: `blocks/index.js` (`get`, `makeBlock`), `util.js` (`clone`, `uid`, `setPath`), tipo `Preset = { id, label, blurb, tags, cover: { defaults(), form, render(cover, ctx) }, back: { render(ctx) }, meta: { defaults() }, blocks: {type, props?}[] }`.
- Produces (`js/store.js`; funções mutam o `state` recebido):
  - `createState(preset: Preset): State` → `{ v: 4, template: preset.id, cover, meta, blocks }`.
  - `addBlock(state, type: string, afterId?: string): string|null` — insere após `afterId` (ou no fim); `null` se o tipo é `unique` e já existe ou é desconhecido.
  - `duplicateBlock(state, id): string|null` — clone com id novo logo após o original; `null` se `unique` ou id inexistente.
  - `removeBlock(state, id): boolean`; `moveBlock(state, id, toIndex: number): boolean` (índice limitado ao intervalo).
  - `setValue(state, target: 'cover'|'meta'|string /*id do bloco*/, path: string, value): void`.
  - `addItem(state, blockId, listKey): boolean` — usa `ListDef.add()`; `false` se já no `max`. `removeItem(state, blockId, listKey, index): boolean` — `false` se no `min`. `moveItem(state, blockId, listKey, from, to): boolean`.
  - `loadState(preset, backend): State`; `saveState(state, backend): boolean`; `hasDraft(templateId, backend): boolean`; `scheduleSave(state, backend, delayMs = 300): void`; `flush(): void` (grava o pendente na hora). `backend` = `{getItem, setItem, removeItem}` (como `localStorage`). `clearDraft(templateId, backend): void`.

- [ ] **Step 1: Escrever `test/store.test.mjs`** (backend falso em `Map`; blocos reais do registro): `createState` do preset de teste (um preset mínimo definido no teste com `heading` e `pageBreak`) tem `v===4` e ids únicos; `addBlock(...,'heading')` com `afterId` insere na posição seguinte; `addBlock` de um tipo `unique` duas vezes → segunda `null` (usar um def `unique` registrado só no teste via `all()` — se nenhum bloco real ainda for `unique`, o teste do `unique` roda só quando `overview` existir; marcar com `t.skip` condicional); `duplicateBlock` gera id novo e `props` independente (mutar a cópia não altera o original); `removeBlock`/`moveBlock` (índices -1 e 99 limitam); `setValue(state,'cover','title1','X')`; `addItem`/`removeItem`/`moveItem` dependem de listas reais e são testados na T5 (`test/store.lists.test.mjs`); aqui só `addItem`/`removeItem` com `blockId` ou `listKey` inexistente devolvem `false`. **Persistência:** `saveState`+`loadState` ida e volta; chave `gcs-brochure-editor-v4:<id>`; JSON inválido → estado do preset; `v: 3` → estado do preset; bloco com `type: 'ghost'` é descartado e os demais ficam; `saveState` com backend que lança → `false`, sem lançar; `scheduleSave` não grava antes de `flush()` e grava depois; `hasDraft`.
- [ ] **Step 2: Rodar** `npm test -- --test-name-pattern store` — Expected: FAIL.
- [ ] **Step 3: Implementar `js/store.js`** (timer único de debounce no módulo; `flush` limpa o timer).
- [ ] **Step 4: Rodar** `npm test` — Expected: PASS.
- [ ] **Step 5: Commit** — `git commit -m "feat: editor store with block ops and draft persistence"`

### Task 4: Blocos de texto, citação, visão geral e banner

**Files:**
- Create: `js/blocks/narrative.js`, `sections.js`, `pullQuote.js`, `overview.js`, `titleBanner.js`; Modify: `js/blocks/index.js` (registrar)

**Interfaces:**
- Consumes: contrato de T2; `ctx.F`, `ctx.flag`, `ctx.cover`.
- Produces (todos group indicado; `defaults()` = conteúdo-padrão dos `defaults()` do editor de referência):
  - `narrative` (Texto): props `{eyebrow:'', title, lead:'', paragraphs:[{text}]}`; lista `paragraphs` 0–6 (`one:'Paragraph'`, campo `text` `area` 4); `eyebrow` e `lead` vazios não renderizam. Visual do About do Quarterly (`qAboutSections`).
  - `sections` (Texto): `{items:[{heading, body}]}`, lista `items` 0–8. Visual de `qContentSections`.
  - `pullQuote` (Texto): `{style:'boxed', quote, author, img:''}`; `style` ∈ `plain|boxed|dark` (campo `select`); `img` vazio → sem foto (o preset Quarterly passa a foto padrão da Patricia Casaburi como `img` — mesma fonte do editor de referência). Visual do pull quote do Quarterly (`qContentSections`).
  - `overview` (Texto, `unique: true`): `{title:'Overview', text}`; `text` multilinha preservada (`white-space:pre-line`) em 2 colunas. Visual de `ovBox(true)`.
  - `titleBanner` (Estrutura, `unique: true`): `{flag:'it'}`; título (2 linhas, a segunda itálica `var(--night-blue-50)`) e subtítulo vêm de `ctx.cover` (`cover.coverTitleLine1`, `cover.coverTitleLine2`, `cover.subtitle`) renderizados com `ctx.F('cover.…')`; a bandeira com `ctx.flag(props.flag, 44)`. Visual do `head` de `factsheetPage` na primeira página.

- [ ] **Step 1: Ampliar `test/blocks.test.mjs`** (o harness já cobre contrato, `NaN`, escape e `data-f`): para `fakeCtx({state:{cover:{coverTitleLine1:'A',coverTitleLine2:'B',subtitle:'S'},meta:{}}})`, `titleBanner` renderiza `data-b="cover"` e `data-f="coverTitleLine1"`; `narrative` com `lead:''` e `eyebrow:''` não contém elemento de eyebrow/lead (sem `data-f="lead"`); `pullQuote` com `style:'dark'` e `style:'plain'` produz HTML diferente; `overview.render` contém `white-space:pre-line`; `overview` e `titleBanner` têm `unique === true`.
- [ ] **Step 2: Rodar** `npm test` — Expected: FAIL (blocos não registrados).
- [ ] **Step 3: Implementar os 5 blocos** e registrá-los em `blocks/index.js`.
- [ ] **Step 4: Rodar** `npm test` — Expected: PASS (inclui o teste `unique` condicional da T3, que agora executa).
- [ ] **Step 5: Commit** — `git commit -m "feat: text, quote, overview and title banner blocks"`

### Task 5: Blocos de números e listas

**Files:**
- Create: `js/blocks/figures.js`, `benefits.js`, `options.js`, `steps.js`, `articles.js`, `test/store.lists.test.mjs`; Modify: `js/blocks/index.js`

**Interfaces:**
- Produces:
  - `figures` (Números): `{theme:'dark', items:[{label,value}]}`; lista `items` 2–6; colunas = `n <= 5 ? n : 3`; `theme` ∈ `dark|light` (`select`); visual do `figs` de `factsheetPage` (escuro) e variante clara com `var(--doc-surface)`.
  - `benefits` (Listas): `{title:'Key Benefits', items:[{icon,title,desc}]}`; lista 0–8 com `icon: true`; `desc` com `-webkit-line-clamp:2`; colunas `min(4, max(n,1))`; sem itens o bloco inteiro (título incluído) renderiza `''`. Visual de `wideBen`.
  - `options` (Listas): `{title:'Investment Options', items:[{title,amount,desc}]}`, 0–8; colunas `colsFor(n, 4)` (`n<=4 ? n : ceil(n/2)`); numeração `01…`; vazio → `''`.
  - `steps` (Listas): `{title:'Application Procedure', items:[{title,desc}]}`, 0–8; colunas `colsFor(n, 6)`; gap 14 px quando n > 6; vazio → `''`. Aceita `duration` opcional por item (campo `Duration`, vazio não renderiza o chip).
  - `articles` (Listas): `{title:'', items:[{title,excerpt,url,img}]}`, 0–10; título vazio não renderiza cabeçalho; sem borda inferior no último (`.blk:last-child`/`:last-child` no CSS). Visual da lista de artigos de `qAboutSections`.
  - `test/store.lists.test.mjs`: `addItem`/`removeItem`/`moveItem` sobre `figures` (`removeItem` em 2 itens → `false`; `addItem` em 6 → `false`) e sobre `benefits` (`removeItem` até 0 → `true` em todos, depois `false`).

- [ ] **Step 1: Escrever** `test/store.lists.test.mjs` e acrescentar ao harness: `figures` com 2 e 6 itens usa as colunas esperadas (`repeat(2,` e `repeat(3,`); `benefits`/`options`/`steps`/`articles` com 0 itens devolvem `''` (ou só o contêiner sem grade, para `articles` com título); `steps` com `duration:''` não contém `data-f="items.0.duration"`.
- [ ] **Step 2: Rodar** `npm test` — Expected: FAIL.
- [ ] **Step 3: Implementar os 5 blocos** e registrar.
- [ ] **Step 4: Rodar** `npm test` — Expected: PASS.
- [ ] **Step 5: Commit** — `git commit -m "feat: figures, benefits, options, steps and articles blocks"`

### Task 6: Presets Factsheet e Quarterly

**Files:**
- Create: `js/presets/index.js`, `js/presets/factsheet.js`, `js/presets/quarterly.js`, `test/presets.test.mjs`

**Interfaces:**
- Consumes: contrato `Preset` (T3), `ctx.F`/`ctx.flag`.
- Produces: `presets/index.js` → `get(id): Preset|undefined`, `all(): Preset[]` (`factsheet`, `quarterly-report`), `SOON: {id,label}[]` (Case Study, GIU Calendar, GIU Corporate, Lead Magnet).
  - `cover.defaults()` Factsheet: `{coverTitleLine1:'Italy', coverTitleLine2:'Investor Visa', subtitle:'Golden Visa Programme', supportText:<texto padrão do editor de referência>, coverImg:''}`; `cover.form`: grupo Media (upload `coverImg`), grupo Cover (os campos de texto). `cover.render(cover, ctx)` = `factsheetCover`.
  - `cover.defaults()` Quarterly: `{quarter:'Q2 2026', coverTitle1, coverTitle2, coverImg:''}`; `cover.render` = `quarterlyCover`.
  - `back.render(ctx)` = `pageBack` (compartilhado: extrair para `js/presets/back.js` exportando `renderBack(ctx)`).
  - `meta.defaults()` Factsheet: `{headerLabel:'Italy Investor Visa', footerLeft:'GLOBALCITIZENSOLUTIONS.COM', footerRight:'Italy Investor Visa — Factsheet', year:'2026'}`; Quarterly: `{headerLabel:'Investment Migration Quarterly Report', footerLeft:'© {year} Global Citizen Solutions', footerRight:'', year:'2026'}`. `{year}` em `footerLeft`/`footerRight` é substituído por `meta.year`.
  - Blocos Factsheet, nesta ordem: `titleBanner{flag:'it'}`, `figures{theme:'dark', 4 itens}`, `overview`, `benefits` (6), `options` (4), `steps` (6). Blocos Quarterly: `narrative{title:'About this Report', 3 parágrafos}`, `articles` (5), `pageBreak`, `heading{eyebrow:'01 · Market Overview', title:'Key Regulatory & Policy Developments'}`, `sections` (3), `pullQuote{style:'boxed', autor Patricia Casaburi, img: foto padrão}`. Conteúdo textual idêntico aos `defaults()` do editor de referência.

- [ ] **Step 1: Escrever `test/presets.test.mjs`**: para cada preset de `all()` — todo `blocks[i].type` existe em `get()`; nenhum tipo `unique` aparece 2×; `createState(preset)` dá `blocks.length` igual ao declarado (6 e 6); Factsheet começa com `titleBanner` e tem `figures.props.items.length === 4`; Quarterly tem exatamente 1 `pageBreak` e `blocks[2].type === 'pageBreak'`; `meta.defaults().year === '2026'`; `cover.render(cover, fakeCtx())` e `back.render(fakeCtx())` devolvem string que contém `data-doc-page`; `SOON.length === 4`.
- [ ] **Step 2: Rodar** `npm test` — Expected: FAIL.
- [ ] **Step 3: Implementar** os presets, `back.js` e `presets/index.js`; portar HTML de `factsheetCover`, `quarterlyCover` e `pageBack` do arquivo de referência (cada capa referencia `BR + '/<template>/background-cover.png'` → `../../../../gcs-design-system/templates/brochures/<template>/background-cover.png` a partir de `P`).
- [ ] **Step 4: Rodar** `npm test` — Expected: PASS.
- [ ] **Step 5: Commit** — `git commit -m "feat: factsheet and quarterly presets"`

### Task 7: Paginação e montagem do documento

**Files:**
- Create: `js/paginate.js`, `js/document.js`, `test/paginate.test.mjs`, `test/document.test.mjs`

**Interfaces:**
- Consumes: `blocks/index.js`, `ctx.js`, preset (T6), `esc`.
- Produces:
  - `paginate.js`: `Item = { id: string, html: string, kind?: 'break', split?: () => string[] }`; `paginate(items: Item[], opts: { measure: (page: Item[]) => number, guard?: number /* padrão 200 */ }): { pages: Item[][], warnings: { page: number, blockId: string, kind: 'tooTall' }[] }`. Regras: `kind:'break'` fecha a página atual e **nunca** produz página vazia (início, fim e repetidos ignorados); enche a página; se `measure(page) > 1` move o último item para a página seguinte; se sobra um item só e tem `split`, substitui por itens `{id, html}` das partes (mesmo `id`) e reavalia; se ainda estoura → aviso `tooTall` e segue; `guard` limita as iterações (ao estourar, devolve o que tem e um aviso `tooTall` para o bloco corrente). Lista de itens vazia → `{pages: [], warnings: []}`.
  - `document.js`: `buildItems(state, deps: { icons, flagUrls }): Item[]` — um `Item` por bloco, `html` = `<div class="blk" data-blk="<id>">` + `render(props, makeCtx(...))` + `</div>`, `split` = `() => def.split(props, ctx).map(wrap)` quando o bloco define `split`; `pageBreak` → `{id, html:'', kind:'break'}`; blocos com `render` vazio são omitidos (exceto `pageBreak`). `renderDocument(state, preset, deps, measure): { pages: string[], warnings }` — `[capa, ...corpo, contracapa]`; cada página de corpo = `pageChrome(inner, {state, pageNo, total})`: cabeçalho (`meta.headerLabel` + logos, portar `pageHead`), `<div data-body …>` com os itens, rodapé (`footerLeft` à esquerda; à direita `footerRight` + `' · '` + número de 2 dígitos, omitindo o trecho de `footerRight` quando vazio; `{year}` substituído). Numeração: capa = 1, então o primeiro corpo = 02.
  - Em `document.js`, `measure` recebe a lista de itens da página e deve ser provido pelo chamador (navegador: monta `pageChrome` num contêiner oculto e devolve `scrollHeight - clientHeight` do `[data-body]`).

- [ ] **Step 1: Escrever `test/paginate.test.mjs`** com `measure` falso (`items => items.reduce((s,i)=>s+(i.h ?? 10),0) - 100`, cada item com altura `h`): 3 itens de 40 → 2 páginas `[[a,b],[c]]`; item de 50 + item de 60 → página 1 `[a]`, página 2 `[b]`; `[break,a,break,break,b,break]` → `[[a],[b]]`; só breaks → `{pages:[]}`; item de 150 sem `split` → 1 página e 1 aviso `tooTall` com `blockId`; item de 150 com `split` devolvendo duas partes de 60 → 2 páginas, 0 avisos; `guard:3` com `measure` que sempre estoura → termina e devolve aviso; lista vazia. **`test/document.test.mjs`**: com o preset Quarterly e `measure:()=>0`, `renderDocument` devolve 4 páginas (capa, About, Content, contracapa), a segunda com rodapé `02`, a terceira com `03`; com `state.blocks = []` devolve 2 páginas (capa, contracapa); com `[pageBreak]` só → 2 páginas; `meta.footerLeft` com `{year}` sai com `2026`; texto de `meta.headerLabel` com `<b>` sai escapado.
- [ ] **Step 2: Rodar** `npm test` — Expected: FAIL.
- [ ] **Step 3: Implementar** `paginate.js` (algoritmo de `paginate` do arquivo de referência, generalizado para `Item`/`measure`) e `document.js`.
- [ ] **Step 4: Rodar** `npm test` — Expected: PASS.
- [ ] **Step 5: Commit** — `git commit -m "feat: pure pagination and document assembly"`

### Task 8: Casca do editor e palco (navegador)

**Files:**
- Create: `css/app.css`, `css/doc.css`, `data/icons.json` (copiar o JSON `ICONS` embutido no arquivo de referência: 33 ícones `{ nome: "path" }`), `js/ui/stage.js`; Modify: `index.html`, `js/main.js`

**Interfaces:**
- Consumes: `renderDocument`, `createState`/`loadState`, `presets/index.js`.
- Produces:
  - `index.html`: `<body data-view="gallery|editor">` com `#gallery` e `#app` (`#top`, `#structure`, `#form`, `#stage`); tokens por `<link>`; `css/doc.css` com `@page{size:210mm 297mm;margin:0}`, regras de impressão (esconde `#top`, `#structure`, `#form`, chips; páginas sem sombra/zoom) e estilos de página A4; `css/app.css` com layout em 3 colunas (estrutura 280 px | palco | formulário 340 px) usando só tokens.
  - `ui/stage.js`: `mountStage(el: HTMLElement, opts: { onPageVisible?: (i: number) => void }): { render(pages: string[], warnings): void, fit(): void, setZoom(z: number): void, scrollToBlock(id: string): void }` — chips "1 · Cover", "2", …, "N · Back"; "Fit width"; slider de zoom; chip ativo acompanha o scroll.
  - `main.js`: carrega `data/icons.json`, resolve a rota por hash (`#<templateId>` abre o editor; vazio mostra a galeria — implementada na T10, aqui só o editor), monta estado (`loadState`), define `measure` (contêiner oculto `#probe` com o mesmo CSS), chama `renderDocument` e `stage.render`; expõe `window.__editor = { state, rerender }` somente para verificação manual.

- [ ] **Step 1: Escrever o critério de verificação** (sem teste automatizado de DOM nesta task): abrindo `index.html#factsheet` e `#quarterly-report`, `document.querySelectorAll('#stage [data-doc-page]').length` deve ser ≥ 3 (capa + ≥1 corpo + contracapa), 0 erros no console, fontes Yrsa/Heebo carregadas.
- [ ] **Step 2: Implementar** `index.html`, CSS, `stage.js`, `main.js`; garantir servidor ativo (Global Constraints).
- [ ] **Step 3: Verificar no Browser pane** (`navigate` ao URL do editor com `#factsheet`): `read_console_messages` sem erros; JS: `document.querySelectorAll('#stage [data-doc-page]').length`; comparar `screenshot` da página 2 com o editor de referência (`output/components/component-brochure-editor-2026-10-30.html` via mesmo servidor, `#factsheet`) — conteúdo e ordem iguais, exceto a diferença documentada de overview/benefits lado a lado. Repetir com `#quarterly-report` (4 páginas: capa, About, Content, contracapa; rodapés `02` e `03`).
- [ ] **Step 4: Verificar** `npm test` continua PASS.
- [ ] **Step 5: Commit** — `git commit -m "feat: editor shell, stage and document rendering"`

### Task 9: Estrutura, formulário, seletor de ícones e clique-para-editar (navegador)

**Files:**
- Create: `js/ui/structure.js`, `js/ui/form.js`, `js/ui/picker.js`; Modify: `js/main.js`, `css/app.css`

**Interfaces:**
- Consumes: operações de `store.js`, `blocks.list()/get()`, contrato `fields`/`lists`, `scheduleSave`.
- Produces (contratos de DOM verificáveis):
  - `mountStructure(el, api: { state, onChange(): void, onSelect(id): void })`: linhas `[data-row="<id>"]` com alça `[data-act="drag"]` e botões `[data-act="up"|"down"|"dup"|"del"]` (`dup` oculto/desativado para `unique`); linha selecionada com `aria-selected="true"`; "Adicionar bloco" = botões `[data-add="<type>"]` agrupados por `group`, **omitindo** tipos `unique` já presentes; arrastar linhas reordena (HTML5 drag-and-drop, só desktop; setas continuam no toque).
  - `mountForm(el, api)`: abre o bloco selecionado — `fields` e `lists` viram controles `[data-k="<path>"]` (input, `textarea` para `area`, `select`, `toggle`, upload de imagem para `img` com redimensionamento ao `arg` px de largura); listas com `+ Add <one>` (`disabled` no `max`), `✕` por item (`disabled` no `min`), setas de ordem e contagem "n/max"; `icon: true` abre `picker.js` com os 33 ícones. Grupos fixos "Cover" e "Document" (campos de `preset.cover.form` e `meta`: `headerLabel`, `footerLeft`, `footerRight`, `year`) acima do bloco selecionado. Sem seleção → mostra Cover e Document. Digitar atualiza o estado a cada `input`, chama `onChange`, que redesenha o documento e `scheduleSave`, **sem perder foco**.
  - `picker.js`: `openPicker(anchor: HTMLElement, icons: object, current: string): Promise<string|null>`.
  - Clique em `[data-b][data-f]` na página: `data-b="cover"|"meta"` abre o grupo respectivo; id de bloco seleciona a linha, abre o formulário e dá foco em `[data-k="<data-f>"]`; a página do bloco rola para a vista.

- [ ] **Step 1: Critérios de verificação** (JS no Browser pane sobre `#factsheet`): clicar `[data-add="steps"]` aumenta `blocks.length` em 1 e a contagem de `[data-blk]` em 1; `[data-add="overview"]` e `[data-add="titleBanner"]` ausentes do menu (já existem); `dup` num bloco `figures` cria linha nova logo abaixo; `del` reduz; `up` no 2º bloco o leva à posição 1 (ordem de `[data-blk]` no palco muda); em `figures` com 6 itens o botão `+ Add` está `disabled`, com 2 o `✕` está `disabled`; clicar no texto `[data-b][data-f="items.0.value"]` seleciona a linha do bloco e `document.activeElement` é `[data-k="items.0.value"]`; digitar `X` nesse campo mantém o foco e atualiza o texto na página; remover todos os blocos deixa 2 páginas (capa, contracapa) e nenhum erro de console.
- [ ] **Step 2: Implementar** `structure.js`, `form.js`, `picker.js` e a ligação em `main.js` (um único `onChange` que: re-renderiza documento, atualiza estrutura/formulário se a forma mudou, chama `scheduleSave`).
- [ ] **Step 3: Verificar** os critérios do Step 1 no Browser pane; `read_console_messages` sem erros.
- [ ] **Step 4: Verificar** `npm test` PASS.
- [ ] **Step 5: Commit** — `git commit -m "feat: structure list, schema-driven form, icon picker and click-to-edit"`

### Task 10: Galeria, barra superior, avisos, reset e exportação (navegador)

**Files:**
- Create: `js/ui/gallery.js`; Modify: `js/main.js`, `index.html`, `css/app.css`

**Interfaces:**
- Consumes: `presets.all()/SOON`, `hasDraft`, `loadState`, `clearDraft`, `flush`, `renderDocument` (capa), `paginate` warnings.
- Produces:
  - `mountGallery(el, api: { go(id): void })`: um cartão por preset com a **capa real** renderizada (`cover.render` do estado salvo ou padrão) em miniatura (`transform: scale(.2494)` num contêiner 198×280), tag "Draft saved" quando `hasDraft`; um cartão desativado "Coming soon" por item de `SOON`; clicar abre `#<id>`.
  - Barra `#top`: botão "‹ Templates" (`location.hash = ''`), `<select id="switch">` com os presets, chip `#fit` (`✓ Fits` ou `⚠ N warnings`; clicar rola até o bloco do primeiro aviso, seleciona-o e abre o formulário), botão Reset (confirmação citando o nome do template; `clearDraft` + recria o estado do preset), botão "Export PDF" (`window.print()` após `flush()`).
  - Rota: `route()` chama `flush()` antes de trocar; `beforeunload` chama `flush()`.
  - Aviso `lineClamp`: após o render, o chip também conta elementos com `-webkit-line-clamp` cujo `scrollHeight > clientHeight`.

- [ ] **Step 1: Critérios de verificação** (Browser pane): em `#` aparecem 2 cartões com miniatura e 4 "Coming soon"; apagar `localStorage` mostra sem tag; editar um campo no Factsheet, voltar com "‹ Templates" mostra "Draft saved" no cartão e a miniatura reflete o texto editado; editar e trocar via `#switch` em < 300 ms preserva a edição (reabrir e ler o campo); em Quarterly, 10 artigos + 8 seções com texto longo produzem ≥ 4 páginas de corpo e `#fit` mostra contagem; um bloco `sections` com um único item de 6000 caracteres sem espaços gera aviso `tooTall` e o clique no chip rola até ele; Reset com confirmação volta ao conteúdo-padrão e a miniatura também; `window.print` é chamado (substituir por stub e checar chamada) ao clicar Export.
- [ ] **Step 2: Implementar** `gallery.js` e ligações em `main.js`.
- [ ] **Step 3: Verificar** no Browser pane conforme Step 1; `read_console_messages` sem erros.
- [ ] **Step 4: Verificar** `npm test` PASS.
- [ ] **Step 5: Commit** — `git commit -m "feat: gallery, top bar, warnings, reset and export"`

### Task 11: Verificação final e paridade

**Files:**
- Modify: apenas correções que a verificação exigir (cada uma com teste ou critério repetido)

- [ ] **Step 1: Rodar** `cd P && npm test` — Expected: todos PASS, 0 skipped.
- [ ] **Step 2: Paridade — conteúdo máximo.** No Factsheet: figures 6, benefits 8, options 8, steps 8; no Quarterly: about 6, articles 10, sections 8. Verificar no Browser pane que nenhum bloco é cortado (exceto os avisos legítimos), que a numeração de rodapé é contínua e que `#fit` conta os avisos corretamente.
- [ ] **Step 3: Paridade — conteúdo-padrão.** Comparar lado a lado (screenshots no mesmo viewport) cada página dos dois presets com o editor de referência; anotar diferenças além da documentada na spec (§7) e corrigir.
- [ ] **Step 4: Casos do Review Focus no navegador:** 0 blocos; benefits com 0 itens; `localStorage['gcs-brochure-editor-v4:factsheet'] = '{bad'` e recarregar (cai no preset); um bloco com `type:'ghost'` injetado no rascunho (descartado); `pageBreak` no início/fim/duplicado; texto `<img src=x onerror=alert(1)>` num campo (aparece literal).
- [ ] **Step 5: Não cobertos:** testar à mão upload de imagem (capa e foto de autor) e o diálogo de impressão (Salvar como PDF, 210×297 mm, sem margens); registrar o resultado no resumo final.
- [ ] **Step 6: Parar o servidor** se foi iniciado por esta execução: `pkill -f "http.server 8765"`.
- [ ] **Step 7: Commit** das correções (se houver) — `git commit -m "fix: parity and review-focus corrections"`
