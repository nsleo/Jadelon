# Jadelon — Estrategia de assets do mapa

Versao 0.1  
Status: diretriz tecnica ativa

## 1. Objetivo

Definir um pipeline nao destrutivo para transformar o mapa oficial atual em uma base adequada para:

- prototipo 2D;
- prototipo do globo 3D;
- textura equiretangular futura;
- hotspots semanticos;
- labels em UI;
- fallback sem WebGL.

## 2. Premissas

- `assets/reference/mapa-mundi-original.jpg` e o original preservado.
- O original nao deve ser sobrescrito.
- O mapa atual e suficiente para prototipos e insuficiente para a producao final premium.
- A geografia aprovada permanece ancorada no original mesmo quando surgirem derivados limpos.

## 3. Pipeline nao destrutivo

1. Preservar o original em `assets/reference/`.
2. Gerar derivados de prototipo em `assets/derived/prototype/`.
3. Gerar derivados de producao em `assets/derived/production/`.
4. Manter cada etapa com nome, data e finalidade explicita.
5. Nao substituir arquivos anteriores sem aprovacao editorial.

## 4. Assets derivados previstos

### Prototipo 2D

- `assets/derived/prototype/jadelon-map-2d-prototype.png`
- funcao: base visual para Atlas 2D com hotspots simples
- origem: export raster do original com normalizacao minima

### Prototipo equiretangular

- `assets/derived/prototype/jadelon-map-equirectangular-prototype.png`
- funcao: textura provisoria do globo em React Three Fiber
- origem: adaptacao controlada do original apenas para validar navegacao e costura

### Mascaras continentais

- `assets/derived/prototype/masks/baaldrum-mask.png`
- `assets/derived/prototype/masks/bergskrona-mask.png`
- `assets/derived/prototype/masks/cathizar-mask.png`
- `assets/derived/prototype/masks/neverith-mask.png`
- `assets/derived/prototype/masks/snoklem-mask.png`
- `assets/derived/prototype/masks/xharas-tor-mask.png`
- funcao: hit testing, destaque e interacao sem depender de labels rasterizados

### Producao final

- `assets/derived/production/jadelon-map-2d-clean.png`
- `assets/derived/production/jadelon-map-equirectangular-clean.png`
- `assets/derived/production/jadelon-map-label-free-master.tif`
- `assets/derived/production/overlays/jadelon-hotspots.json`

## 5. Versao 2D

A versao 2D final deve:

- remover labels rasterizados;
- manter o contorno geografico aprovado;
- suportar zoom controlado;
- separar geografia, relevo, labels e hotspots;
- permitir labels como UI e nao como pixels fixos.

## 6. Versao equiretangular

A textura futura do globo deve:

- usar projeção equiretangular explicita;
- tratar a emenda horizontal antes da aprovacao de producao;
- evitar texto embutido;
- preservar a leitura dos continentes em rotacao.

## 7. Hotspots e overlay semantico

Hotspots nao devem depender do JPG original.

Camadas previstas:

- geometria visual do mapa;
- mascara por continente;
- pontos semanticos em JSON;
- labels renderizados pela interface.

## 8. Labels em UI

Todos os nomes de continentes, regioes e landmarks devem migrar para a camada de interface.

Beneficios:

- melhor legibilidade;
- internacionalizacao futura;
- controle de hierarquia;
- ausencia de distorcao no globo.

## 9. Tratamento da emenda

O mapa atual nao nasce preparado para costura esferica. Antes da fase de globo final, a equipe deve aprovar:

- ponto de corte horizontal;
- continuidade de costa nas extremidades;
- compensacao de distorcao;
- teste visual de rotacao completa.

## 10. Fallback

Enquanto o globo 3D nao estiver carregado, indisponivel ou for desativado por capacidade do dispositivo:

- usar o mapa 2D derivado;
- manter hotspots equivalentes;
- manter a navegacao principal funcional.

## 11. Manual x automatizado

Processamento manual e preferivel quando:

- a limpeza exige criterio artistico;
- a emenda gera ambiguidades visuais;
- as mascaras exigem leitura fina do contorno.

Processamento automatizado e aceitavel quando:

- houver redimensionamento controlado;
- houver conversao previsivel de formato;
- os hotspots ja estiverem semanticamente mapeados.

## 12. Limitacoes atuais

- resolucao original limitada para hero premium;
- labels rasterizados embutidos;
- arte e geografia na mesma camada;
- costura esferica nao resolvida;
- sem mascaras prontas;
- sem overlay semantico separado.

## 13. Checklist antes da producao final

- original preservado em `assets/reference/`
- derivado limpo sem labels aprovado
- versao equiretangular aprovada
- mascaras continentais revisadas
- hotspots semanticos definidos
- labels migrados para UI
- fallback 2D alinhado ao globo
- teste de seam aprovado em rotacao completa
- nenhuma etapa destrutiva sobre o original

