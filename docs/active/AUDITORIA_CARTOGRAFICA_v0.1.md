# Auditoria Cartografica de Jadelon v0.1

Status: baseline tecnico encerrado para congelamento controlado  
Data: 2026-07-29  
Escopo: preparacao cartografica de candidatos, validacao tecnica e decisao de baseline sem promocao para producao

## 1. Preflight executado

- `AGENTS.md` lido em `jadelon_codex_inicio_v0.3/AGENTS.md`
- `docs/active/ESTRATEGIA_ASSETS_MAPA_v0.1.md` lido
- `docs/active/REGISTRO_ASSETS_v0.1.md` lido e atualizado nesta fase
- original preservado: `assets/reference/mapa-mundi-original.jpg`
- checksum MD5 do original: `24e4b52ba7625038ca5b6317076658fd`
- dimensoes do original: `2048 x 1536`
- formato do original: `JPEG`, `RGB`, `8 bits por amostra`, `3 canais`
- prototipo aprovado do globo inspecionado antes da preparacao de candidatos
- ferramentas utilizadas: `node`, `sharp`, `Next.js`, `Playwright`, `sips`, `md5`

## 2. Diagnostico do original

### Resolução, proporção e compressão

- resolucao base: `2048 x 1536`
- proporcao: `4:3`
- compressao: raster JPEG com pintura integrada e sem separacao por camadas
- profundidade de cor: `8-bit`

### Elementos embutidos no raster

- labels rasterizados coloridos e com contorno:
  - `Snøklem`
  - `Báaldrum`
  - `Bergskrona`
  - `Cathizar`
  - `Névérith`
  - `Xharas-Tor`
- relevo pintado embutido na mesma camada da geografia
- glow costeiro azul embutido
- vinheta atmosferica leve/moderada no oceano
- montanhas e textura de terreno sem separacao semantica

### Limites cartograficos detectados

- bordas laterais nao nascem prontas para costura esferica
- polos inexistem como representacao cartografica valida
- varias ilhas pequenas podem se perder em automacao agressiva
- remocao automatica de labels conflita com relevo e cor local
- a geografia continua legivel, mas nao tem rigor de projecao cientifica

## 3. Riscos tecnicos

- risco de emenda: alto nas extremidades horizontais do original
- risco nos polos: alto, porque o original nao fornece faixa polar dedicada
- distorcao esperada em equiretangular A: moderada, com mais oceano artificial e menos estresse no raster
- distorcao esperada em equiretangular B: moderada/alta, com melhor preenchimento e maior deformacao horizontal
- limitacao de vetorizacao: contornos insulares e enseadas finas nao sustentam vetorizacao automatica confiavel sem revisao humana
- limitacao da remocao automatica: a pintura por baixo dos labels nao existe separada; qualquer limpeza automatica precisa inferir fundo

## 4. Continentes e segmentacao candidata

| Continente | Area aproximada | Proximidade com outros continentes | Dificuldade de mascara | Labels sobrepostos | Risco de perda de relevo | Confianca da segmentacao |
| --- | --- | --- | --- | --- | --- | --- |
| Bergskrona | ~15.47% do mapa | Alta com Báaldrum ao norte imediato | Media | Sim, label grande sobre relevo verde | Medio | Medium |
| Báaldrum | ~8.23% do mapa | Alta com Snøklem e Bergskrona | Media/alta | Sim, label sobre massa escura e cordilheira proxima | Alto na faixa montanhosa sul | Medium |
| Snøklem | ~16.68% do mapa | Alta com Cathizar e Báaldrum | Alta | Sim, label sobre planicie clara e proximo de montanhas | Medio | Medium |
| Cathizar | ~18.62% do mapa | Media com Snøklem e Névérith por mar aberto | Media | Sim, label longo sobre massa ampla | Baixo/medio | Medium |
| Névérith | ~3.98% do mapa | Alta com arquipelagos e massa meridional abaixo | Alta | Sim, label atravessa cadeia insular | Alto em ilhas finas | Medium |
| Xharas-Tor | ~12.73% do mapa | Media com Névérith por mar e ilhas soltas | Alta | Sim, label claro sobre massa escura | Medio | Low |

Observacao: as areas acima sao estimativas geométricas da camada candidata para UI. Elas nao sao canonicas.

## 5. Fonte limpa validada

Fonte ativa desta fase:

- `assets/reference/mapa-mundi-original-sem-labels.png`
- formato: `PNG`
- dimensoes: `2048 x 1536`
- checksum: `97599b21977841274bca0814455e575b`
- origem editorial: exportacao limpa do arquivo-fonte original, sem labels rasterizados

Comparacao obrigatoria gerada:

- `artifacts/review/clean-export-vs-original.png`

Resultado tecnico:

- os seis antigos campos de labels apresentaram alteracao detectavel e passaram na heuristica de limpeza
- a divergencia fora das regioes de labels ficou em `3.34%`, mantendo aderencia geografica global
- costas, ilhas, relevo e brilho costeiro permanecem visualmente coerentes com o original de referencia

Conclusao: o mapa limpo passa a ser o master visual desta etapa. O kit de retoque manual fica como contingencia historica e deixa de ser a trilha principal.

## 6. Encerramento dos candidatos borrados

Assets encerrados para novos derivados:

- `mapa-base-sem-labels-candidate`
- `mapa-atlas-2d-candidate`
- `mapa-globo-equirectangular-a`
- `mapa-globo-equirectangular-b`

Classificacao documental:

