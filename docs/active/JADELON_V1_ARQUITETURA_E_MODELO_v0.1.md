# Jadelon — Arquitetura da V1 e modelo de conteúdo
Versão 0.1

## 1. Objetivo da V1

Criar uma experiência digital interativa que funcione como um Atlas mágico de Jadelon.

A V1 deve:

- apresentar o mundo sem depender de uma trama linear;
- permitir exploração geográfica e histórica;
- destacar Ilddrage e Helgor;
- apresentar os Seis pela perspectiva dos povos;
- explicar a magia pública sem revelar a cosmologia secreta;
- oferecer um primeiro registro anômalo através de Helix Daggry;
- preservar lacunas, dúvidas e contradições como estados editoriais claros;
- não virar uma wiki genérica ou um catálogo de RPG.

---

# 2. Princípios de produto

## 2.1 O Atlas é uma lente

O site não é a verdade absoluta de Jadelon.

Ele apresenta:

- registros;
- crenças;
- versões históricas;
- interpretações;
- lacunas;
- documentos;
- anomalias.

## 2.2 A home é atemporal

A home não representa um ano específico.

Ela apresenta o mundo de cima, conectando:

- eras;
- lugares;
- figuras;
- religiões;
- magia;
- registros.

## 2.3 O desconhecido não é um menu

A parte anômala deve ser encontrada.

Não haverá item de navegação chamado:

- Desconhecido;
- Isso;
- Originários;
- Segredos;
- Plot oculto.

## 2.4 Conteúdo antes de espetáculo

Toda interação deve ajudar a:

- entender;
- explorar;
- relacionar;
- lembrar;
- sentir o universo.

Efeitos não podem existir apenas para parecer avançados.

---

# 3. Navegação principal

## Menu global

- Atlas
- Cronologia
- Figuras
- Eternos
- Magia
- Registros

## Navegação secundária

- Continuar exploração
- Rastro da expedição
- Busca
- Índice do Atlas

## O que não aparece no menu

- Helix Daggry diretamente;
- cosmologia secreta;
- entidades acima dos Eternos;
- materiais e raças como enciclopédias;
- páginas vazias;
- conteúdo ainda não aprovado.

---

# 4. Estrutura de rotas

## Rotas principais

```text
/
├── /atlas
├── /cronologia
├── /figuras
├── /figuras/ilddrage
├── /figuras/helgor
├── /eternos
├── /eternos/abre-sol
├── /eternos/forja-veus
├── /eternos/polaris-erte
├── /eternos/consome-lampejo
├── /eternos/hva-sanden-laget
├── /eternos/deus-do-oculto
├── /magia
├── /registros
└── /registros/[slug]
```

## Rotas geográficas

```text
/atlas/bergskrona
/atlas/baaldrum
/atlas/snøklem
/atlas/cathizar
/atlas/neverith
/atlas/xharas-tor
```

## Rotas aprofundadas da V1

```text
/atlas/baaldrum/guerra-das-fendas
/atlas/snøklem/brannslott
/registros/helix-daggry
```

## Rotas dinâmicas futuras

```text
/atlas/[continente]/[local]
/cronologia/[evento]
/figuras/[personagem]
/organizacoes/[organizacao]
/registros/[registro]
```

A V1 pode usar uma mistura de rotas explícitas e dinâmicas, desde que o conteúdo seja governado por um único modelo de dados.

---

# 5. Arquitetura da home

## 0. Loading ritualístico

### Função

- carregar assets reais;
- introduzir a linguagem do Atlas;
- criar impacto;
- esconder a inicialização do globo.

### Texto principal

> Restaurando o Atlas

### Comportamento

- progresso real;
- linhas cartográficas;
- runas discretas;
- reconstrução de continentes;
- pequena interferência perto do final;
- botão para pular em visitas futuras.

---

## 1. Hero — globo 3D

### Conteúdo

- planeta Jadelon;
- rotação por mouse e toque;
- zoom controlado;
- hotspots dos seis continentes;
- nome do continente ao aproximar;
- CTA para abrir o Atlas completo.

### Ambiente

Mistura de:

- espaço mágico abstrato;
- mesa cartográfica impossível;
- partículas discretas;
- anéis, linhas e coordenadas;
- iluminação ritualística.

