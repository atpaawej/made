interface Quote {
  text: string;
  name: string;
  meta: string;
}

interface ReviewsProps {
  props: Record<string, unknown>;
}

export default function Reviews({ props: p }: ReviewsProps) {
  const heading = typeof p.heading === "string" ? p.heading : "";
  const rawQuotes = Array.isArray(p.quotes) ? (p.quotes as Quote[]) : [];
  const quotes = rawQuotes.filter((q) => q && typeof q.text === "string");

  if (quotes.length === 0) return null;

  return (
    <section className="bg-slate-50 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        {heading ? <h2 className="text-2xl font-bold text-slate-900">{heading}</h2> : null}
        <div className="mt-8 grid gap-6 sm:grid-cols-3">
          {quotes.map((q) => (
            <figure key={`${q.name}-${q.text.slice(0, 12)}`} className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100">
              <blockquote className="text-sm leading-relaxed text-slate-700">“{q.text}”</blockquote>
              <figcaption className="mt-4">
                <p className="text-sm font-semibold text-slate-900">{q.name}</p>
                {q.meta ? <p className="text-xs text-slate-500">{q.meta}</p> : null}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
