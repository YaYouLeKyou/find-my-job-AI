'use client';

import { useState } from 'react';
import Dropzone from '../components/Dropzone';
import JobCard from '../components/JobCard';

interface ProfileData {
  idealTitle: string;
  techStack: string[];
  yearsExperience: number;
  keywords: string[];
}

interface JobResult {
  id: string;
  title: string;
  company: string;
  score: number;
  location: string;
  description: string;
}

export default function HomePage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [jobs, setJobs] = useState<JobResult[]>([]);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [remoteOnly, setRemoteOnly] = useState(true);

  async function fetchHunter(file: File, remote: boolean) {
    setIsSearching(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('remote', String(remote));

      const response = await fetch('/api/hunter', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Impossible de trouver des offres.');
      }

      const data = await response.json();
      setProfile(data.profile ?? null);
      setJobs(data.jobs ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue lors de l’analyse.');
      setProfile(null);
      setJobs([]);
    } finally {
      setIsSearching(false);
    }
  }

  async function handleFileChange(file: File | null) {
    setSelectedFile(file);
    setProfile(null);
    setJobs([]);
    setError(null);

    if (file) {
      await fetchHunter(file, remoteOnly);
    }
  }

  return (
    <main className="min-h-screen bg-brand-900 text-slate-100 px-6 py-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-10">
        <section className="rounded-3xl border border-slate-800 bg-slate-950/60 p-8 shadow-glow backdrop-blur-xl">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-slate-500">AI Job Hunter</p>
              <h1 className="text-4xl font-semibold text-white">Analyse ton CV & trouve des offres remote.</h1>
              <p className="mt-3 max-w-2xl text-slate-400">
                Glisse ton PDF, lance la recherche et découvre les meilleures opportunités avec un score de compatibilité.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <Dropzone file={selectedFile} onFileChange={handleFileChange} />
            <div className="flex items-center gap-4 rounded-3xl border border-slate-800 bg-slate-950/80 p-6 shadow-sm">
              <label className="flex items-center gap-3 text-sm text-slate-300">
                <input
                  type="checkbox"
                  checked={remoteOnly}
                  onChange={(event) => setRemoteOnly(event.target.checked)}
                  className="h-4 w-4 rounded border-slate-700 bg-slate-800 text-blue-500 focus:ring-blue-500"
                />
                Remote uniquement
              </label>
              <p className="text-sm text-slate-500 max-w-xs">
                Active si tu veux privilégier le télétravail. Sinon laisse désactivé pour chercher toutes les offres.
              </p>
            </div>
          </div>

          <div className="mt-6">
            <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-6 shadow-sm">
              <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Analyse du CV</p>
              <div className="mt-4 rounded-3xl border border-slate-800 bg-slate-900/80 p-5">
                {isSearching ? (
                  <p className="text-slate-300">Analyse en cours…</p>
                ) : profile ? (
                  <div className="space-y-4 text-slate-200">
                    <div>
                      <p className="text-sm text-slate-500">Métier trouvé</p>
                      <h2 className="mt-2 text-2xl font-semibold text-white">{profile.idealTitle}</h2>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Stack technique</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {profile.techStack.map((skill) => (
                          <span key={skill} className="rounded-full bg-blue-500/15 px-3 py-1 text-sm text-blue-200 ring-1 ring-blue-500/30">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Mots clés</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {profile.keywords.map((keyword) => (
                          <span key={keyword} className="rounded-full bg-slate-800 px-3 py-1 text-sm text-slate-200 ring-1 ring-slate-700">
                            {keyword}
                          </span>
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-slate-400">Années d'expérience estimées : {profile.yearsExperience}</p>
                  </div>
                ) : (
                  <div className="space-y-3 text-slate-400">
                    <p>Dépose ton CV PDF pour que l'IA identifie le métier idéal et les mots clés.</p>
                    {error ? <p className="text-sm text-rose-400">{error}</p> : null}
                  </div>
                )}
              </div>
            </div>
          </div>

        </section>

        <section className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
          {jobs.length > 0 ? (
            jobs.map((job) => <JobCard key={job.id} job={job} />)
          ) : (
            <div className="col-span-full rounded-3xl border border-slate-800 bg-slate-950/80 p-8 text-slate-400">
              <p className="text-lg font-semibold text-white">Résultats de recherche</p>
              <p className="mt-3 text-sm text-slate-400">
                Ton CV doit d'abord être analysé pour générer les mots clés. Ensuite, l’IA recherche des offres sur les sites ciblés.
              </p>
              {profile ? (
                <p className="mt-3 text-slate-300">Aucun résultat trouvé pour les mots clés actuels ou la recherche est en cours.</p>
              ) : (
                <p className="mt-3 text-slate-300">Upload un CV pour lancer le scraping et voir les meilleures offres.</p>
              )}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
