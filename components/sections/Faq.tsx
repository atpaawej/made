interface FaqItem {
  q: string;
  a: string;
}

interface FaqProps {
  props: Record<string, unknown>;
}

export default function Faq({ props: p }: FaqProps) {
  const heading = typeof p.heading === "string" ? p.heading : "";
  const rawItems = Array.isArray(p.items) ? (p.items as FaqItem[]) : [];
  const items = rawItems.filter((it) => it && typeof it.q === "string" && typeof it.a === "string");

  return (
    <section className="bg-white px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl max-w-3xl">
        {heading ? <h2 className="text-2xl font-bold text-slate-900">{heading}</h2> : null}
        <div className="mt-6 divide-y divide-slate-200 rounded-2xl border border-slate-200 overflow-hidden">
          {items.map((item) => (
            <details key={item.q} className="group bg-white px-5 py-4 open:bg-slate-50">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-semibold text-slate-900 min-h-[48px]">
                <span>{item.q}</span>
                <span className="shrink-0 text-slate-400 group-open:rotate-180 transition-transform" aria-hidden>
                  ▾
                </span>
              </summary>
              <p className="mt-2 text-sm leading-relaxed text-slate-600 pb-2">{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
