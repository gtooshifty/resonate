import { useEffect, useState } from "react";

const CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
const REDIRECT_URI = import.meta.env.VITE_SPOTIFY_REDIRECT_URI;
const SCOPES = "user-top-read";

export default function Home() {
  const [accessToken, setAccessToken] = useState("");
  const [topTracks, setTopTracks] = useState([]);

  // Handle OAuth redirect
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    if (code) {
      exchangeCodeForToken(code);
    }
  }, []);

  const handleConnectSpotify = () => {
    const authUrl = `https://accounts.spotify.com/authorize?response_type=code&client_id=${CLIENT_ID}&scope=${encodeURIComponent(
      SCOPES
    )}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}`;
    window.location.href = authUrl;
  };

  const exchangeCodeForToken = async (code) => {
    try {
      const res = await fetch("http://127.0.0.1:5000/api/spotify/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      setAccessToken(data.access_token);

      // Clear URL
      window.history.replaceState({}, "", "/");

      // Immediately fetch top tracks
      fetchTopTracks(data.access_token);
    } catch (err) {
      console.error("Error fetching Spotify token", err);
    }
  };

  const fetchTopTracks = async (token = accessToken) => {
    try {
      const res = await fetch("http://127.0.0.1:5000/api/spotify/top-tracks", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setTopTracks(data.items || []);
    } catch (err) {
      console.error("Error fetching top tracks", err);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      {!accessToken ? (
        <button onClick={handleConnectSpotify}>Connect Spotify</button>
      ) : (
        <>
          <h2>Your Top Tracks</h2>
          <ul style={{ marginTop: "20px" }}>
            {topTracks.map((track) => (
              <li key={track.id}>
                {track.name} — {track.artists.map((a) => a.name).join(", ")}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
