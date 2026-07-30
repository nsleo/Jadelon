# Registro de Assets Publicos v0.1

## mapa-original-reference

- origem: `assets/reference/mapa-mundi-original.jpg`
- transformacao: referencia preservada; checksum validado antes da geracao de candidatos
- dimensoes: `2048 x 1536`
- formato: JPEG
- uso: autoridade visual da geografia conhecida
- limitacao: nao entra em runtime publico e nao possui separacao por camadas
- status: `reference`
- checksum: `24e4b52ba7625038ca5b6317076658fd`

## map-shell-background

- origem: `assets/reference/mapa-mundi-original.jpg`
- transformacao: derivado WebP otimizado a partir do original, sem limpeza cartografica nem remocao de labels rasterizados
- dimensoes: 2048 x 1536
- formato: WebP
- uso: fundo editorial principal do shell e preview cartografico amplo
- limitacao: ainda carrega labels rasterizados e nao representa separacao semantica por camadas
- status: `prototype`
- possibilidade de substituicao: sim, por versao limpa e preparada para a fase cartografica final

## map-shell-low

- origem: `assets/reference/mapa-mundi-original.jpg`
- transformacao: downscale para uso em composicoes secundarias e carregamento menos custoso
- dimensoes: 1280 x 960
- formato: WebP
- uso: recortes editoriais, superposicoes e fundos intermediarios
- limitacao: nao substitui textura final nem atlas 2D otimizado
- status: `prototype`
- possibilidade de substituicao: sim, por derivado limpo e semanticamente separado

## map-shell-initial

- origem: `assets/reference/mapa-mundi-original.jpg`
- transformacao: downscale com compressao controlada para carga inicial do shell
- dimensoes: 960 x 720
- formato: WebP
- uso: HeroGlobeSlot provisório e surfaces com prioridade de carregamento
- limitacao: ainda depende do mapa atual e nao valida leitura cartografica final
- status: `prototype`
- possibilidade de substituicao: sim, por versao refinada para a etapa de globo e shell final

## map-shell-thumbnail

- origem: `assets/reference/mapa-mundi-original.jpg`
- transformacao: miniatura WebP para listagens e usos de baixa densidade visual
- dimensoes: 640 x 480
- formato: WebP
- uso: previews compactos, navegação futura e apoio de revisão
- limitacao: nao deve ser tratada como asset cartografico principal
- status: `prototype`
- possibilidade de substituicao: sim, por thumbnail derivada da versao limpa oficial

## map-globe-prototype

- origem: `assets/reference/mapa-mundi-original.jpg`
- transformacao: composicao 2:1 em WebP com o mapa original redimensionado sem distorcao horizontal, centralizado sobre laterais oceanicas derivadas e suavizadas para teste esferico
- dimensoes: 2048 x 1024
- formato: WebP
- uso: textura esferica provisoria do prototipo de globo em React Three Fiber e fallback 2D coerente com o mesmo mapeamento
- limitacao: a metade posterior do globo e sintetizada por extensao oceanica; a emenda e aceitavel apenas para teste; polos e bordas laterais sofrem distorcao inevitavel; labels rasterizados continuam presentes
- status: `prototype`
- possibilidade de substituicao: sim, por textura equiretangular limpa e aprovada para producao
- compressao: WebP com qualidade 84
- emenda: laterais preenchidas por faixas derivadas e escurecidas para reduzir a ruptura visual na costura
- regiao mais afetada: faixa posterior oposta aos continentes principais e extremos horizontais do mapa original

## Candidatos cartograficos internos

Observacao: os assets abaixo existem para calibracao interna e auditoria cartografica. Eles nao foram adicionados ao `publicAssetRegistry` e nao podem ser usados por rotas publicas nesta fase.

Decisao tecnica registrada em `2026-07-29`:

- `P60` aprovado como `approved-candidate`
- `P60` aprovado como `approved-for-promotion`
- `P60` promovido em `2026-07-29`
- `P55` retido como `retained-as-fallback`
- `P55` marcado como `not-selected`
- `P65` retido como `retained-for-reference`
- `P65` marcado como `not-selected`
- nenhuma destas projecoes define latitude canonica ou geografia canonica
- `P60` representa apenas a decisao tecnica de projecao da V1
- fonte master oficial: `assets/reference/mapa-mundi-original-sem-labels.png`

## Assets promovidos para producao

### map-atlas-jadelon-v1

- origem: `assets/derived/cartography/candidates/mapa-atlas-clean-source-candidate.png`
- destino PNG: `assets/derived/cartography/approved/mapa-atlas-jadelon-v1.png`
- destino WebP: `public/assets/jadelon/maps/mapa-atlas-jadelon-v1.webp`
- checksum PNG: `8760144b11a3d01375786ac22128a8cb`
- checksum WebP: `4480122866e5740dba8bf95f0926e81b`
- dimensoes: `2048 x 1536`
- status: `production`
- fallback oficial: `sim`
- decisao tecnica: derivado 2D limpo oficial, promovido sem alterar a geografia canonica

### map-globe-jadelon-v1

