export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { query } = req.query;
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'YOUTUBE_API_KEY not set in Vercel env vars' });
  if (!query) return res.status(400).json({ error: 'query param required' });

  try {
    const searchRes = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&maxResults=20&regionCode=US&relevanceLanguage=en&key=${apiKey}`
    );
    const searchData = await searchRes.json();
    if (searchData.error) return res.status(400).json({ error: searchData.error.message });

    const ids = (searchData.items || []).map(i => i.id.videoId).filter(Boolean).join(',');
    if (!ids) return res.status(200).json({ items: [] });

    const statsRes = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=statistics,snippet&id=${ids}&key=${apiKey}`
    );
    const statsData = await statsRes.json();
    if (statsData.error) return res.status(400).json({ error: statsData.error.message });

    res.status(200).json(statsData);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
