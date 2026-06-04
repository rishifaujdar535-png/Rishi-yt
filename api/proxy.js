export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { query } = req.query;
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'API key missing' });

  try {
    const searchRes = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&maxResults=20&regionCode=US&key=${apiKey}`);
    const searchData = await searchRes.json();

    const ids = searchData.items.map(i => i.id.videoId).join(',');
    const statsRes = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=statistics,snippet&id=${ids}&key=${apiKey}`);
    const statsData = await statsRes.json();

    res.status(200).json(statsData);
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
}