- origem: `assets/derived/cartography/candidates/mapa-globo-projection-p60.png`
- destino PNG: `assets/derived/cartography/approved/mapa-globo-jadelon-v1.png`
- destino WebP: `public/assets/jadelon/maps/mapa-globo-jadelon-v1.webp`
- checksum PNG: `7ee69c9f192953313fe1ebde77892634`
- checksum WebP: `1af08e5b9e9c33435e8659b53a83ff92`
- dimensoes: `4096 x 2048`
- status: `production`
- fallback oficial relacionado: `map-atlas-jadelon-v1`
- decisao tecnica: projecao `P60` promovida para o runtime publico; nao representa latitude canonica

### overlay-semantic-jadelon-v1

- origem: `assets/derived/cartography/candidates/overlay-semantic-clean-source-candidate.json`
- destino derivado: `assets/derived/cartography/approved/overlay-semantic-jadelon-v1.json`
- destino publico: `public/assets/jadelon/maps/overlay-semantic-jadelon-v1.json`
- checksum: `6d1e8f2989eab669142d80b00d460372`
- dimensoes: `2048 x 1536` coordinate space
- status: `production`
- decisao tecnica: overlay semantico promovido sobre o atlas limpo oficial

### mapa-mundi-original-sem-labels

- origem: `assets/reference/mapa-mundi-original-sem-labels.png`
- checksum: `97599b21977841274bca0814455e575b`
- dimensoes: `2048 x 1536`
- formato: PNG
- peso: `4852090` bytes
- status: `reference-master`
- uso: autoridade visual para novos derivados cartograficos
- limitacao: nao entra diretamente no runtime publico

### candidatos historicos superseded

- `mapa-base-sem-labels-candidate`
- `mapa-atlas-2d-candidate`
- `mapa-globo-equirectangular-a`
- `mapa-globo-equirectangular-b`

Classificacao:

- status operacional: `superseded-by-clean-source-export`
- retencao: `historical-reference-only`
- uso permitido: auditoria e comparacao retrospectiva
- uso proibido: alimentar qualquer novo derivado da fase atual

### mapa-atlas-clean-source-candidate

- id: `mapa-atlas-clean-source-candidate`
- origem: `assets/reference/mapa-mundi-original-sem-labels.png`
- checksum PNG: `8760144b11a3d01375786ac22128a8cb`
- checksum WebP: `4480122866e5740dba8bf95f0926e81b`
- transformacao: derivado 2D limpo sem labels nem hotspots
- ferramenta: `sharp` via `scripts/generate-cartography.ts`
- dimensoes: `2048 x 1536`
- formato: PNG / WebP
- peso: `4932991` bytes PNG, `391132` bytes WebP
- status: `candidate`
- classificacao de producao: `awaiting-visual-approval`

### mapa-globo-projection-p55

- id: `mapa-globo-projection-p55`
- origem: `assets/reference/mapa-mundi-original-sem-labels.png`
- checksum PNG: `b6866ced3a1fe84592f9efdfdb8df6aa`
- checksum WebP: `03611e00850fda778cccc218f6048eaf`
- transformacao: redistribuicao conservadora do mapa limpo em textura `4096 x 2048`
- dimensoes: `4096 x 2048`
- formato: PNG / WebP
- peso: `4233447` bytes PNG, `189604` bytes WebP
- faixa tecnica: `+55 / -55`
- mapa projetado: `1669 x 1252`
- paddings: topo `398`, base `398`, esquerda `1214`, direita `1213`
- status: `candidate`
- decisao-v1: `retained-as-fallback`
- selecao: `not-selected`

### mapa-globo-projection-p60

- id: `mapa-globo-projection-p60`
- origem: `assets/reference/mapa-mundi-original-sem-labels.png`
- checksum PNG: `7ee69c9f192953313fe1ebde77892634`
- checksum WebP: `1af08e5b9e9c33435e8659b53a83ff92`
- transformacao: redistribuicao equilibrada do mapa limpo em textura `4096 x 2048`
- dimensoes: `4096 x 2048`
- formato: PNG / WebP
- peso: `4882503` bytes PNG, `216086` bytes WebP
- faixa tecnica: `+60 / -60`
- mapa projetado: `1820 x 1365`
- paddings: topo `342`, base `341`, esquerda `1138`, direita `1138`
- status: `candidate`
- decisao-v1: `approved-candidate`
- promocao: `approved-for-promotion`
- rollout: `promoted-to-map-globe-jadelon-v1`

### mapa-globo-projection-p65

- id: `mapa-globo-projection-p65`
- origem: `assets/reference/mapa-mundi-original-sem-labels.png`
- checksum PNG: `131b20fe6de00b3cb0b730d383f92728`
- checksum WebP: `fc23bdc2e66e0db0af10d5bcb6563bf0`
- transformacao: redistribuicao de maior presenca do mapa limpo em textura `4096 x 2048`
- dimensoes: `4096 x 2048`
- formato: PNG / WebP
- peso: `5568498` bytes PNG, `247706` bytes WebP
- faixa tecnica: `+65 / -65`
- mapa projetado: `1972 x 1479`
- paddings: topo `285`, base `284`, esquerda `1062`, direita `1062`
- status: `candidate`
- decisao-v1: `retained-for-reference`
- selecao: `not-selected`

