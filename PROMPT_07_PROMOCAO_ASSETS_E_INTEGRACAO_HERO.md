# Prompt 07 - Promocao controlada dos assets P60 e integracao posterior do hero

O baseline cartografico da Fase 1 foi congelado em `2026-07-29`.

Estado aprovado:

- fonte master oficial: `assets/reference/mapa-mundi-original-sem-labels.png`
- atlas limpo candidato: `mapa-atlas-clean-source-candidate`
- projecao selecionada para V1: `mapa-globo-projection-p60`
- `P60`: `approved-candidate`, `approved-for-promotion`, `not-promoted`
- `P55`: `retained-as-fallback`, `not-selected`
- `P65`: `retained-for-reference`, `not-selected`

Este prompt serve apenas para a proxima etapa, apos revisao humana.

## Objetivo

Promover os assets P60 para a trilha de producao e iniciar a integracao controlada do globo no hero, preservando fallback 2D, isolamento do subsistema 3D e rastreabilidade dos candidatos.

## Restrições obrigatorias

- nao alterar o master cartografico
- nao reabrir a decisao entre `P55`, `P60` e `P65` sem evidência nova
- nao sobrescrever candidatos
- nao apagar `P55` nem `P65`
- nao expor nomes internos de projecao na UX publica
- nao importar docs internas em runtime
- nao usar assets secretos, historicos ou de auditoria privada no bundle publico

## Tarefas da proxima fase

1. Promover o atlas 2D limpo para destino de producao sem sobrescrever a trilha candidata.
2. Promover a textura esferica `P60` para destino de producao.
3. Promover o overlay semantico compativel com o atlas limpo.
4. Atualizar o asset registry com IDs publicos finais, checksums e origem dos assets promovidos.
5. Integrar o consumo via `JadelonGlobeLoader`, mantendo carregamento dinamico do 3D.
6. Preservar fallback 2D funcional para indisponibilidade de WebGL, mobile restrito ou degradacao controlada.
7. Ajustar criterios de carregamento progressivo no hero sem atraso artificial.
8. Validar responsividade, custo de carregamento e comportamento mobile.

## Destinos previstos

- `assets/derived/production/mapa-atlas-2d-v1.png`
- `public/assets/jadelon/maps/production/mapa-atlas-2d-v1.webp`
- `assets/derived/production/mapa-globo-p60-v1.png`
- `public/assets/jadelon/maps/production/mapa-globo-p60-v1.webp`
- `assets/derived/production/overlay-semantic-v1.json`
- `public/assets/jadelon/maps/production/overlay-semantic-v1.json`

## Testes obrigatorios

- `npm run validate:content`
- `npm run validate:cartography`
- `npm run typecheck`
- `npm run lint`
- `npm run build`
- `npm run test:unit`
- `npx playwright test tests/e2e/cartography-review.spec.ts --project=desktop-chromium`
- `npm run test:e2e`

## Critérios de aceite

- o hero usa somente assets promovidos
- o fallback 2D permanece coerente com a versao promovida
- nenhuma textura antiga permanece no canvas apos swap
- nenhuma rota publica referencia candidatos historicos
- mobile continua legivel e responsivo
- rollback e possivel sem reconstruir a base cartografica

## Critérios de rollback

- checksum divergente
- regressao visual relevante
- textura antiga ainda presente
- falha mobile
- quebra do fallback 2D

Se qualquer um destes pontos falhar, interromper a promocao e restaurar a referencia publica anterior.