- status operacional: `superseded-by-clean-source-export`
- retencao: `historical-reference-only`
- proibicao: nao podem alimentar mapa 2D, textura esferica, masks nem overlay desta fase

## 7. Mapa 2D limpo

Assets gerados:

- `assets/derived/cartography/candidates/mapa-atlas-clean-source-candidate.png`
- `public/assets/jadelon/maps/candidates/mapa-atlas-clean-source-candidate.webp`
- `artifacts/review/atlas-clean-source.png`

Estado atual:

- derivado diretamente do master limpo
- sem labels
- sem hotspots embutidos
- sem blur adicional
- sem projeção esferica
- status: `candidate`

## 8. Estrategia de projeção aplicada

Premissa adotada:

- o mapa conhecido do Atlas ocupa uma faixa segura dentro de uma textura `4096 x 2048`
- a geografia foi preservada como um unico conjunto
- nao houve deslocamento individual de continentes
- o entorno foi preenchido com oceano tecnico derivado da propria linguagem visual do mapa
- a traseira permanece majoritariamente oceanica e sem pretensao canonica

## 9. Candidatos equiretangulares

### P55

- asset: `mapa-globo-projection-p55`
- arquivos: `assets/derived/cartography/candidates/mapa-globo-projection-p55.png`, `public/assets/jadelon/maps/candidates/mapa-globo-projection-p55.webp`
- dimensoes: `4096 x 2048`
- faixa tecnica: `+55 / -55`
- escala aplicada: `0.8151`
- mapa projetado: `1669 x 1252`
- paddings: topo `398`, base `398`, esquerda `1214`, direita `1213`
- leitura: candidato mais conservador, com menor risco polar e maior vazio oceanico

### P60

- asset: `mapa-globo-projection-p60`
- arquivos: `assets/derived/cartography/candidates/mapa-globo-projection-p60.png`, `public/assets/jadelon/maps/candidates/mapa-globo-projection-p60.webp`
- dimensoes: `4096 x 2048`
- faixa tecnica: `+60 / -60`
- escala aplicada: `0.8887`
- mapa projetado: `1820 x 1365`
- paddings: topo `342`, base `341`, esquerda `1138`, direita `1138`
- leitura: equilibrio inicial mais forte entre presenca no hero e seguranca polar

### P65

- asset: `mapa-globo-projection-p65`
- arquivos: `assets/derived/cartography/candidates/mapa-globo-projection-p65.png`, `public/assets/jadelon/maps/candidates/mapa-globo-projection-p65.webp`
- dimensoes: `4096 x 2048`
- faixa tecnica: `+65 / -65`
- escala aplicada: `0.9629`
- mapa projetado: `1972 x 1479`
- paddings: topo `285`, base `284`, esquerda `1062`, direita `1062`
- leitura: maior presenca, mas com menor margem de seguranca nos extremos

## 10. Mascaras e overlay

Mascaras raster candidatas atualizadas:

- `bergskrona-mask.png` cobertura `15.27%`
- `baaldrum-mask.png` cobertura `8.13%`
- `snoklem-mask.png` cobertura `16.21%`
- `cathizar-mask.png` cobertura `18.54%`
- `neverith-mask.png` cobertura `3.99%`
- `xharas-tor-mask.png` cobertura `11.98%`

Observacao:

- as pixel masks agora partem da combinacao entre shape semantica e segmentacao raster do master limpo
- continuam `candidate`
- nao foram promovidas para producao

Overlay semantico atualizado:

- arquivo: `assets/derived/cartography/candidates/overlay-semantic-clean-source-candidate.json`
- source asset: `mapa-atlas-clean-source-candidate`
- uso: hover, clique, toque e acessibilidade em coordinate space `2048 x 1536`
- status: `candidate`
- latitude/longitude canonica: ausente por regra

## 11. Evidencias desta fase

- `artifacts/review/clean-export-vs-original.png`
- `artifacts/review/atlas-clean-source.png`
- `artifacts/review/new-continent-masks.png`
- `artifacts/review/globe-projection-side-by-side.png`
- `artifacts/review/globe-projection-backside.png`
- `artifacts/review/globe-projection-seams.png`

As evidencias especificas do globo em producao ficam a cargo do Playwright sobre a rota interna `/prototipos/cartografia`.

## 12. Veredito desta fase

- fonte limpa: validada e promovida a master visual
- candidatos borrados antigos: encerrados para novos derivados
- mapa 2D limpo: pronto como candidato
- projeção P55/P60/P65: gerada com faixa segura e oceano tecnico
- masks e overlay: atualizados a partir da fonte limpa
- aprovacao visual final: pendente
- integracao na home: proibida nesta etapa

## 13. Decisao tecnica de projecao V1

Decisao registrada em `2026-07-29`:

- `P60` aprovado como candidato selecionado da V1
- `P55` mantido como fallback conservador
- `P65` mantido apenas para referencia comparativa
- nenhuma das projecoes define latitude canonica, latitude oficial ou canone geografico
- `P60` e uma decisao tecnica de projecao para o runtime V1
- master oficial de origem: `assets/reference/mapa-mundi-original-sem-labels.png`
- backside majoritariamente oceanico permanece uma solucao tecnica da V1
- integracao na home ainda nao foi iniciada

## 14. Evidencias finais preservadas para o baseline

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
- `artifacts/review/cartography-generation-report.json`

Arquivos removidos da trilha de baseline:

- capturas antigas invalidadas
- comparativos pre-limpeza nao finais
- videos `page@*.webm`
- resultados temporarios de build e teste
- artefatos `._*`
