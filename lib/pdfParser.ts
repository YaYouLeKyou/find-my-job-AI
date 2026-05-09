import pdf from 'pdf-parse';

export async function extractTextFromPdf(data: Buffer): Promise<string> {
  const parsed = await pdf(data);
  return parsed.text || '';
}
