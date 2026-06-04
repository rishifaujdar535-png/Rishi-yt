export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { query } = req.query;
  const apiKey = process.env.YOUTUBE_API_KEY;

  if (!apiKey) return res.status(500).json({ error: 'API key missing' });

  try {
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet,id&q=${encodeURIComponent(query)}&type=video&maxResults=20&regionCode=US&key=${apiKey}`;
    const r = await fetch(url);
    const data = await r.json();
    res.status(200).json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
