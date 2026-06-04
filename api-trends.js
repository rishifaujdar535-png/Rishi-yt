export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { topics } = req.query;
  if (!topics) return res.status(400).json({ error: 'topics required' });

  try {
    const topicList = JSON.parse(topics);
    
    // Google Trends via unofficial API
    const keyword = topicList.join(',');
    const url = `https://trends.google.com/trends/api/explore?hl=en-US&tz=-300&req={"comparisonItem":${JSON.stringify(topicList.map(t => ({keyword:t,geo:"US",time:"today 3-m"})))},"category":0,"property":"youtube"}`;
    
    const r = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    const text = await r.text();
    const json = JSON.parse(text.replace(")]}',\n", ''));
    
    const widgets = json.widgets || [];
    const timeWidget = widgets.find(w => w.id === 'TIMESERIES');
    
    if (!timeWidget) throw new Error('No trend data');

    // Get timeline data
    const dataUrl = `https://trends.google.com/trends/api/widgetdata/multiline?hl=en-US&tz=-300&req=${encodeURIComponent(JSON.stringify(timeWidget.request))}&token=${timeWidget.token}`;
    const dataRes = await fetch(dataUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    const dataText = await dataRes.text();
    const dataJson = JSON.parse(dataText.replace(")]}',\n", ''));

    const timelineData = dataJson?.default?.timelineData || [];
    
    const results = topicList.map((topic, idx) => {
      const vals = timelineData.map(point => ({
        date: point.formattedTime || '',
        value: point.value?.[idx] || 0
      }));
      const avg = vals.length ? Math.round(vals.reduce((a,b) => a+b.value, 0) / vals.length) : 0;
      return { topic, timeline: vals.slice(-8), avg };
    });

    res.status(200).json({ results });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