### overlay-semantic-clean-source-candidate

- id: `overlay-semantic-clean-source-candidate`
- origem: shapes candidatas definidas em `src/lib/cartography/continent-shapes.ts`
- checksum: `6d1e8f2989eab669142d80b00d460372`
- transformacao: serializacao JSON das hit areas semanticas sobre a fonte limpa
- ferramenta: `scripts/generate-cartography.ts`
- dimensoes: `2048 x 1536` coordinate space
- formato: JSON
- peso: `17748` bytes
- status: `candidate`
- classificacao complementar: `semantic-hit-area`
- aprovacao visual: `not-approved`

### masks continentais candidatas

#### bergskrona-mask

- id: `bergskrona-mask`
- origem: segmentacao raster + shape candidata `continent-bergskrona`
- checksum: `e807a8b85eacf92d76d2ae882566dece`
- transformacao: recorte raster candidato derivado do master limpo
- ferramenta: `sharp` via `scripts/generate-cartography.ts`
- dimensoes: `2048 x 1536`
- formato: PNG / WebP
- peso: `19925` bytes PNG
- status: `candidate`
- classificacao complementar: `candidate-pixel-mask`

#### baaldrum-mask

- id: `baaldrum-mask`
- origem: segmentacao raster + shape candidata `continent-baaldrum`
- checksum: `140a986d3c4a4cb79e441579fd9483e5`
- transformacao: recorte raster candidato derivado do master limpo
- ferramenta: `sharp` via `scripts/generate-cartography.ts`
- dimensoes: `2048 x 1536`
- formato: PNG / WebP
- peso: `18219` bytes PNG
- status: `candidate`
- classificacao complementar: `candidate-pixel-mask`

#### snoklem-mask

- id: `snoklem-mask`
- origem: segmentacao raster + shape candidata `continent-snoklem`
- checksum: `810e742c0cb1480375f51db54364505d`
- transformacao: recorte raster candidato derivado do master limpo
- ferramenta: `sharp` via `scripts/generate-cartography.ts`
- dimensoes: `2048 x 1536`
- formato: PNG / WebP
- peso: `20761` bytes PNG
- status: `candidate`
- classificacao complementar: `candidate-pixel-mask`

#### cathizar-mask

- id: `cathizar-mask`
- origem: segmentacao raster + shape candidata `continent-cathizar`
- checksum: `6f4165b690b70ae3bdd89094e85bc87f`
- transformacao: recorte raster candidato derivado do master limpo
- ferramenta: `sharp` via `scripts/generate-cartography.ts`
- dimensoes: `2048 x 1536`
- formato: PNG / WebP
- peso: `20540` bytes PNG
- status: `candidate`
- classificacao complementar: `candidate-pixel-mask`

#### neverith-mask

- id: `neverith-mask`
- origem: segmentacao raster + shape candidata `continent-neverith`
- checksum: `e47423888a71df8c44f8255823be8139`
- transformacao: recorte raster candidato derivado do master limpo
- ferramenta: `sharp` via `scripts/generate-cartography.ts`
- dimensoes: `2048 x 1536`
- formato: PNG / WebP
- peso: `17012` bytes PNG
- status: `candidate`
- classificacao complementar: `candidate-pixel-mask`

#### xharas-tor-mask

- id: `xharas-tor-mask`
- origem: segmentacao raster + shape candidata `continent-xharas-tor`
- checksum: `398543b7607ac200d7b444bb7e4f6773`
- transformacao: recorte raster candidato derivado do master limpo
- ferramenta: `sharp` via `scripts/generate-cartography.ts`
- dimensoes: `2048 x 1536`
- formato: PNG / WebP
- peso: `17824` bytes PNG
- status: `candidate`
- classificacao complementar: `candidate-pixel-mask`

## Pacote de retoque manual v0.1

### mapa-original-lossless

- id: `mapa-original-lossless`
- origem: `assets/reference/mapa-mundi-original.jpg`
- transformacao: conversao lossless para PNG
- status: `manual-retouch-source`
- uso: base tecnica imutavel para retoque humano

### mapa-retouch-source

- id: `mapa-retouch-source`
- origem: `mapa-original-lossless.png`
- transformacao: copia exata sem blur, limpeza ou alteracao automatica
- status: `manual-retouch-source`
- uso: arquivo de trabalho a ser editado manualmente

### allowed-edit-mask

- id: `allowed-edit-mask`
- origem: derivacao tecnica das seis regioes de label
- transformacao: mascara binaria unica para restringir o retoque
- status: `manual-retouch-control`
- uso: delimitacao da area autorizada para edicao

### manual-retouch-approved-master

- id: `manual-retouch-approved-master`
- origem esperada: retorno manual validado
- caminho reservado: `assets/derived/cartography/manual-retouch/approved/mapa-base-clean-manual.png`
- status: `pending`
- uso futuro: master limpo para gerar producao cartografica
