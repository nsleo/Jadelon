# Baseline Cartografica P60 v0.1

Status: aprovado para congelamento tecnico  
Data da decisao: 2026-07-29  
Escopo: baseline tecnico da etapa cartografica, sem promocao de assets e sem integracao na home

## 1. Estado aprovado

- fonte master oficial: `assets/reference/mapa-mundi-original-sem-labels.png`
- atlas 2D ativo da etapa: `assets/derived/cartography/candidates/mapa-atlas-clean-source-candidate.png`
- projecao selecionada: `mapa-globo-projection-p60`
- estado de P60: `approved-candidate`
- estado de promocao de P60: `approved-for-promotion`
- rollout de P60: `not-promoted`
- estado de P55: `retained-as-fallback`, `not-selected`
- estado de P65: `retained-for-reference`, `not-selected`
- integracao na home: `not-started`
- backside oceanico: mantido como solucao tecnica da V1

## 2. Fonte master e candidatos congelados

### Fonte master

- arquivo: `assets/reference/mapa-mundi-original-sem-labels.png`
- checksum MD5: `97599b21977841274bca0814455e575b`
- dimensoes: `2048 x 1536`
- tamanho: `4852090` bytes

### Atlas 2D limpo candidato

- arquivo PNG: `assets/derived/cartography/candidates/mapa-atlas-clean-source-candidate.png`
- checksum MD5 PNG: `8760144b11a3d01375786ac22128a8cb`
- tamanho PNG: `4932991` bytes
- arquivo WebP: `public/assets/jadelon/maps/candidates/mapa-atlas-clean-source-candidate.webp`
- checksum MD5 WebP: `4480122866e5740dba8bf95f0926e81b`
- tamanho WebP: `391132` bytes

### Projecao P55

- arquivo PNG: `assets/derived/cartography/candidates/mapa-globo-projection-p55.png`
- checksum MD5 PNG: `b6866ced3a1fe84592f9efdfdb8df6aa`
- tamanho PNG: `4233447` bytes
- arquivo WebP: `public/assets/jadelon/maps/candidates/mapa-globo-projection-p55.webp`
- checksum MD5 WebP: `03611e00850fda778cccc218f6048eaf`
- tamanho WebP: `189604` bytes
- classificacao: `retained-as-fallback`

### Projecao P60

- arquivo PNG: `assets/derived/cartography/candidates/mapa-globo-projection-p60.png`
- checksum MD5 PNG: `7ee69c9f192953313fe1ebde77892634`
- tamanho PNG: `4882503` bytes
- arquivo WebP: `public/assets/jadelon/maps/candidates/mapa-globo-projection-p60.webp`
- checksum MD5 WebP: `1af08e5b9e9c33435e8659b53a83ff92`
- tamanho WebP: `216086` bytes
- classificacao: `approved-candidate`
- promocao futura: `approved-for-promotion`

### Projecao P65

- arquivo PNG: `assets/derived/cartography/candidates/mapa-globo-projection-p65.png`
- checksum MD5 PNG: `131b20fe6de00b3cb0b730d383f92728`
- tamanho PNG: `5568498` bytes
- arquivo WebP: `public/assets/jadelon/maps/candidates/mapa-globo-projection-p65.webp`
- checksum MD5 WebP: `fc23bdc2e66e0db0af10d5bcb6563bf0`
- tamanho WebP: `247706` bytes
- classificacao: `retained-for-reference`

### Overlay semantico limpo

- arquivo: `assets/derived/cartography/candidates/overlay-semantic-clean-source-candidate.json`
- checksum MD5: `6d1e8f2989eab669142d80b00d460372`
- tamanho: `17748` bytes
- estado: `candidate`

## 3. Testes e validacoes executados nesta baseline

Gates obrigatorios desta etapa:

- `npm run validate:content`
- `npm run generate:cartography`
- `npm run validate:cartography`
- `npm run typecheck`
- `npm run lint`
- `npm run build`
- `npm run test:unit`
- `npm run test:e2e`

Resultado esperado do E2E de baseline:

- `34 passed`
- `6 skipped`

Teste cartografico critico desta decisao:

- troca real `P55 -> P60 -> P65 -> P55`
- confirmacao de `ready-3d` em cada troca
- confirmacao de `asset ID`, URL e checksum finais
- textura aplicada no canvas
- ausencia do asset anterior apos cada swap

## 4. Evidencias finais preservadas

- `artifacts/review/cartography-generation-report.json`
- `artifacts/review/clean-export-vs-original.png`
- `artifacts/review/atlas-clean-source.png`
- `artifacts/review/new-continent-masks.png`
- `artifacts/review/projection-p55-front-clean-final.png`
- `artifacts/review/projection-p55-north-clean-final.png`
- `artifacts/review/projection-p55-south-clean-final.png`
- `artifacts/review/projection-p60-front-clean-final.png`
- `artifacts/review/projection-p60-north-clean-final.png`
- `artifacts/review/projection-p60-south-clean-final.png`
- `artifacts/review/projection-p65-front-clean-final.png`
- `artifacts/review/projection-p65-north-clean-final.png`
- `artifacts/review/projection-p65-south-clean-final.png`
- `artifacts/review/projection-clean-side-by-side-final.png`
- `artifacts/review/projection-clean-backside-final.png`
- `artifacts/review/projection-clean-seams-final.png`
- `artifacts/review/projection-texture-identities-final.png`
- `artifacts/review/projection-p55-p60-p65-comparison-final.webm`
- `artifacts/review/globe-3d-desktop-final.png`
- `artifacts/review/globe-3d-mobile-final.png`
- `artifacts/review/globe-2d-fallback-final.png`
- `artifacts/review/globe-interaction-demo-final.webm`

## 5. Limitacoes conhecidas

- a backside do globo permanece majoritariamente oceanica e nao representa canone geografico
- a textura equiretangular resolve apresentacao tecnica, nao latitude canonica
- nao ha separacao por camadas semanticas de relevo no raster
- masks e overlay continuam candidatos, ainda nao promovidos para producao
- a integracao publica no hero nao foi iniciada

## 6. Itens explicitamente fora do canone

- faixa `+55 / -55`, `+60 / -60` e `+65 / -65`
- paddings tecnicos da textura `4096 x 2048`
- distribuicao oceanica traseira
- qualquer inferencia de latitude oficial, hemisferio oficial ou escala canonica a partir da projecao

## 7. Proximos passos permitidos

- promocao controlada do P60 para assets de producao
- atualizacao do registro publico de assets com destinos finais
- integracao posterior via `JadelonGlobeLoader`
- manutencao do fallback 2D
- validacao mobile da experiencia publica

## 8. Condicoes que reabrem esta decisao

- troca da fonte master cartografica
- nova projecao que substitua P60
- falha reproduzivel na costura, backside ou textura aplicada
- regressao dos checksums aprovados
- necessidade editorial de redefinir distribuicao continental ou polos
