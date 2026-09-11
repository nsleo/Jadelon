import { publicEntities } from "../public/entities";
import type { BaseEntity } from "../../types/content";

export type WikiCategory =
  | "mundo"
  | "geografia"
  | "politica"
  | "lugares"
  | "hidrografia"
  | "religiao"
  | "eternos"
  | "magia"
  | "cronologia"
  | "casas"
  | "cartografia";

export type WikiAccess = "public" | "private";

export type WikiEntry = {
  id: string;
  slug: string;
  name: string;
  category: WikiCategory;
  access: WikiAccess;
  status: "canon" | "defined" | "private-review" | "incomplete";
  summary: string;
  body: string;
  tags: string[];
  sourceDocs: string[];
  related?: string[];
};

const categoryByType: Partial<Record<BaseEntity["type"], WikiCategory>> = {
  world: "mundo",
  continent: "geografia",
  region: "geografia",
  kingdom: "politica",
  city: "lugares",
  landmark: "lugares",
  character: "lugares",
  deity: "eternos",
  event: "cronologia",
  era: "cronologia",
  organization: "casas",
  concept: "magia",
  record: "cartografia",
  resource: "cartografia",
};

const publicWikiEntries: WikiEntry[] = publicEntities.map((entity) => ({
  id: entity.id,
  slug: entity.slug,
  name: entity.name,
  category: categoryByType[entity.type] ?? "mundo",
  access: "public",
  status: entity.canonStatus === "approved" ? "canon" : "defined",
  summary: entity.summary,
  body: entity.body ?? entity.summary,
  tags: entity.tags,
  sourceDocs: entity.sources.map((source) => source.label),
  related: entity.relations.map((relation) => relation.targetId),
}));

