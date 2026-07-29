import type { BaseEntity } from "../../types/content.ts";

export const discoverableEntities: BaseEntity[] = [
  {
    id: "record-helix-daggry",
    type: "record",
    slug: "helix-daggry",
    name: "Helix Daggry",
    title: "Helix Daggry",
    subtitle: "Registro descobrivel",
    summary:
      "Entrada descobrível reservada para um registro de expedição ligado aos Pilares do Vazio, mantida nesta fase apenas com metadados públicos seguros.",
    canonStatus: "source-recorded",
    visibility: "discoverable",
    recordState: "anomalous",
    temporal: {
      isUndated: true,
      temporalNote: "Registro mantido sem amarração cronológica pública nesta fase.",
    },
    relations: [],
    media: [],
    sources: [
      {
        id: "inventario-v1",
        kind: "reference",
        label: "Inventário de conteúdo da V1",
        authority: "reference-docs",
        note: "Entrada obrigatória da V1 como experiência futura.",
      },
      {
        id: "arquivo-historico-helix",
        kind: "historical",
        label: "Arquivo histórico de Helix Daggry",
        authority: "historical-archive",
        note: "Referência histórica abstrata; o runtime não expõe o export original.",
      },
    ],
    tags: ["registro", "descobrivel", "helix"],
  },
];
