import ItemCard from "./ItemCard";

export default function ShelfSection({
  title,
  items,
}: {
  title: string;
  items: { id: string; title: string; type: "BOOK" | "SHOW"; tags: string[] }[];
}) {
  if (items.length === 0) return null;

  return (
    <section className="mb-10">
      {title && <h2 className="font-display text-xl mb-3 text-ink">{title}</h2>}
      <div className="shelf-row">
        {items.map((it) => (
          <ItemCard key={it.id} {...it} />
        ))}
      </div>
    </section>
  );
}
