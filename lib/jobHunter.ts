export type SearchResult = {
  url: string;
  title: string;
  company?: string;
  snippet?: string;
};

export async function searchJobsWithSerper(keywords: string[], remoteOnly: boolean): Promise<SearchResult[]> {
  const baseQuery = keywords.join(' ');
  const remoteQuery = remoteOnly ? ' remote OR télétravail' : '';
  const query = `${baseQuery} site:lever.co OR site:greenhouse.io OR site:welcome-to-the-jungle.com${remoteQuery}`;
  const apiKey = process.env.SERPER_API_KEY;
  if (!apiKey) {
    throw new Error('SERPER_API_KEY non défini.');
  }

  const response = await fetch('https://google.serper.dev/search', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-KEY': apiKey,
    },
    body: JSON.stringify({
      q: query,
      num: 10,
    }),
  });

  const data = await response.json();

  return (data?.organic ?? [])
    .slice(0, 10)
    .map((item: any) => ({
      url: item?.link ?? item?.href ?? '',
      title: item?.title ?? '',
      snippet: item?.snippet ?? '',
    }))
    .filter((result: SearchResult) => Boolean(result.url));
}

export async function fetchJobMarkdown(url: string): Promise<string> {
  const jinaUrl = `https://r.jina.ai/http://`;
  const safeUrl = url.replace(/^https?:\/\//, '');
  const response = await fetch(`${jinaUrl}${safeUrl}`);

  if (!response.ok) {
    throw new Error('Impossible de récupérer le markdown depuis Jina.');
  }

  return await response.text();
}

export function scoreJobOffer(markdown: string, profile: { techStack: string[]; keywords: string[]; yearsExperience: number; }): number {
  const normalized = markdown.toLowerCase();
  const stackMatch = profile.techStack.reduce((count, term) => count + (normalized.includes(term.toLowerCase()) ? 1 : 0), 0);
  const keywordMatch = profile.keywords.reduce((count, term) => count + (normalized.includes(term.toLowerCase()) ? 1 : 0), 0);
  const experienceBonus = Math.min(20, profile.yearsExperience * 2);
  const score = Math.round((stackMatch * 8) + (keywordMatch * 5) + experienceBonus);
  return Math.min(100, Math.max(1, score));
}
