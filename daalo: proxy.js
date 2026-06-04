const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");
const app = express();

app.use(cors());

app.get("/search", async (req, res) => {
  try {
    const url = `https://www.googleapis.com/youtube/v3/search?${new URLSearchParams(req.query)}`;
    const r = await fetch(url);
    res.json(await r.json());
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get("/videos", async (req, res) => {
  try {
    const url = `https://www.googleapis.com/youtube/v3/videos?${new URLSearchParams(req.query)}`;
    const r = await fetch(url);
    res.json(await r.json());
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.listen(3000, () => console.log("Proxy running!"));
