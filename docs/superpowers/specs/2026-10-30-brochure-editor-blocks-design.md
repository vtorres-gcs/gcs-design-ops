# Editor de brochuras por blocos — desenho

Data: 2026-10-30 · Estado: aguardando revisão

## 1. Objetivo

Substituir o editor de brochuras atual (um arquivo HTML, formulário fixo por template) por um editor em que o usuário monta o **corpo** da brochura com **blocos reutilizáveis**: adicionar, remover, duplicar, reordenar e editar. Cada template vira um **preset** (capa + contracapa fixas + lista inicial de blocos).

Sucesso da v1:

- Factsheet e Quarterly Report abrem como presets e reproduzem o conteúdo dos templates atuais.
- O usuário consegue montar uma brochura nova só com blocos e exportar em PDF (`window.print()`).
- Criar um bloco novo é criar um arquivo, sem tocar no núcleo.

Fora da v1: os outros quatro templates (case-study, giu-calendar, giu-corporate, lead-magnet), os blocos específicos deles (seção 4.2), `fullPage`, avisos estéticos, upload testado e impressão testada.

## 2. Decisões já tomadas

- Rota A: cada template é reescrito em HTML/CSS/JS com tokens do DS, sem o runtime `dc`.
- HTML + CSS + JS em arquivos separados, módulos ES nativos, servidor local (sem `file://`, sem build).
- Capa e contracapa **não são blocos**; vêm do preset.
- Fluxo contínuo: os blocos enchem as páginas na ordem; `pageBreak` força página nova.
- Arquitetura A: registro de módulos de bloco, renderização por template string.
- Limites de lista, aviso de conteúdo que não cabe, ícones à escolha e bandeira online (msikma/country-flags, com fallback local) seguem como no editor atual. Sem export JSON.

## 3. Estrutura de arquivos

```
output/components/component-brochure-editor-blocks-2026-10-30/
  index.html  package.json
  css/   app.css   doc.css
  data/  icons.json
  js/
    main.js  store.js  paginate.js  document.js
    blocks/   index.js  heading.js  narrative.js  sections.js  pullQuote.js
              figures.js  benefits.js  options.js  steps.js  articles.js
              overview.js  titleBanner.js  pageBreak.js
    presets/  index.js  factsheet.js  quarterly.js
    ui/       gallery.js  structure.js  form.js  stage.js  picker.js
  test/   store.test.mjs  blocks.test.mjs  presets.test.mjs
```

Tokens do DS entram por `<link>` relativo (`../../../gcs-design-system/tokens/*.css`). Fontes Yrsa e Heebo vêm dos tokens. Ícones: os 33 Material Symbols do `ICONS` atual, em `data/icons.json`.

## 4. Modelo de dados

### 4.1 Estado

```js
state = {
  template: 'factsheet',
  cover: { ... },                 // props da capa do preset
  meta:  { headerLabel, footerLeft, footerRight, year },
  blocks: [{ id: 'b_x3k9', type: 'figures', props: { ... } }]
}
```

- `id` é estável (gerado na criação) e serve a reordenar, duplicar e focar o bloco.
- A contracapa não tem estado: é só `render()` do preset.
- Rascunho por template em `localStorage` na chave `gcs-brochure-editor-v4:<template>`. Chaves `v3` são ignoradas. Escrita com debounce de 300 ms, `flush()` ao trocar de rota e em `beforeunload`.

### 4.2 Preset

```js
{ id, label, blurb, tags,
  cover: { defaults(), form: [...], render(cover, ctx) },
  back:  { render(ctx) },
  meta:  { defaults() },
  blocks: [ { type: 'titleBanner', props: { flag: 'it' } }, ... ] }   // props sobrepõem defaults() do bloco
```

### 4.3 Contrato do bloco

```js
export default {
  type: 'benefits', label: 'Benefícios', icon: 'star', group: 'Listas',
  unique: false,                                   // true: no máximo um por brochura
  defaults: () => ({ title: 'Key benefits', items: [...] }),
  fields: [['title', 'Title']],                    // campos simples
  lists: { items: { min: 0, max: 8, one: 'Benefit', icon: true,
                    add: () => ({ icon: 'check', title: '…', desc: '…' }),
                    f: [['title', 'Title'], ['desc', 'Description', 'area', 2]] } },
  render: (props, ctx) => html,                    // ctx: { F(path,tag,style), cover, meta, ico(), flag() }
  split: (props, ctx) => [html, html]              // opcional
}
```

- `ctx.F(path, tag, style)` devolve o elemento editável com `data-b="<id>" data-f="<path>"`. Clicar nele abre o bloco na sidebar e foca o campo.
- Formulário, botões "Add"/"✕" e limites nascem de `fields` e `lists`.
- `blocks/index.js` expõe `get(type)` e `list()` (agrupado, para "Adicionar bloco").
- Previsto e **não implementado na v1**: `fullPage: true` (bloco que ocupa a página sozinho).

### 4.4 Catálogo

Implementados na v1 (necessários aos dois presets):

- `titleBanner`: bandeira (`flag`) + título e subtítulo lidos de `ctx.cover`. Edição leva aos campos da capa.
- `heading`: eyebrow + título + subtítulo.
- `narrative`: eyebrow, título, parágrafo de destaque opcional, 0–6 parágrafos.
- `overview`: título + texto multilinha (`unique`).
- `figures`: 2–6 pares label/valor; `theme` escuro ou claro; `layout` strip.
- `benefits`: 0–8 itens com ícone, título e descrição (descrição com clamp de 2 linhas).
- `options`: 0–8 itens com título, valor e descrição.
- `steps`: 0–8 etapas com título e descrição (duração opcional).
- `articles`: título opcional, 0–10 itens com título, resumo, URL e imagem.
- `sections`: 0–8 pares título + corpo.
- `pullQuote`: citação, autor, foto opcional, estilo `plain`, `boxed` ou `dark`.
- `pageBreak`.

