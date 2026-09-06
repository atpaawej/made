interface Point {
  title: string;
  desc: string;
}

interface WhyUsProps {
  props: Record<string, unknown>;
}

export default function WhyUs({ props: p }: WhyUsProps) {
  const heading = typeof p.heading === "string" ? p.heading : "";
  const rawPoints = Array.isArray(p.points) ? (p.points as Point[]) : [];
  const points = rawPoints.filter((pt) => pt && typeof pt.title === "string");

  return (
    <section className="bg-white px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        {heading ? <h2 className="text-2xl font-bold text-slate-900">{heading}</h2> : null}
        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          {points.map((pt) => (
            <div key={pt.title} className="rounded-2xl border border-slate-200 bg-white p-6">
              <h3 className="text-sm font-semibold text-slate-900">{pt.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{pt.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