### Regras

- não parecer holograma futurista;
- não usar glitch RGB;
- não exagerar em partículas;
- possuir fallback 2D;
- reduzir efeitos em dispositivos fracos.

---

## 2. Introdução ao universo

### Objetivo

Explicar Jadelon em poucos segundos.

### Conteúdo

- o mundo;
- seus continentes;
- suas eras;
- magia;
- religião;
- registros conhecidos e incompletos.

### Copy-base

> Jadelon é um mundo moldado por eras, crenças e forças que seus povos aprenderam a nomear — mesmo quando não compreendem aquilo que observam.

A copy permanece editorial até revisão final.

---

## 3. Atlas 2D resumido

### Recursos

- mapa navegável;
- seleção de continentes;
- cards resumidos;
- ligações com Eternos, eventos e personagens;
- botão para abrir Atlas completo.

### Camadas da home

- continentes;
- locais principais;
- eventos em destaque.

Camadas complexas ficam no Atlas completo.

---

## 4. Cronologia resumida

### Marcos

- Marco 0;
- Era Adaptativa e Construtiva;
- Primeira Guerra;
- Era das Trevas;
- Era Política;
- Segunda Era.

### Evento em destaque

- Guerra das Fendas.

### Regra

Períodos sem conteúdo recebem:

> Registros deste período permanecem incompletos.

---

## 5. Ilddrage e Helgor

### Estrutura

Dois blocos que se relacionam visualmente sem afirmar relação canônica.

### Ilddrage

- Aspecto do Poder;
- presença estável;
- fogo negro controlado;
- proteção, poder e fragilidade.

### Helgor

- Exilado dos Deuses;
- presença tensionada;
- disciplina e ruptura;
- submissão, hierarquia e ressentimento.

### Eixos aprovados

> A fragilidade não deveria condenar ninguém.

> Nenhum poder deveria exigir submissão.

---

## 6. Os Seis

### Exibição

- seis símbolos ou manifestações;
- nome mais usado;
- continente associado;
- domínio religioso;
- texto curto na perspectiva dos povos.

### Regra

Nunca apresentar como ficha objetiva de personalidade divina.

---

## 7. Magia, o Véu e os limites do conhecimento

### Fluxo público

```text
Fluxo Arcano
→ Núcleo Arcano
→ manifestação
```

### Classificação

```text
Fonte
→ Escola
→ Arquétipo
```

### Véu

Apresentado como:

- teoria;
- limite;
- objeto de pesquisa;
- tema restrito;
- possível fonte de risco.

Sem revelar a verdade cosmológica.

---

## 8. Registros em destaque

### Cards iniciais

- Guerra das Fendas;
- Brannslott;
- Arcantheon;
- Helix Daggry, apenas quando desbloqueado ou descoberto.

### Fechamento

A home termina convidando à exploração, não com CTA comercial.

---

# 6. Atlas completo

## 6.1 Objetivo

Permitir exploração espacial e relacional.

## 6.2 Camadas

### V1

- Continentes
- Locais
- Reinos e territórios
- Eventos
- Personagens relacionados
- Eternos associados
- Registros

### Futuro

- Fronteiras por era
- Rotas
- Biomas
- Recursos
- Criaturas
- Povos
- Anomalias
- Camadas políticas comparativas

## 6.3 Interações

- pan;
- zoom;
- seleção;
- painel lateral;
- filtros;
- destaque de relações;
- alternância de período;
- links profundos;
- retorno ao ponto anterior.

## 6.4 Estados de registro

- Confirmado
- Relatado
- Incompleto
- Contestável
- Restrito
- Anômalo

Esses estados são editoriais do Atlas e não equivalem automaticamente ao cânone.

---

# 7. Cronologia completa

## 7.1 Modos

### Visão por era

- estrutura principal;
- acontecimentos;
- registros associados.

### Visão regional

- eventos filtrados por continente.

### Visão de personagem

- acontecimentos ligados a uma figura.

## 7.2 Eventos da V1

- Marco 0 / Criação;
- Primeira Guerra como período sem detalhes;
- Guerra das Fendas;
- fundação antiga de Brannslott sem data;
- expedição de Helix sem data.

