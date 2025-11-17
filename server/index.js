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

// -------------------------
// IN-MEMORY SESSION STORE
// -------------------------
const sessions = {};

// Create a new session
app.post("/api/session/create", (req, res) => {
  const sessionId = Math.random().toString(36).substring(2, 8).toUpperCase();
  sessions[sessionId] = { userA: null, userB: null };
  res.json({ sessionId });
});

// Join an existing session
app.post("/api/session/join", (req, res) => {
  const { sessionId } = req.body;
  if (!sessions[sessionId]) return res.status(404).json({ message: "Session not found" });
  res.json({ message: "Joined session", sessionId });
});

// Save user data to session
app.post("/api/session/save-data", (req, res) => {
  const { sessionId, user, tracks, artists } = req.body;
  if (!sessions[sessionId]) return res.status(404).json({ message: "Session not found" });
  if (user !== "userA" && user !== "userB") return res.status(400).json({ message: "Invalid user" });

  sessions[sessionId][user] = { tracks, artists };
  res.json({ message: "Data saved" });
});

// -------------------------
// SPOTIFY AUTH
// -------------------------

// Exchange code for token
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

// Fetch top tracks
app.get("/api/spotify/top-tracks", async (req, res) => {
  const accessToken = req.headers.authorization?.split(" ")[1];
  if (!accessToken) return res.status(400).json({ message: "Missing access token" });

  try {
    const response = await fetch("https://api.spotify.com/v1/me/top/tracks?limit=10", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const text = await response.text();
    res.json(JSON.parse(text));
  } catch (err) {
    console.error("Error fetching top tracks:", err);
    res.status(500).json({ message: "Failed to fetch top tracks" });
  }
});

// Fetch top artists
app.get("/api/spotify/top-artists", async (req, res) => {
  const accessToken = req.headers.authorization?.split(" ")[1];
  if (!accessToken) return res.status(400).json({ message: "Missing access token" });

  try {
    const response = await fetch("https://api.spotify.com/v1/me/top/artists?limit=10", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const text = await response.text();
    res.json(JSON.parse(text));
  } catch (err) {
    console.error("Error fetching top artists:", err);
    res.status(500).json({ message: "Failed to fetch top artists" });
  }
});

app.listen(PORT, () => console.log(`Server running on http://127.0.0.1:${PORT}`));
