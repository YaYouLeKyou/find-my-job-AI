type ProfileOutput = {
  idealTitle: string;
  techStack: string[];
  yearsExperience: number;
  keywords: string[];
};

export async function generateProfileFromText(text: string): Promise<ProfileOutput> {
  const systemPrompt = `Tu es un assistant expert qui lit un CV et retourne uniquement du JSON valide.
Ne réponds pas autrement. Ignorer les informations non pertinentes.
Structure attendue : { "idealTitle": string, "techStack": string[], "yearsExperience": number, "keywords": string[] }.`;

  const userPrompt = `Analyse ce CV et donne :
- un titre de poste idéal
- une stack technique
- les années d'expérience
- 5 mots-clés pertinents pour une recherche d'emploi
Le remote est une option. Voici le texte : ${text}`;

  const response = await callGeminiApi(systemPrompt, userPrompt);

  if (!response || !response.trim()) {
    throw new Error('Réponse vide de l’API Gemini.');
  }

  try {
    // Nettoyage de la réponse au cas où Gemini ajouterait des balises markdown ```json
    const cleanJson = response.replace(/```json|```/gi, '').trim();
    const parsed = JSON.parse(cleanJson);
    
    const keywords = Array.isArray(parsed.keywords) ? parsed.keywords : [];

    return {
      idealTitle: parsed.idealTitle ?? '',
      techStack: Array.isArray(parsed.techStack) ? parsed.techStack : [],
      yearsExperience: Number(parsed.yearsExperience) || 0,
      keywords: keywords.length > 0 ? keywords : ['emploi', 'recrutement'],
    };
  } catch (error) {
    console.error('Erreur de parsing Gemini:', error, '=> response:', response);
    throw new Error('Impossible d’analyser le profil du candidat.');
  }
}

async function callGeminiApi(systemPrompt: string, userPrompt: string): Promise<string> {
  const apiKey = process.env.GOOGLE_GENAI_API_KEY;
  if (!apiKey) {
    throw new Error('GOOGLE_GENAI_API_KEY non défini.');
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{
        parts: [{ text: `${systemPrompt}\n\nIMPORTANT: Réponds uniquement avec le JSON demandé.\n\nContenu du CV :\n${userPrompt}` }]
      }]
    }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ error: { message: "Unknown error" } }));
    console.error('Détails erreur Gemini:', JSON.stringify(errorData, null, 2));
    throw new Error(`Erreur API Gemini (${res.status}): ${errorData.error?.message || 'Inconnue'}`);
  }

  const data = await res.json();
  if (!data.candidates || data.candidates.length === 0) {
    throw new Error("L'IA n'a retourné aucun résultat. Vérifie le contenu du CV.");
  }

  const resultText = data.candidates[0].content?.parts?.[0]?.text;

  if (!resultText && data.candidates[0].finishReason === 'SAFETY') {
    throw new Error('Analyse bloquée par les filtres de sécurité (contenu sensible détecté).');
  }

  return resultText ?? '';
}