## 7.3 Eventos sem data

Devem aparecer numa área própria:

> Registros sem posição cronológica confirmada

Isso evita inventar datas.

---

# 8. Inventário de entidades da V1

## 8.1 Continentes — páginas completas

1. Bergskrona
2. Báaldrum
3. Snøklem
4. Cathizar
5. Névérith
6. Xharas-Tor

## 8.2 Protagonistas — páginas completas

1. Ilddrage
2. Helgor

## 8.3 Eternos — páginas completas

1. Abre-Sol
2. Forja-Véus
3. Polaris Erte
4. Consome-Lampejo
5. Hva Sanden Laget
6. Deus do Oculto

## 8.4 Conceitos — páginas completas

1. Magia
2. Véu da Existência, como seção da página de Magia
3. Arcantheon, como seção própria ou registro relacionado
4. Os Seis, como índice religioso

## 8.5 Eventos — página completa

1. Guerra das Fendas

## 8.6 Registros anômalos — página completa

1. Helix Daggry e os Pilares do Vazio

## 8.7 Registros resumidos

### Figuras

- Havd Brannslott
- Zan-Hau
- Haldor Dregarr
- Pérdicos
- Lyara
- Morvain
- Ethel
- Kargus
- Thror Berrakar
- Cassius Aurum
- Kaelra Fyrn

### Organizações

- Arcantheon
- Conselho Arcano
- G.O.E.M.
- Casa Dregarr
- Legião Cinzenta
- Clãs de Pedra
- Clã Sangue de Ferro
- Casa Aurum
- Tribos de Fogo

### Báaldrum

- Dregarria
- Thrag-Vhurr
- R’Ghalara
- Valtheris
- Fyrlund
- Vyrkahl
- Frilvik
- Lavamyr
- Glaskald
- Bryndahl
- Kurn Valgar

### Snøklem

- Brannslott
- Castelo de Brannslott
- cidade-fortaleza de Brannslott
- Aetheris
- Frostheim
- Arkskaald
- Frostrøk
- Ismyrka
- Brannsvidd

### Recursos mínimos

- Gelo Eterno
- Gelo Eterno Sombrio
- Sopro de Varme

## 8.8 Não entra como índice na V1

- raças;
- criaturas;
- materiais gerais;
- armas;
- semi-deuses;
- colossos;
- Virtuosos de Guerra;
- Evighet;
- cosmologia secreta.

---

# 9. Modelo editorial

## 9.1 Status de cânone

```ts
type CanonStatus =
  | "approved"
  | "source-recorded"
  | "editorial-interpretation"
  | "provisional"
  | "conflict"
  | "secret"
  | "excluded-v1";
```

## 9.2 Visibilidade

```ts
type Visibility =
  | "public"
  | "discoverable"
  | "restricted"
  | "hidden"
  | "internal";
```

## 9.3 Estado do registro no Atlas

```ts
type RecordState =
  | "confirmed"
  | "reported"
  | "incomplete"
  | "contested"
  | "restricted"
  | "anomalous";
```

## 9.4 Tipos de entidade

```ts
type EntityType =
  | "world"
  | "continent"
  | "region"
  | "kingdom"
  | "city"
  | "landmark"
  | "character"
  | "deity"
  | "event"
  | "era"
  | "organization"
  | "concept"
  | "record"
  | "resource";
```

---

# 10. Modelo base de entidade

```ts
interface JadelonEntity {
  id: string;
  type: EntityType;
  slug: string;
  name: string;

  title?: string;
  subtitle?: string;
  summary: string;
  content?: string;

  canonStatus: CanonStatus;
  visibility: Visibility;
  recordState: RecordState;

  temporal?: {
    eraIds?: string[];
    yearStart?: number;
    yearEnd?: number;
    isUndated?: boolean;
    temporalNote?: string;
  };

  geography?: {
    continentId?: string;
    parentPlaceId?: string;
    mapPoint?: {
      x: number;
      y: number;
    };
    globePoint?: {
      latitude: number;
      longitude: number;
    };
  };

  relations?: EntityRelation[];

  media?: {
    hero?: string;
    gallery?: string[];
    symbol?: string;
    mapTexture?: string;
  };

  source?: {
    document?: string;
    section?: string;
    notes?: string;
  };

  tags?: string[];
}
```

