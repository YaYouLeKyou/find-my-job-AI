import { NextRequest, NextResponse } from 'next/server';
import { extractTextFromPdf } from '../../../lib/pdfParser';
import { generateProfileFromText } from '../../../lib/openai';
import { fetchJobMarkdown, scoreJobOffer, searchJobsWithSerper } from '../../../lib/jobHunter';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const remote = String(formData.get('remote') ?? 'true') === 'true';

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: 'Fichier PDF manquant.' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const text = await extractTextFromPdf(buffer);

    if (!text || text.trim().length < 50) {
      throw new Error('Le texte extrait du PDF est trop court ou illisible. Vérifie que le fichier n’est pas une image.');
    }

    const profile = await generateProfileFromText(text);
    if (!profile.keywords || profile.keywords.length === 0) {
      throw new Error('Aucun mot-clé extrait du CV. Vérifie ton PDF ou la configuration de l’API Gemini.');
    }

    const results = await searchJobsWithSerper(profile.keywords, remote);

    const scoredJobs = await Promise.all(
      results.slice(0, 10).map(async (result, index) => {
        const markdown = await fetchJobMarkdown(result.url).catch(() => '');
        const score = markdown ? scoreJobOffer(markdown, profile) : 10;
        return {
          id: String(index + 1),
          title: result.title || result.url,
          company: result.company || 'Entreprise',
          score,
          location: remote ? 'Remote' : 'Flexible',
          description: result.snippet || 'Offre de poste trouvée sur le web.',
          url: result.url,
        };
      }),
    );

    const jobs = scoredJobs.sort((a, b) => b.score - a.score).slice(0, 5);

    return NextResponse.json({ profile, jobs });
  } catch (error) {
    console.error('Erreur dans /api/hunter:', error);
    const message = error instanceof Error ? error.message : 'Erreur interne du serveur.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
