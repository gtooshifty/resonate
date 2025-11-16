import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 5000;
const { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, REDIRECT_URI } = process.env;

// Endpoint to exchange authorization code for access token
app.post("/api/spotify/token", async (req, res) => {
  const { code } = req.body;
  if (!code) return res.status(400).json({ message: "Missing code" });

  const basicAuth = Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString("base64");

  try {
    const response = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        Authorization: `Basic ${basicAuth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: REDIRECT_URI,
      }),
    });

    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error("Error exchanging code for token:", err);
    res.status(500).json({ message: "Failed to exchange token" });
  }
});

// Endpoint to fetch top tracks
app.get("/api/spotify/top-tracks", async (req, res) => {
  const accessToken = req.headers.authorization?.split(" ")[1];
  if (!accessToken) return res.status(400).json({ message: "Missing access token" });

  try {
    const response = await fetch("https://api.spotify.com/v1/me/top/tracks?limit=10", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const text = await response.text();
    try {
      const data = JSON.parse(text);
      res.json(data);
    } catch (parseErr) {
      console.error("Failed to parse Spotify response:", parseErr);
      res.status(500).json({ message: "Invalid JSON from Spotify", raw: text });
    }
  } catch (err) {
    console.error("Error fetching top tracks:", err);
    res.status(500).json({ message: "Failed to fetch top tracks" });
  }
});

app.get("/api/spotify/top-artists", async (req, res) => {
  const accessToken = req.headers.authorization?.split(" ")[1];
  if (!accessToken) return res.status(400).json({ message: "Missing access token" });

  try {
    const response = await fetch("https://api.spotify.com/v1/me/top/artists?limit=10", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const text = await response.text();
    try {
      const data = JSON.parse(text);
      res.json(data);
    } catch (parseErr) {
      res.status(500).json({ message: "Invalid JSON from Spotify", raw: text });
    }
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch top artists", error: err });
  }
});


app.listen(PORT, () => console.log(`Server running on http://127.0.0.1:${PORT}`));
