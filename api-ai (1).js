export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { topic, type } = req.body || {};
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'ANTHROPIC_API_KEY not set in Vercel env vars' });
  if (!topic) return res.status(400).json({ error: 'topic required' });

  const prompts = {
    '60s Hook': `Write a powerful 60-second YouTube video hook for US audience about: "${topic}". Make it psychologically gripping, use pattern interrupts, and make viewers unable to stop watching. Format: Hook line → Problem agitation → Promise. Keep it under 150 words.`,
    'Full Script': `Write a complete YouTube video script for US audience about: "${topic}". Include: Hook (0-30s), Main content with 3 key points, Story/example, Call to action. Aim for ~8-10 minute video. Use conversational American English.`,
    'Title Ideas': `Generate 10 viral YouTube title ideas for US audience about: "${topic}". Mix curiosity gaps, numbers, emotional triggers, and power words. Focus on psychology content that gets clicks. Format as numbered list.`,
    'Thumbnail Text': `Generate 5 thumbnail text options for a YouTube video about: "${topic}". Each should be: 3-5 words max, high contrast readable, emotionally charged, curiosity-inducing. Also suggest color scheme and visual concept for each.`
  };

  const prompt = prompts[type] || prompts['60s Hook'];

  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1024,
        messages: [{ role: 'user', content: prompt }]
      })
    });
    const data = await r.json();
    if (data.error) return res.status(400).json({ error: data.error.message });
    res.status(200).json({ result: data.content[0].text });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
