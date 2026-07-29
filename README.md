# Jadelon

Fundacao tecnica da V1 do Atlas de Jadelon.

## Stack escolhida

- Next.js 16.2.12
- React 19.2.8
- TypeScript 5.9.2
- Tailwind CSS 4.3.3
- Zod 4.4.3
- Playwright 1.62.0
- Node detectado: 24.18.0
- npm detectado: 11.16.0

## Direcao visual da fundacao

- display editorial: stack local `Iowan Old Style` → `Palatino Linotype` → `Book Antiqua`
- corpo e leitura longa: stack local `Baskerville` → `Iowan Old Style` → `Times New Roman`
- utilitario cartografico e coordenadas: stack local `Avenir Next` → `Helvetica Neue`

Funcoes:

- `Iowan Old Style` e `Palatino` sustentam monumentalidade editorial sem cair na solucao ornamental generica de fantasia.
- `Baskerville` preserva legibilidade para blocos longos e notas de worldbuilding publico.
- `Avenir Next` organiza labels, coordenadas e navegacao com contraste funcional.

Observacao:

- `next/font/google` foi evitado nesta fase porque o ambiente de build validado para a auditoria nao possui acesso de rede confiavel para buscar Google Fonts.

## Premissas desta fase

- `docs/active/` permanece como autoridade editorial.
- `src/content/` e a fonte operacional do runtime.
- `docs/reference/` e o export histórico não entram no bundle.
- o runtime não carrega caminhos internos de documentação editorial.
- o mapa original permanece preservado em `assets/reference/`.
- `public/assets/jadelon/` e o unico contrato de assets serviveis do runtime.
- o subsistema 3D sera isolado e adicionado na fase do prototipo do globo.

## Ambiente

- Node compativel com Next 16: `>=20.9.0`
- npm compativel para este ambiente validado: `>=10.0.0`
- Node validado localmente em 2026-07-28: `24.18.0`
- npm validado localmente em 2026-07-28: `11.16.0`
- `--webpack` permanece temporariamente nos scripts de `dev` e `build`

Motivo:

- o ambiente atual validou a fundação com estabilidade usando Webpack;
- o Turbopack fica como checkpoint futuro de reavaliação, não como decisão de stack desta fase.

## Scripts

- `npm run dev`
- `npm run build`
- `npm run lint`
- `npm run typecheck`
- `npm run validate:content`
- `npm run test:unit`
- `npm run test:e2e`
- `npm run test`
