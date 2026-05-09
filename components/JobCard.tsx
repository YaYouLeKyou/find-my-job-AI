interface JobCardProps {
  job: {
    id: string;
    title: string;
    company: string;
    score: number;
    location: string;
    description: string;
  };
}

export default function JobCard({ job }: JobCardProps) {
  return (
    <article className="rounded-3xl border border-slate-800 bg-slate-950/90 p-6 shadow-glow">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-slate-500">{job.company}</p>
          <h2 className="text-2xl font-semibold text-white">{job.title}</h2>
        </div>
        <span className="rounded-full bg-blue-500 px-4 py-2 text-sm font-semibold text-white">{job.score}%</span>
      </div>
      <p className="mb-4 text-sm text-slate-400">{job.description}</p>
      <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-slate-300">
        <span>{job.location}</span>
        <button className="rounded-2xl bg-slate-800 px-4 py-2 text-white transition hover:bg-blue-500">
          Générer Lettre de Motivation
        </button>
      </div>
    </article>
  );
}
