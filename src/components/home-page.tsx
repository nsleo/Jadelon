import {
  AtlasLabel,
  SectionFrame,
  SectionHeading,
  TextLink,
} from "@/components/site/primitives";
import { JadelonAtlasHero } from "@/components/atlas/jadelon-atlas-hero";
import { CartographicImage } from "@/components/site/cartographic-image";
import {
  getPublicAssetById,
  getPublicEntityById,
} from "@/lib/content/public-runtime";
import type { PublicEntity } from "@/types/content";

const featuredRecordIds = [
  "event-guerra-das-fendas",
  "character-zan-hau",
  "continent-baaldrum",
];

const featuredRecordCopy: Record<string, string> = {
  "event-guerra-das-fendas":
    "A Guerra das Fendas marca a unificação política de Báaldrum e reorganiza a leitura desse território.",
  "character-zan-hau":
    "Zan-Hau permanece ligado à campanha final contra a Casa Dregarr durante a Guerra das Fendas.",
  "continent-baaldrum":
    "Báaldrum reúne fendas, vulcões e regiões geladas sob um mesmo relevo político e geográfico.",
};

const sixStructure = [
  "Abre-Sol",
  "Forja-Véus",
  "Polaris Erte",
  "Consome-Lampejo",
  "Hva Sanden Laget",
  "Deus do Oculto",
];

export function HomePage() {
  const atlasAsset = getPublicAssetById("map-atlas-jadelon-v1");
  const world = getPublicEntityById("world-jadelon");
  const baaldrum = getPublicEntityById("continent-baaldrum");
  const snoklem = getPublicEntityById("continent-snoklem");
  const guerra = getPublicEntityById("event-guerra-das-fendas");
  const featuredRecords = featuredRecordIds
    .map((id) => getPublicEntityById(id))
    .filter((entity): entity is PublicEntity => Boolean(entity));

  if (!atlasAsset || !world || !baaldrum || !snoklem || !guerra) {
    throw new Error("HomePage requires the validated public runtime and map assets.");
  }

  return (
    <div className="home-shell">
      <SectionFrame className="hero-grid home-hero">
        <div className="hero-copy">
          <AtlasLabel>Jadelon</AtlasLabel>
          <h1>Um mundo registrado por mapas, eras e testemunhos.</h1>
          <p className="hero-copy__lead">{world.summary}</p>
          <div className="hero-copy__actions">
            <TextLink
              className="text-link--cta"
              href="/atlas"
              testId="hero-primary-atlas-cta"
            >
              Explore o Atlas
            </TextLink>
            <TextLink className="text-link--cta text-link--ghost" href="/cronologia">
              Percorra a Cronologia
            </TextLink>
          </div>
        </div>

        <div className="hero-stage">
          <div className="hero-stage__visual">
            <JadelonAtlasHero asset={atlasAsset} priority />
          </div>
        </div>
      </SectionFrame>

      <SectionFrame className="exploration-grid">
        <article className="atlas-window">
          <SectionHeading
            eyebrow="Atlas"
            title="Geografia conhecida."
            description="Continentes, reinos e passagens já podem ser percorridos pelo mapa limpo oficial."
          />
          <div className="atlas-window__map">
            <CartographicImage
              alt={atlasAsset.alt ?? ""}
              className="atlas-window__image"
              priority
              sizes="(max-width: 900px) 100vw, 56vw"
              src={atlasAsset.publicUrl}
            />
            <div aria-hidden="true" className="atlas-window__wash" />
          </div>
          <div className="atlas-window__footer">
            <TextLink href="/atlas">Explore o Atlas</TextLink>
            <p>Báaldrum, Snøklem e Brannslott.</p>
          </div>
        </article>

        <article className="chronology-rail">
          <SectionHeading
            eyebrow="Cronologia"
            title="Eras, guerras e testemunhos."
            description="A Guerra das Fendas permanece como marco visível da Era Política."
          />
          <ol className="chronology-rail__list">
            <li>
              <span>0-8000</span>
              <p>Primeira Era.</p>
            </li>
            <li>
              <span>6000-8000</span>
              <p>Era Política.</p>
            </li>
            <li>
              <span>6000-6040</span>
              <p>Guerra das Fendas.</p>
            </li>
            <li>
              <span>Registros</span>
              <p>Certos períodos permanecem incompletos.</p>
            </li>
          </ol>
          <TextLink href="/cronologia">Percorra a Cronologia conhecida</TextLink>
        </article>
      </SectionFrame>

      <SectionFrame className="duality-field">
        <SectionHeading
          eyebrow="Ilddrage e Helgor"
          title="Duas presenças distintas, inscritas mais por peso do que por explicação."
          description="A leitura permanece aberta, mas o contraste entre estabilidade e ruptura já atravessa o mapa."
          />
        <div className="duality-field__composition">
          <article className="duality-monolith">
            <AtlasLabel>Ilddrage</AtlasLabel>
            <p>A fragilidade não deveria condenar ninguém.</p>
          </article>
          <article className="duality-rift">
            <AtlasLabel>Helgor</AtlasLabel>
            <p>Nenhum poder deveria exigir submissão.</p>
          </article>
        </div>
      </SectionFrame>

      <SectionFrame className="six-ledger">
        <SectionHeading
          eyebrow="Os Seis"
          title="Seis nomes atravessam os registros preservados."
          align="center"
        />
        <ol className="six-ledger__grid">
          {sixStructure.map((label, index) => (
            <li className="six-ledger__item" key={label}>
              <span className="six-ledger__index">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3>{label}</h3>
            </li>
          ))}
        </ol>
      </SectionFrame>

      <SectionFrame className="knowledge-atlas">
        <div className="knowledge-atlas__diagram">
          <SectionHeading
            eyebrow="Magia e Véu"
            title="Fluxo, estudo e limite."
          />
          <div className="knowledge-atlas__flows">
            <article>
              <AtlasLabel>Fluxo Arcano</AtlasLabel>
              <p>Fluxo Arcano → Núcleo Arcano → manifestação</p>
            </article>
            <article>
              <AtlasLabel>Fonte</AtlasLabel>
              <p>Fonte → Escola → Arquétipo</p>
            </article>
          </div>
        </div>

        <div className="records-ledger">
          <SectionHeading
            eyebrow="Registros em destaque"
            title="Guerra das Fendas, Zan-Hau e Báaldrum."
          />
          <ul className="records-ledger__list">
            {featuredRecords.map((entity) => (
              <li key={entity.id}>
                <AtlasLabel>{entity.title ?? entity.name}</AtlasLabel>
                <p>{featuredRecordCopy[entity.id] ?? entity.summary}</p>
              </li>
            ))}
          </ul>
        </div>
      </SectionFrame>
    </div>
  );
}