const privateReviewEntries: WikiEntry[] = [
  {
    id: "private-xharas-tor-update",
    slug: "xharas-tor-atualizacao",
    name: "Xharas-Tor: atualização territorial",
    category: "geografia",
    access: "private",
    status: "private-review",
    summary: "Continente sudeste fragmentado entre costas, ilhas, canais e regiões marítimas.",
    body: "O norte é a Terra dos Malditos, historicamente dominada por piratas. O noroeste corresponde a Casalivre Corshal, com areia, lagos, casas sobre estacas, pontes e uma grande frota. O nordeste é Porto Negro, caótico, miserável e sem governo efetivo. No centro vivem os monges de Consome-Lampejo, em comunidades isoladas de casas de barro que desabam e são reconstruídas. O sul é o domínio da Coroa de Xharas-Tor e da Casa Vael-Soren, com For-Jak como capital e a Baía da Tempestade como principal centro naval.",
    tags: ["xharas-tor", "piratas", "coroa", "monges", "privado"],
    sourceDocs: ["LORE_XHARAS_TOR_ATUALIZACAO_2026-09-11.md", "AZGAAR_STATES_JADELON_v0.1.md"],
    related: ["continent-xharas-tor"],
  },
  {
    id: "private-xharas-tor-provinces",
    slug: "provincias-xharas-tor",
    name: "Províncias atuais de Xharas-Tor",
    category: "politica",
    access: "private",
    status: "private-review",
    summary: "A versão atual do mapa usa seis províncias para separar os núcleos marítimos, monásticos e da Coroa.",
    body: "As províncias atuais são Torvak Basin, Baía da Tempestade, Coroa de Xharas-Tor, Terra dos Malditos, Casalivre Corshal e Território de Consome-Lampejo. A divisão substitui a primeira hipótese com Harasq Mire, Veyrfen e Drownreach. Os vazios entre as províncias continuam intencionais: representam águas, ilhas, influência irregular e áreas sem administração provincial estável.",
    tags: ["xharas-tor", "provincias", "mapa-oficial", "privado"],
    sourceDocs: ["AZGAAR_PROVINCES_XHARAS_TOR_JADELON_v0.1.md", "Ousia 2026-09-11-14-32.map"],
    related: ["private-xharas-tor-update"],
  },
  {
    id: "private-xharas-tor-religion",
    slug: "consome-lampejo-em-xharas-tor",
    name: "Consome-Lampejo em Xharas-Tor",
    category: "religiao",
    access: "private",
    status: "canon",
    summary: "A presença monástica central é uma expressão regional de Consome-Lampejo, não um novo Eterno.",
    body: "Consome-Lampejo continua sendo um dos Eternos canônicos. Os monges do centro de Xharas-Tor formam uma ordem religiosa e social associada a ele. A religião operacional do mapa pode continuar como Xharas-Tor Hidden-Water Rite, enquanto a ordem monástica e suas casas de barro ficam descritas nas notas e na lore.",
    tags: ["xharas-tor", "consome-lampejo", "eternos", "privado"],
    sourceDocs: ["LORE_XHARAS_TOR_ATUALIZACAO_2026-09-11.md"],
    related: ["continent-xharas-tor"],
  },
  {
    id: "private-house-dregarr",
    slug: "casa-dregarr-privada",
    name: "Casa Dregarr",
    category: "casas",
    access: "private",
    status: "canon",
    summary: "Casa real e soberana de Báaldrum, ligada à unificação após a Guerra das Fendas.",
    body: "A Casa Dregarr é a casa soberana de Báaldrum. Sua autoridade é sustentada por casas vassalas, pela Guarda da Coroa e pela memória da guerra que unificou o continente. Dregarria permanece como centro político cartográfico desta versão, enquanto as relações entre a Coroa e as casas regionais continuam parte essencial da lore privada.",
    tags: ["baaldrum", "casa", "coroa", "privado"],
    sourceDocs: ["LORE_BAALDRUM_CASAS_REGIOES_2026-09-10.md", "AZGAAR_STATES_JADELON_v0.1.md"],
    related: ["org-casa-dregarr", "event-guerra-das-fendas"],
  },
  {
    id: "private-baaldrum-houses",
    slug: "casas-de-baaldrum",
    name: "Casas nobres de Báaldrum",
    category: "casas",
    access: "private",
    status: "private-review",
    summary: "O bloco privado reúne casas vassalas, aliadas, casas de mérito e tensões regionais de Báaldrum.",
    body: "A matriz atual inclui Volth e Dorth no eixo militar; Rahwell em Bridgestorm; Freeland em Snowside; Tormen nas Footgiants; Redsaw em Thumb; Fessä em Fertilewind; além de Horjoe, Werder, Jorr, Mahjo, Carwin, Redmine, Elcher, Zolfem, Hook, Portyard, Nold e Ilxa. Tormen e Dregarr carregam uma tensão política encerrada apenas recentemente nas Batalhas das Pontes. Redsaw e Tormen controlam zonas da fronteira com Bergskrona.",
    tags: ["baaldrum", "casas", "bridgestorm", "snowside", "footgiants", "privado"],
    sourceDocs: ["LORE_BAALDRUM_CASAS_REGIOES_2026-09-10.md"],
    related: ["private-house-dregarr"],
  },
  {
    id: "private-canonical-rivers",
    slug: "rios-e-lagos-canonicos",
    name: "Rios e lagos canônicos",
    category: "hidrografia",
    access: "private",
    status: "canon",
    summary: "A hidrografia acompanha a lore regional e não deve ser tratada como decoração automática do mapa.",
    body: "Qadren-Sahr é o único rio principal de Cathizar: vem da fronteira com Snøklem, atravessa a vida do continente e conecta o oceano ao lago central de Qadren. Tazhar é seu afluente. Em Xharas-Tor, Harasq entra do mar aberto e atravessa Harasq Mire; Torvhal estrutura a bacia e os canais de Torvak. Verda acompanha Verda Vale em Névérith. Os demais cursos, lagos e canais permanecem vinculados às rotas e zonas que foram aprovadas no mapa atual.",
    tags: ["rios", "lagos", "cathizar", "xharas-tor", "neverith", "privado"],
    sourceDocs: ["AZGAAR_RIVERS_JADELON_v0.1.md", "AZGAAR_PROVINCES_CATHIZAR_JADELON_v0.1.md", "LORE_XHARAS_TOR_ATUALIZACAO_2026-09-11.md"],
  },
  {
    id: "private-canonical-biomes",
    slug: "biomas-canonicos",
    name: "Biomas canônicos iniciais",
    category: "geografia",
    access: "private",
    status: "canon",
    summary: "Doze macrobiomas iniciais foram definidos para controlar a recriação do mapa em Azgaar.",
    body: "Snøklem usa tundra e taiga; Báaldrum usa cinzas e vulcões; Bergskrona usa pradaria e altiplano; Xharas-Tor usa pântano e alagados; Névérith usa bosques e vales; Cathizar usa deserto e estepe. As cores e os níveis de habitabilidade pertencem à matriz canônica de biomas. Biomas anômalos, do Continente de Fora ou ligados ao Desconhecido permanecem fora desta base inicial.",
    tags: ["biomas", "azgaar", "geografia", "privado"],
    sourceDocs: ["BIOMAS_CANONICOS_JADELON_v0.1.md"],
  },
  {
    id: "private-provinces-matrix",
    slug: "matriz-provincial",
    name: "Matriz provincial de Jadelon",
    category: "politica",
    access: "private",
    status: "private-review",
    summary: "As províncias transformam macrocontinentes em regiões de leitura política, cultural e cartográfica.",
    body: "Snøklem está dividido em Crownlands, Glaskald, Fyrlund e Frostmarch. Cathizar em Qadren Basin, Sahr Coast, Shadren March e Qirath Steppe. Névérith em Valletia, Verda Vale, Serenval e Aurelith Woods. Báaldrum mantém Highrifts, Bridgestorm, Snowside, Footgiants e Greenside. Xharas-Tor usa a divisão territorial atual registrada no verbete próprio. Vazios entre províncias são preservados como território livre, fronteira ou administração irregular.",
    tags: ["provincias", "continentes", "mapa-oficial", "privado"],
    sourceDocs: ["AZGAAR_PROVINCES_SNOKLEM_JADELON_v0.1.md", "AZGAAR_PROVINCES_CATHIZAR_JADELON_v0.1.md", "AZGAAR_PROVINCES_NEVERITH_JADELON_v0.1.md", "AZGAAR_PROVINCES_XHARAS_TOR_JADELON_v0.1.md"],
  },
  {
    id: "private-eternos-matrix",
    slug: "eternos-e-religioes",
    name: "Eternos e religiões regionais",
    category: "eternos",
    access: "private",
    status: "canon",
    summary: "Os seis Eternos funcionam como referências amplas; as religiões do mapa são expressões culturais e regionais.",
    body: "A matriz regional atual associa Snøklem a Polaris Erte, Bergskrona a Forja-Véus, Névérith a Abre-Sol, Xharas-Tor ao Deus do Oculto, Báaldrum a Consome-Lampejo e Cathizar a Hva Sanden Laget. A associação não transforma automaticamente cada religião em um novo Eterno: o Eterno é a entidade cosmológica ampla, enquanto rito, ordem, tradição e interpretação pertencem à camada local.",
    tags: ["eternos", "religiao", "magia", "privado"],
    sourceDocs: ["AZGAAR_CAMADAS_MAPA_OFICIAL_JADELON_v0.1.md", "LORE_XHARAS_TOR_ATUALIZACAO_2026-09-11.md"],
  },
  {
    id: "private-magic-veil",
    slug: "magia-e-o-veu",
    name: "Magia e o Véu",
    category: "magia",
    access: "private",
    status: "private-review",
    summary: "A camada de magia permanece parcialmente conhecida e deve conservar lacunas deliberadas.",
    body: "A magia de Jadelon não deve ser reduzida a um catálogo fechado de poderes. O Véu funciona como limite de conhecimento e como linguagem para os fenômenos que atravessam Eternos, lugares, ritos e registros. A Arcantheon e Aetheris devem permanecer como estruturas específicas, enquanto as regras completas, custos e manifestações continuam em validação privada.",
    tags: ["magia", "véu", "arcantheon", "aetheris", "privado"],
    sourceDocs: ["JADELON_V1_ARQUITETURA_E_MODELO_v0.1.md", "AZGAAR_STATES_JADELON_v0.1.md"],
  },
  {
    id: "private-cartography-rules",
    slug: "regras-do-mapa-oficial",
    name: "Regras do mapa oficial",
    category: "cartografia",
    access: "private",
    status: "canon",
    summary: "O mapa é uma reconstrução controlada: o que foi definido para visualização deve permanecer coerente com a lore.",
    body: "States representam a escala continental ou política macro; Provinces representam grandes regiões; Zones representam áreas internas; Burgs representam assentamentos; Markers e Labels registram elementos especiais. Vazio, fronteira irregular, ilha, água e território livre também são informação canônica. Dados automáticos do Azgaar, como temperatura, população e diplomacia, não substituem a lore sem revisão.",
    tags: ["azgaar", "mapa", "canon", "privado"],
    sourceDocs: ["AZGAAR_CAMADAS_MAPA_OFICIAL_JADELON_v0.1.md", "AUDITORIA_CARTOGRAFICA_v0.1.md"],
  },
];

export const wikiEntries = [...publicWikiEntries, ...privateReviewEntries];

export const wikiCategories: Array<{ id: WikiCategory; label: string }> = [
  { id: "mundo", label: "Mundo" },
  { id: "geografia", label: "Geografia" },
  { id: "politica", label: "Política" },
  { id: "lugares", label: "Lugares" },
  { id: "hidrografia", label: "Hidrografia" },
  { id: "religiao", label: "Religião" },
  { id: "eternos", label: "Eternos" },
  { id: "magia", label: "Magia" },
  { id: "cronologia", label: "Cronologia" },
  { id: "casas", label: "Casas" },
  { id: "cartografia", label: "Cartografia" },
];
