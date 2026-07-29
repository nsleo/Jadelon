import { SectionFrame, SectionHeading } from "@/components/site/primitives";

export function PlaceholderPage({
  eyebrow,
  title,
  description,
  note,
  items,
}: {
  eyebrow: string;
  title: string;
  description: string;
  note: string;
  items?: string[];
}) {
  return (
    <SectionFrame className="page-shell page-shell--narrow">
      <SectionHeading
        eyebrow={eyebrow}
        level="h1"
        title={title}
        description={description}
      />
      <div className="placeholder-shell">
        <p className="placeholder-shell__note">{note}</p>
        {items?.length ? (
          <ul className="placeholder-shell__list">
            {items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        ) : null}
      </div>
    </SectionFrame>
  );
}
