# Handoff Promocao Assets P60 v0.1

Status: pronto para revisao humana  
Data: 2026-07-29  
Execucao: proibida nesta etapa

## 1. Objetivo da proxima fase

Promover de forma controlada o candidato `P60` para trilha de producao, sem perder rastreabilidade dos candidatos e sem misturar componente tecnico com experiencia publica antes da validacao final.

## 2. Escopo permitido da proxima fase

- promover o atlas 2D limpo para destino de producao
- promover a textura esferica `P60` para destino de producao
- promover o overlay semantico compativel com o atlas limpo
- atualizar o asset registry com os novos IDs publicos
- integrar posteriormente o carregador via `JadelonGlobeLoader`
- manter fallback 2D funcional

## 3. Escopo proibido nesta etapa de handoff

- alterar cartografia fonte
- reabrir a escolha entre `P55`, `P60` e `P65` sem gatilho formal
- integrar o globo diretamente na home sem a fase de promocao
- mover ou renomear candidatos nesta tarefa documental
- alterar conteudo editorial, mascaras ou UX publica como efeito colateral

## 4. Nomes e destinos previstos para assets de producao

Nomes previstos, sujeitos a confirmacao humana antes da execucao:

- `assets/derived/production/mapa-atlas-2d-v1.png`
- `public/assets/jadelon/maps/production/mapa-atlas-2d-v1.webp`
- `assets/derived/production/mapa-globo-p60-v1.png`
- `public/assets/jadelon/maps/production/mapa-globo-p60-v1.webp`
- `assets/derived/production/overlay-semantic-v1.json`
- `public/assets/jadelon/maps/production/overlay-semantic-v1.json`

Regra:

- os candidatos em `assets/derived/cartography/candidates/` e `public/assets/jadelon/maps/candidates/` devem ser preservados
- a promocao cria derivados finais, nao reaproveita staging por sobrescrita

## 5. Atualizacao do asset registry

Na promocao futura, o registro deve:

- manter a trilha historica de `P55`, `P60` e `P65`
- registrar `P60` como `production`
- manter `P55` como fallback interno
- manter `P65` como referencia comparativa
- registrar checksums, tamanhos e origem de cada asset promovido

## 6. Integracao posterior pelo JadelonGlobeLoader

A integracao posterior deve:

- consumir somente o asset promovido de producao
- manter o subsistema 3D isolado e carregado dinamicamente
- preservar fallback 2D quando WebGL falhar, estiver indisponivel ou for despriorizado em mobile
- impedir acesso acidental a candidatos historicos por rotas publicas

## 7. Requisitos de fallback 2D

- o fallback 2D deve usar asset promovido coerente com o atlas limpo
- a troca entre fallback e 3D nao deve expor assets de candidato
- o fallback nao deve depender de docs internas nem de assets secretos

## 8. Criterios de mobile

- primeira pintura legivel antes da inicializacao completa do globo
- textura promovida deve respeitar orcamento de rede e memoria mobile
- fallback 2D deve ser aceitavel como experiencia primaria em dispositivos limitados
- nao introduzir bloqueio de scroll ou interacao pesada no carregamento inicial

## 9. Loading progressivo

- shell primeiro
- fallback 2D depois
- globo 3D carregado sob demanda
- troca para `ready-3d` somente apos textura final confirmada
- sem atrasos artificiais para estados intermediarios

## 10. Criterios de rollback

Disparadores de rollback:

- checksum divergente do asset promovido
- regressao visual clara entre atlas e globo
- textura antiga persistindo no canvas apos swap
- falha mobile relevante
- quebra do fallback 2D

Procedimento:

- retirar o asset promovido do registro publico
- restaurar referencia anterior do loader
- manter `P60` candidato congelado intacto para diagnostico

## 11. Testes obrigatorios da proxima fase

- `npm run validate:content`
- `npm run generate:cartography` somente se a promocao gerar novos derivados
- `npm run validate:cartography`
- `npm run typecheck`
- `npm run lint`
- `npm run build`
- `npm run test:unit`
- `npx playwright test tests/e2e/cartography-review.spec.ts --project=desktop-chromium`
- `npm run test:e2e`

## 12. Limites entre componente tecnico e experiencia publica

- o componente tecnico pode operar com IDs, checksums, estados de swap e fallback
- a experiencia publica nao deve expor linguagem de laboratorio, candidatos ou nomes internos de projecao
- `P60` e uma decisao tecnica interna; a interface publica nao deve comunicar isso como lore ou canone
