# WealthPath — DESIGN.md

Design system: **"Fintech Confiante"** — moderno, com cor, sério mas vivo.
Escolhido a partir de `sketches/001-fintech-confiante/`. Este é o contrato de design; a implementação (globals.css + componentes) deve seguir estes tokens.

## Princípios
- Confiança financeira transmitida por verde/teal (dinheiro, crescimento, estabilidade).
- Insight de IA é o herói visual: card em verde gradiente, alto contraste.
- Cartões claros, sombras suaves, cantos generosos (16px). Muito respiro.
- Light mode como padrão. (Dark mode: fora do âmbito desta primeira iteração.)

## Paleta (hex de referência + oklch para tokens Tailwind v4)

| Papel | Hex | Uso |
|-------|-----|-----|
| Brand (primary) | `#0f9d76` | Cor principal, acentos, slider fill, gráfico "atual" |
| Brand 600 (hover/press) | `#0b7d5e` | Estados hover/active do primary |
| Brand tint | `#e3f4ee` | Fundos suaves, pills ativas, badges up |
| Accent (secundário) | `#1868e0` | Gráfico "base", links, acento frio |
| Accent tint | `#e5eefb` | Fundo suave do accent |
| Background | `#f4f7f6` | Fundo da app (levemente esverdeado) |
| Surface (card) | `#ffffff` | Cartões, superfícies elevadas |
| Ink (foreground) | `#0b2b26` | Texto principal (verde muito escuro) |
| Muted | `#5b6d69` | Texto secundário |
| Border | `#e3e9e7` | Bordas, separadores |
| Positivo (up) | `#0b7d5e` / bg `#e3f4ee` | Deltas positivos |
| Negativo (down) | `#c2410c` / bg `#fdece1` | Deltas negativos / alertas |

### Equivalentes oklch (para :root em globals.css, Tailwind v4)
```
--background: oklch(0.972 0.006 165);   /* #f4f7f6 */
--foreground: oklch(0.28 0.04 168);     /* #0b2b26 */
--card: oklch(1 0 0);
--card-foreground: oklch(0.28 0.04 168);
--primary: oklch(0.63 0.12 165);        /* #0f9d76 */
--primary-foreground: oklch(1 0 0);
--secondary: oklch(0.55 0.16 258);      /* #1868e0 accent */
--secondary-foreground: oklch(1 0 0);
--muted: oklch(0.95 0.008 165);
--muted-foreground: oklch(0.48 0.02 168); /* #5b6d69 */
--accent: oklch(0.93 0.03 165);         /* brand tint */
--accent-foreground: oklch(0.4 0.1 165);
--destructive: oklch(0.55 0.19 38);     /* #c2410c */
--border: oklch(0.92 0.006 165);        /* #e3e9e7 */
--input: oklch(0.92 0.006 165);
--ring: oklch(0.63 0.12 165);           /* primary */
--chart-1: oklch(0.63 0.12 165);        /* verde brand */
--chart-2: oklch(0.55 0.16 258);        /* azul accent */
--chart-3: oklch(0.7 0.1 190);
--chart-4: oklch(0.6 0.14 145);
--chart-5: oklch(0.5 0.08 210);
--radius: 1rem;                          /* 16px */
```
Nota: os valores oklch acima são aproximações da paleta hex — o implementador deve afiná-los para bater visualmente com a sketch, mantendo os hex como fonte de verdade.

## Tipografia
- Fonte: **Plus Jakarta Sans** (Google Font) para display e corpo. Substituir a Geist atual.
- Pesos: 400 / 500 / 600 / 700 / 800.
- H1 página: 28px, weight 800, letter-spacing -0.02em.
- Títulos de card: 16px, weight 700.
- Corpo: 14–15px, line-height 1.5–1.65.

## Formas & elevação
- Raio dos cards: 16px (`--radius: 1rem`). Botões/inputs: 12px.
- Sombra card: `0 1px 3px rgba(11,43,38,.06), 0 12px 32px -12px rgba(11,43,38,.12)`.
- Sliders: track 6px arredondado, fill verde (primary), thumb branco 22px com borda verde 3px e glow.

## Componentes-chave
- **Header/nav**: top-nav horizontal. Logo "W" em quadrado gradiente verde (`135deg,#0f9d76,#16c79a`). Pills de navegação; pill ativa com fundo brand-tint + texto brand-600. Avatar circular com gradiente azul.
- **Stat cards**: grelha 3 col. Label muted, valor grande (24px/800), delta pill (up verde / down laranja).
- **Chart card**: gráfico de linha; série "Atual" verde preenchida (área translúcida), série "Base" azul tracejada. Legenda com dots.
- **Card de IA (herói)**: fundo `linear-gradient(160deg,#0b7d5e,#0f9d76)`, texto branco, badge "gpt-oss" translúcido, botão branco com texto verde. Skeleton de loading translúcido.
- **Botões**: primary = fundo verde, texto branco; ghost = superfície com borda.

## Âmbito da implementação
Aplicar em: `globals.css` (tokens), `layout.tsx` (fonte + header/nav), e os componentes `SetupForm`, `ProjectionChart`, `ScenarioSliders`, `AIExplanation` e as páginas `/` e `/projection`. Manter shadcn/ui — apenas re-tematizar via tokens, não reescrever a lógica.

## Referência visual
`sketches/001-fintech-confiante/index.html` é a fonte de verdade visual. Abrir e igualar.
