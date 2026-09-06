interface TrustStripProps {
  props: Record<string, unknown>;
}

export default function TrustStrip({ props: p }: TrustStripProps) {
  const items = Array.isArray(p.items) ? (p.items as string[]) : [];

  if (items.length === 0) return null;

  return (
    <section className="border-y border-slate-100 bg-slate-50 px-4 py-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm font-medium text-slate-600">
          {items.map((item) => (
            <li key={item} className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[#25D366]" aria-hidden />
              {item}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
