import type { BaseEntity } from "../../types/content.ts";

export const publicEntities: BaseEntity[] = [
  {
    id: "world-jadelon",
    type: "world",
    slug: "jadelon",
    name: "Jadelon",
    title: "Jadelon",
    subtitle: "Mundo",
    summary:
      "Mundo observado pelo Atlas por geografia, eras, figuras e registros sem afirmar um presente único.",
    body: "A V1 apresenta Jadelon como um mundo cartográfico e narrativo, observado a partir de registros amplos e atemporais.",
    canonStatus: "approved",
    visibility: "public",
    recordState: "confirmed",
    relations: [
      { type: "contains", targetId: "continent-bergskrona" },
      { type: "contains", targetId: "continent-baaldrum" },
      { type: "contains", targetId: "continent-snoklem" },
      { type: "contains", targetId: "continent-cathizar" },
      { type: "contains", targetId: "continent-neverith" },
      { type: "contains", targetId: "continent-xharas-tor" },
      { type: "contains", targetId: "era-primeira-era" },
    ],
    media: [
      {
        kind: "map",
        assetId: "map-shell-background",
        alt: "Derivado cartografico de prototipo do mapa de Jadelon usado como base visual provisoria.",
      },
    ],
    sources: [
      {
        id: "base-consolidada-v1",
        kind: "editorial",
        label: "Base consolidada da V1",
        authority: "active-docs",
        note: "Visão geral da V1.",
      },
      {
        id: "documento-mestre",
        kind: "reference",
        label: "Documento mestre de produto e experiência",
        authority: "reference-docs",
      },
    ],
    tags: ["atlas", "mundo", "v1"],
  },
  {
    id: "era-primeira-era",
    type: "era",
    slug: "primeira-era",
    name: "Primeira Era",
    title: "Primeira Era",
    summary:
      "Faixa temporal pública de 0 a 8.000, contendo períodos que estruturam a cronologia ampla da V1.",
    canonStatus: "approved",
    visibility: "public",
    recordState: "confirmed",
    temporal: {
      yearStart: 0,
      yearEnd: 8000,
    },
    relations: [
      { type: "contains", targetId: "era-politica" },
    ],
    media: [],
    sources: [
      {
        id: "base-consolidada-v1",
        kind: "editorial",
        label: "Base consolidada da V1",
        authority: "active-docs",
        note: "Cronologia pública.",
      },
    ],
    tags: ["cronologia", "era"],
  },
  {
    id: "era-politica",
    type: "era",
    slug: "era-politica",
    name: "Era Política",
    title: "Era Política",
    summary:
      "Subperíodo da Primeira Era que recebe destaque na V1 sem exigir expansão artificial de eventos ausentes.",
    canonStatus: "approved",
    visibility: "public",
    recordState: "confirmed",
    temporal: {
      eraIds: ["era-primeira-era"],
      yearStart: 6000,
      yearEnd: 8000,
    },
    relations: [
      { type: "part-of", targetId: "era-primeira-era" },
    ],
    media: [],
    sources: [
      {
        id: "base-consolidada-v1",
        kind: "editorial",
        label: "Base consolidada da V1",
        authority: "active-docs",
        note: "Subdivisão da Primeira Era.",
      },
    ],
    tags: ["cronologia", "era"],
  },
  {
    id: "continent-baaldrum",
    type: "continent",
    slug: "baaldrum",
    name: "Báaldrum",
    title: "Báaldrum",
    subtitle: "Continente",
    summary:
      "Continente de fendas, vulcões e regiões congeladas, unificado politicamente pela Casa Dregarr após a Guerra das Fendas.",
    canonStatus: "approved",
    visibility: "public",
    recordState: "confirmed",
    technical: {
      prototypeMapPoint: {
        x: 0.368,
        y: 0.486,
        precision: "prototype",
      },
      prototypeGlobePoint: {
        latitude: 2.5,
        longitude: -31.8,
        precision: "prototype",
      },
    },
    relations: [
      { type: "part-of", targetId: "world-jadelon" },
      { type: "contains", targetId: "landmark-kurn-valgar" },
      { type: "associated-with", targetId: "org-casa-dregarr" },
    ],
    media: [
      {
        kind: "map",
        assetId: "map-shell-low",
        alt: "Derivado cartografico de prototipo contendo a area editorial de Baaldrum.",
      },
    ],
    sources: [
      {
        id: "base-consolidada-v1",
        kind: "editorial",
        label: "Base consolidada da V1",
        authority: "active-docs",
        note: "Consolidação pública de Báaldrum.",
      },
      {
        id: "inventario-v1",
        kind: "reference",
        label: "Inventário de conteúdo da V1",
        authority: "reference-docs",
      },
    ],
    tags: ["continente", "geografia", "guerra-das-fendas"],
  },
  {
    id: "continent-bergskrona",
    type: "continent",
    slug: "bergskrona",
    name: "Bergskrona",
    title: "Bergskrona",
    subtitle: "Continente",
    summary:
      "Continente preservado no inventário conhecido de Jadelon e mantido no Atlas como uma das grandes massas de terra da V1.",
    canonStatus: "approved",
    visibility: "public",
    recordState: "confirmed",
    technical: {
      prototypeGlobePoint: {
        latitude: -52.2,
        longitude: -62.6,
        precision: "prototype",
      },
    },
    relations: [{ type: "part-of", targetId: "world-jadelon" }],
    media: [],
    sources: [
      {
        id: "arquitetura-modelo-v1",
        kind: "editorial",
        label: "Arquitetura e modelo da V1",
        authority: "active-docs",
        note: "Bergskrona aparece no inventário oficial de continentes da V1.",
      },
    ],
    tags: ["continente", "geografia", "atlas"],
  },
  {
    id: "continent-snoklem",
    type: "continent",
    slug: "snoklem",
    name: "Snøklem",
    title: "Snøklem",
    subtitle: "Continente",
    summary:
      "Continente central para a camada de Brannslott e Ilddrage, tratado na fundação como uma das geografias nucleares da V1.",
    canonStatus: "approved",
    visibility: "public",
    recordState: "confirmed",
    technical: {
      prototypeMapPoint: {
        x: 0.177,
        y: 0.231,
        precision: "prototype",
      },
      prototypeGlobePoint: {
        latitude: 48.4,
        longitude: -77.6,
        precision: "prototype",
      },
    },
    relations: [
      { type: "part-of", targetId: "world-jadelon" },
      { type: "contains", targetId: "kingdom-brannslott" },
    ],
    media: [
      {
        kind: "map",
        assetId: "map-shell-low",
        alt: "Derivado cartografico de prototipo contendo a area editorial de Snoklem.",
      },
    ],
    sources: [
      {
        id: "inventario-v1",
        kind: "reference",
        label: "Inventário de conteúdo da V1",
        authority: "reference-docs",
        note: "Snøklem aparece como continente clicável e relacionado a Brannslott.",
      },
    ],
    tags: ["continente", "geografia", "snoklem"],
  },
  {
    id: "continent-cathizar",
    type: "continent",
    slug: "cathizar",
    name: "Cathizar",
    title: "Cathizar",
    subtitle: "Continente",
    summary:
      "Continente preservado no inventário conhecido de Jadelon e reservado para leitura cartográfica ampliada no Atlas.",
    canonStatus: "approved",
    visibility: "public",
    recordState: "confirmed",
    technical: {
      prototypeGlobePoint: {
        latitude: 57.6,
        longitude: 57.3,
        precision: "prototype",
      },
    },
    relations: [{ type: "part-of", targetId: "world-jadelon" }],
    media: [],
    sources: [
      {
        id: "arquitetura-modelo-v1",
        kind: "editorial",
        label: "Arquitetura e modelo da V1",
        authority: "active-docs",
        note: "Cathizar aparece no inventário oficial de continentes da V1.",
      },
    ],
    tags: ["continente", "geografia", "atlas"],
  },
  {
    id: "continent-neverith",
    type: "continent",
    slug: "neverith",
    name: "Névérith",
    title: "Névérith",
    subtitle: "Continente",
    summary:
      "Continente preservado no inventário conhecido de Jadelon e mantido na leitura pública como uma das geografias amplas do Atlas.",
    canonStatus: "approved",
    visibility: "public",
    recordState: "confirmed",
    technical: {
      prototypeGlobePoint: {
        latitude: 1.8,
        longitude: 50.4,
        precision: "prototype",
      },
    },
    relations: [{ type: "part-of", targetId: "world-jadelon" }],
    media: [],
    sources: [
      {
        id: "arquitetura-modelo-v1",
        kind: "editorial",
        label: "Arquitetura e modelo da V1",
        authority: "active-docs",
        note: "Névérith aparece no inventário oficial de continentes da V1.",
      },
    ],
    tags: ["continente", "geografia", "atlas"],
  },
  {
    id: "continent-xharas-tor",
    type: "continent",
    slug: "xharas-tor",
    name: "Xharas-Tor",
    title: "Xharas-Tor",
    subtitle: "Continente",
    summary:
      "Continente preservado no inventário conhecido de Jadelon e mantido no Atlas como uma das grandes regiões cartográficas da V1.",
    canonStatus: "approved",
    visibility: "public",
    recordState: "confirmed",
    technical: {
      prototypeGlobePoint: {
        latitude: -55.8,
        longitude: 74.1,
        precision: "prototype",
      },
    },
    relations: [{ type: "part-of", targetId: "world-jadelon" }],
    media: [],
    sources: [
      {
        id: "arquitetura-modelo-v1",
        kind: "editorial",
        label: "Arquitetura e modelo da V1",
        authority: "active-docs",
        note: "Xharas-Tor aparece no inventário oficial de continentes da V1.",
      },
    ],
    tags: ["continente", "geografia", "atlas"],
  },
  {
    id: "event-guerra-das-fendas",
    type: "event",
    slug: "guerra-das-fendas",
    name: "Guerra das Fendas",
    title: "A Guerra das Fendas: O Nascimento de Báaldrum",
    summary:
      "Evento central da V1 que marca a unificação política de Báaldrum sob a Casa Dregarr.",
    canonStatus: "approved",
    visibility: "public",
    recordState: "confirmed",
    temporal: {
      eraIds: ["era-politica"],
      yearStart: 6000,
      yearEnd: 6040,
    },
    relations: [
      { type: "occurs-during", targetId: "era-politica" },
      { type: "occurs-at", targetId: "landmark-kurn-valgar" },
    ],
    media: [],
    sources: [
      {
        id: "base-consolidada-v1",
        kind: "editorial",
        label: "Base consolidada da V1",
        authority: "active-docs",
        note: "Título do evento e consolidação editorial.",
      },
      {
        id: "excerto-zan-hau",
        kind: "historical",
        label: "Excerto consolidado de Zan-Hau",
        authority: "historical-archive",
      },
    ],
    tags: ["evento", "baaldrum", "cronologia"],
  },
  {
    id: "landmark-kurn-valgar",
    type: "landmark",
    slug: "kurn-valgar",
    name: "Kurn Valgar",
    title: "Kurn Valgar",
    summary:
      "Maior fenda de Báaldrum e local associado à batalha decisiva e à capital fortificada do governo unificado.",
    canonStatus: "approved",
    visibility: "public",
    recordState: "confirmed",
    geography: {
      continentId: "continent-baaldrum",
      parentPlaceId: "continent-baaldrum",
    },
    relations: [
      { type: "located-in", targetId: "continent-baaldrum" },
    ],
    media: [],
    sources: [
      {
        id: "base-consolidada-v1",
        kind: "editorial",
        label: "Base consolidada da V1",
        authority: "active-docs",
        note: "Consolidação de Kurn Valgar.",
      },
    ],
    tags: ["landmark", "baaldrum", "guerra-das-fendas"],
  },
  {
    id: "character-zan-hau",
    type: "character",
    slug: "zan-hau",
    name: "Zan-Hau",
    title: "Zan-Hau",
    summary:
      "Figura histórica ligada à campanha final contra a Casa Dregarr durante a Guerra das Fendas.",
    canonStatus: "approved",
    visibility: "public",
    recordState: "confirmed",
    temporal: {
      eraIds: ["era-politica"],
      yearStart: 6000,
      yearEnd: 6040,
      temporalNote: "A campanha final ocorre dentro do arco cronológico da Guerra das Fendas.",
    },
    relations: [
      { type: "participated-in", targetId: "event-guerra-das-fendas" },
      { type: "opposes", targetId: "org-casa-dregarr", label: "Resistência final" },
    ],
    media: [],
    sources: [
      {
        id: "correcoes-canonicas",
        kind: "editorial",
        label: "Correções canônicas ativas",
        authority: "active-docs",
        note: "Morte única e canonicamente confirmada.",
      },
      {
        id: "excerto-zan-hau",
        kind: "historical",
        label: "Excerto consolidado de Zan-Hau",
        authority: "historical-archive",
      },
    ],
    tags: ["personagem", "figura-historica", "guerra-das-fendas"],
  },
  {
    id: "org-casa-dregarr",
    type: "organization",
    slug: "casa-dregarr",
    name: "Casa Dregarr",
    title: "Casa Dregarr",
    summary:
      "Casa política responsável pela unificação de Báaldrum no arco consolidado da Guerra das Fendas.",
    canonStatus: "approved",
    visibility: "public",
    recordState: "confirmed",
    relations: [
      { type: "part-of", targetId: "continent-baaldrum" },
      { type: "participated-in", targetId: "event-guerra-das-fendas" },
    ],
    media: [],
    sources: [
      {
        id: "base-consolidada-v1",
        kind: "editorial",
        label: "Base consolidada da V1",
        authority: "active-docs",
        note: "Unificação política de Báaldrum.",
      },
    ],
    tags: ["organizacao", "politica", "baaldrum"],
  },
  {
    id: "kingdom-brannslott",
    type: "kingdom",
    slug: "brannslott",
    name: "Brannslott",
    title: "Brannslott",
    subtitle: "Estrutura política",
    summary:
      "Principal potência de Snøklem, formada por territórios diretamente ligados ao império e por comunidades sob sua influência.",
    canonStatus: "approved",
    visibility: "public",
    recordState: "confirmed",
    geography: {
      continentId: "continent-snoklem",
      parentPlaceId: "continent-snoklem",
    },
    relations: [
      { type: "located-in", targetId: "continent-snoklem" },
    ],
    media: [],
    sources: [
      {
        id: "base-consolidada-v1",
        kind: "editorial",
        label: "Base consolidada da V1",
        authority: "active-docs",
        note: "Brannslott deve ser separado de outras entidades homônimas.",
      },
    ],
    tags: ["estrutura-politica", "snoklem", "v1"],
  },
];
