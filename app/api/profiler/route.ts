import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { extractTextFromPdf } from '../../../lib/pdfParser';
import { generateProfileFromText } from '../../../lib/openai';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: 'Fichier PDF manquant.' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const text = await extractTextFromPdf(buffer);
    const profile = await generateProfileFromText(text);

    return NextResponse.json(profile);
  } catch (error) {
    console.error('Erreur dans /api/profiler:', error);
    return NextResponse.json({ error: 'Erreur interne du serveur.' }, { status: 500 });
  }
}