Catálogo previsto, entra com o preset de cada template (campos confirmados nos relatórios de extração):

- `figures`: `layout` grid (label, valor, sub-nota) e list (cartões laterais); `theme` claro e escuro.
- `milestones`: fase, data, título, descrição, selo verde/âmbar/vermelho, 3–8 itens.
- `scheduleList`: linhas agrupadas por trimestre com mês, título, descrição, tipo e data.
- `dataTable`: estilos `simple`, `comparative`, `zebra`, `indicator`, `financial`; 3–6 colunas, 3–10 linhas; colunas com selo.
- `chart`: `line`, `area`, `multi`; 1–3 séries, 2–8 pontos; insight e fonte.
- `heroImage`: foto de largura total, rótulo, título.
- `profileCard`: foto, nome, 0–5 tags.
- `monthGrid`: 12 meses × 0–3 entradas + legenda (página inteira).
- `toc`: índice gerado dos `heading`.
- `note`: nota ou fonte pequena.

## 5. Montagem e paginação

`document.js` produz `[capa, ...páginas do corpo, contracapa]`. Cabeçalho corrente (`meta.headerLabel` + logos) e rodapé (`meta.footerLeft`, `meta.footerRight`, © `meta.year`, número de página automático a partir da capa) pertencem ao documento. Capa e contracapa não têm cabeçalho nem rodapé.

`paginate.js` (motor atual adaptado):

1. Percorre `state.blocks` na ordem e gera itens `{ id, html, split? }` via `render`.
2. `pageBreak` fecha a página atual e abre a seguinte.
3. Coloca os itens na página, mede `[data-body]` num contêiner oculto (`scrollHeight − clientHeight`). Se estoura (> 1 px), move o último bloco para a página seguinte.
4. Se um bloco sozinho não cabe e tem `split`, usa o `split`; se continua sem caber, registra aviso "bloco maior que a página".
5. A borda do último item vem de CSS (`.blk:last-child`).

Avisos: "bloco maior que a página" e "texto cortado por line-clamp". O chip do topo conta os avisos; clicar rola até o bloco e abre os campos dele.

## 6. Interface

- **Galeria**: miniatura da capa real (escala ~.25), tag "Draft saved"; templates sem preset aparecem como "Coming soon".
- **Estrutura**: lista de blocos (sem item de capa) com alça de arrastar (desktop), setas, duplicar e remover; "Adicionar bloco" agrupado por `group`; blocos `unique` já presentes somem do menu.
- **Formulário**: abre os campos do bloco selecionado; grupo "Cover" e "Document" (meta) no topo, fora da lista.
- **Palco**: páginas A4 (794×1123 px), chips de página com scroll sincronizado, "Fit width", zoom, clique no texto abre o bloco.
- **Topo**: voltar à galeria, seletor de template, chip de avisos, Reset (volta ao preset, com confirmação), Export PDF (`@page` 210×297 mm).
- Roteamento por hash: `#` galeria, `#factsheet`, `#quarterly-report`.

## 7. Presets da v1

**Factsheet** — cover: título em duas linhas, subtítulo, texto de apoio, imagem; `meta.footerRight` = "<título> — Factsheet". Blocos: `titleBanner`(flag) · `figures`(4, escuro) · `overview` · `benefits`(6) · `options`(4) · `steps`(6).

**Quarterly Report** — cover: trimestre, título em duas linhas, imagem; `meta.footerLeft` = "© <ano> Global Citizen Solutions", número de página automático à direita. Blocos: `narrative`("About this Report", 3 parágrafos) · `articles`(5) · `pageBreak` · `heading`("01 · Market Overview" / "Key Regulatory & Policy Developments") · `sections`(3) · `pullQuote`(boxed, autor Patricia Casaburi).

Conteúdo-padrão: o mesmo dos `defaults()` atuais.

### Diferenças conhecidas em relação aos templates atuais

- **Factsheet**: no original, `overview` e `benefits` dividem a mesma linha (4fr/6fr). Com blocos sequenciais, ficam um sobre o outro (equivale ao layout alternativo que o original já usa quando não cabe). Um bloco `row` pode devolver o lado a lado depois da v1.
- **Quarterly**: o rótulo por página no cabeçalho ("About this Report", "01 · Market Overview") passa a ser eyebrow/título do corpo; o cabeçalho corrente é um só.
- Páginas CTA/consultores e `coverSubtitle` do Quarterly seguem sem renderizar, como no original.

## 8. Testes

- **Node (`node --test`)**, sem dependências: `store` (criar, duplicar, remover, reordenar, limites min/max, salvar/carregar, descarte de chave `v3`), registro de blocos (todo bloco tem `type`, `label`, `defaults`, `render`) e presets (blocos válidos, `unique` respeitado).
- **Navegador, servidor local, Browser pane**: paginação com blocos longos, `pageBreak`, bloco maior que a página, `split`, clique abrindo o bloco certo, reload mantendo rascunho, troca rápida de template sem perder edição.
- **Paridade**: cada preset renderizado com conteúdo padrão e com todas as listas no máximo, comparado visualmente com o editor atual e com o `.dc.html` original.
- **Manual (não coberto)**: upload de imagem e diálogo de impressão.

## 9. Riscos

- Fidelidade visual dos presets (mitigada pela paridade acima e pelas diferenças documentadas).
- Combinações pouco harmoniosas de blocos: só aviso, sem bloqueio.
- Blocos pensados para página inteira (GIU Corporate, Calendar) exigem `fullPage`; ficam para a rodada dos presets correspondentes.
