export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") { res.status(200).end(); return; }

  const { endpoint, ...params } = req.query;
  if (!endpoint) { res.status(400).json({ error: "endpoint required" }); return; }

  const validEndpoints = ["search", "videos", "channels"];
  if (!validEndpoints.includes(endpoint)) { res.status(400).json({ error: "invalid endpoint" }); return; }

  try {
    const qs = new URLSearchParams(params).toString();
    const url = `https://www.googleapis.com/youtube/v3/${endpoint}?${qs}`;
    const response = await fetch(url);
    const data = await response.json();
    res.status(200).json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