## Relações

```ts
interface EntityRelation {
  targetId: string;
  type:
    | "located-in"
    | "ruled-by"
    | "founded-by"
    | "associated-with"
    | "participated-in"
    | "worships"
    | "opposes"
    | "member-of"
    | "related-record"
    | "uses-resource";
  label?: string;
  canonStatus?: CanonStatus;
}
```

---

# 11. Estrutura de conteúdo sugerida

```text
/content
├── world
│   └── jadelon.mdx
├── eras
├── continents
├── locations
├── characters
├── deities
├── events
├── organizations
├── concepts
├── records
└── resources
```

Cada entidade deve ter:

- conteúdo em MDX;
- metadados estruturados;
- relações por ID;
- status de cânone;
- visibilidade;
- estado editorial.

A interface não deve inferir fatos a partir do texto. Relações importantes devem estar explícitas nos dados.

---

# 12. Estrutura técnica sugerida

## Front-end

- Next.js
- TypeScript
- Tailwind CSS
- Motion
- Three.js com React Three Fiber para o globo
- MDX para páginas editoriais
- Zod para validação dos dados

## Regras

- versões resolvidas no início da implementação;
- consultar documentação atualizada pelo Context7;
- evitar dependências desnecessárias;
- conteúdo deve continuar acessível sem WebGL;
- nenhuma experiência central depende exclusivamente de animação;
- mobile é parte da experiência, não fallback abandonado.

---

# 13. Memória local da exploração

A V1 pode usar armazenamento local para:

- páginas visitadas;
- continentes explorados;
- registros descobertos;
- exposição ao conteúdo anômalo;
- última rota;
- preferência de reduzir efeitos;
- loading já assistido.

## Níveis internos de exposição

```ts
type ExposureLevel =
  | 0 // estável
  | 1 // interferência
  | 2 // contaminação
  | 3 // reconhecimento
  | 4; // ruptura
```

Esse sistema é exclusivo do site e não é cânone.

Helix pode elevar o nível de exposição localmente.

---

# 14. Regras do registro de Helix

- não aparece como item principal do menu;
- pode ser encontrado no Atlas ou em registros relacionados;
- começa como relato de expedição;
- degrada progressivamente;
- termina no barco e no silêncio;
- não nomeia Isso;
- não revela O Desconhecido;
- não explica o Véu;
- não confirma a participação de Ilddrage;
- não transforma terror em glitch digital genérico;
- deve respeitar redução de movimento e segurança visual.

---

# 15. Critérios de aceite

## Conteúdo

- nenhuma informação secreta vazada;
- nenhuma lacuna preenchida por invenção;
- crença religiosa não apresentada como fato objetivo;
- conflitos documentais sinalizados;
- personagens e lugares relacionados corretamente.

## UX

- visitante entende Jadelon em poucos segundos;
- globo e mapa possuem função real;
- navegação funciona sem depender do menu;
- mobile preserva impacto;
- textos continuam legíveis;
- usuário sempre consegue retornar.

## Visual

- não parece template;
- não parece dashboard;
- não parece wiki padrão;
- não parece holograma sci-fi;
- não usa glitch RGB como linguagem principal;
- conhecido e desconhecido possuem gramáticas visuais distintas.

## Técnica

- fallback sem WebGL;
- loading baseado em progresso real;
- acessibilidade mínima;
- redução de movimento;
- assets otimizados;
- rotas estáveis;
- dados validados;
- Playwright em desktop e mobile.

---

# 16. Próximo passo

Criar o `AGENTS.md` específico de Jadelon com:

- hierarquia de fontes;
- regras de cânone;
- escopo da V1;
- direção visual;
- arquitetura;
- proibições;
- critérios de aceite;
- fluxo de trabalho para o Codex.

Depois disso, criar o prompt inicial do Codex para:

1. auditar o repositório;
2. instalar a base;
3. organizar o conteúdo;
4. implementar o shell da home;
5. prototipar loading e globo;
6. validar antes de aprofundar páginas.
