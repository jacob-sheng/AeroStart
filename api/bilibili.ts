import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { term } = req.query;

  if (!term || typeof term !== 'string') {
    return res.status(400).json({ error: 'Missing term parameter' });
  }

  try {
    // Request Bilibili search suggestion API
    const bilibiliUrl = `https://s.search.bilibili.com/main/suggest?term=${encodeURIComponent(term)}`;

    const response = await fetch(bilibiliUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://www.bilibili.com',
      },
    });

    if (!response.ok) {
      throw new Error(`Bilibili API returned ${response.status}`);
    }

    const data = await response.json();

    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate');

    return res.status(200).json(data);
  } catch (error) {
    console.error('Bilibili API error:', error);
    return res.status(500).json({
      error: 'Failed to fetch suggestions',
      code: -1,
      result: { tag: [] }
    });
  }
}
