interface Step {
  title: string;
  desc: string;
}

interface HowItWorksProps {
  props: Record<string, unknown>;
}

export default function HowItWorks({ props: p }: HowItWorksProps) {
  const heading = typeof p.heading === "string" ? p.heading : "";
  const rawSteps = Array.isArray(p.steps) ? (p.steps as Step[]) : [];
  const steps = rawSteps.filter((s) => s && typeof s.title === "string");

  return (
    <section className="bg-slate-50 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        {heading ? <h2 className="text-2xl font-bold text-slate-900">{heading}</h2> : null}
        <div className="mt-8 grid gap-6 sm:grid-cols-3">
          {steps.map((step, idx) => (
            <div key={`${step.title}-${idx}`} className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#25D366] text-sm font-bold text-white">
                {idx + 1}
              </div>
              <h3 className="mt-4 text-sm font-semibold text-slate-900">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
