export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  const base = "https://www.googleapis.com/youtube/v3";
  const segment = req.url.includes("search") ? "/search" : "/videos";
  const params = new URLSearchParams(req.query);
  const response = await fetch(`${base}${segment}?${params}`);
  const data = await response.json();
  res.json(data);
}
