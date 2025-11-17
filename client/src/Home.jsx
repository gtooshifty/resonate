import { useEffect, useState } from "react";

const CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
const REDIRECT_URI = import.meta.env.VITE_SPOTIFY_REDIRECT_URI;
const SCOPES = "user-top-read";
const BACKEND = "http://127.0.0.1:5000";

export default function Home() {
  const [accessToken, setAccessToken] = useState("");
  const [topTracks, setTopTracks] = useState([]);
  const [topArtists, setTopArtists] = useState([]);
  const [genres, setGenres] = useState([]);

  // Session state
  const [sessionId, setSessionId] = useState("");
  const [joinedSession, setJoinedSession] = useState(null);

  // Handle OAuth callback
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");

    if (code) {
      exchangeCodeForToken(code);
      window.history.replaceState({}, document.title, "/"); // clean URL
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
      const res = await fetch(`${BACKEND}/api/spotify/token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();

      if (data.access_token) {
        setAccessToken(data.access_token);
        fetchTopTracks(data.access_token);
        fetchTopArtists(data.access_token);
      } else {
        console.error("Spotify token error:", data);
      }
    } catch (err) {
      console.error("Error fetching Spotify token:", err);
    }
  };

  const fetchTopTracks = async (token = accessToken) => {
    try {
      const res = await fetch(`${BACKEND}/api/spotify/top-tracks`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setTopTracks(data.items || []);
    } catch (err) {
      console.error("Error fetching top tracks:", err);
    }
  };

  const fetchTopArtists = async (token = accessToken) => {
    try {
      const res = await fetch(`${BACKEND}/api/spotify/top-artists`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setTopArtists(data.items || []);

      // Extract genres
      const allGenres = data.items.flatMap((artist) => artist.genres || []);
      setGenres([...new Set(allGenres)]);
    } catch (err) {
      console.error("Error fetching top artists:", err);
    }
  };

  // SESSION FUNCTIONS
  const createSession = async () => {
    try {
      const res = await fetch(`${BACKEND}/api/session/create`, { method: "POST" });
      const data = await res.json();
      setSessionId(data.sessionId);
      setJoinedSession(data.sessionId);
    } catch (err) {
      console.error("Error creating session:", err);
    }
  };

  const joinSession = async () => {
    if (!sessionId.trim()) return;
    try {
      const res = await fetch(`${BACKEND}/api/session/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });
      const data = await res.json();
      if (data.sessionId) setJoinedSession(data.sessionId);
    } catch (err) {
      console.error("Error joining session:", err);
    }
  };

  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
      <h1>Resonate</h1>

      {!accessToken ? (
        <button onClick={handleConnectSpotify} style={{ padding: "10px 20px" }}>
          Connect Spotify
        </button>
      ) : (
        <>
          {/* Spotify Data */}
          <h2>Top Tracks</h2>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
            {topTracks.map((track) => (
              <div
                key={track.id}
                style={{
                  width: "200px",
                  border: "1px solid #ccc",
                  borderRadius: "8px",
                  padding: "10px",
                  textAlign: "center",
                }}
              >
                <img
                  src={track.album.images[0]?.url}
                  alt={track.name}
                  style={{ width: "100%", borderRadius: "4px" }}
                />
                <p style={{ margin: "5px 0", fontWeight: "bold" }}>{track.name}</p>
                <p style={{ margin: 0 }}>{track.artists.map((a) => a.name).join(", ")}</p>
              </div>
            ))}
          </div>

          <h2 style={{ marginTop: "30px" }}>Top Artists</h2>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
            {topArtists.map((artist) => (
              <div
                key={artist.id}
                style={{
                  width: "200px",
                  border: "1px solid #ccc",
                  borderRadius: "8px",
                  padding: "10px",
                  textAlign: "center",
                }}
              >
                <img
                  src={artist.images[0]?.url}
                  alt={artist.name}
                  style={{ width: "100%", borderRadius: "4px" }}
                />
                <p style={{ margin: "5px 0", fontWeight: "bold" }}>{artist.name}</p>
                <p style={{ margin: 0 }}>{artist.genres.join(", ")}</p>
              </div>
            ))}
          </div>

          {genres.length > 0 && (
            <>
              <h2 style={{ marginTop: "30px" }}>Genres</h2>
              <p>{genres.join(", ")}</p>
            </>
          )}

          {/* --- SESSION CREATION --- */}
          <hr style={{ margin: "30px 0" }} />
          <h2>Session</h2>
          <button onClick={createSession}>Create New Session</button>
          {sessionId && (
            <p>
              <strong>Share this code:</strong> {sessionId}
            </p>
          )}

          <div style={{ marginTop: "20px" }}>
            <input
              type="text"
              placeholder="Enter Session Code"
              value={sessionId}
              onChange={(e) => setSessionId(e.target.value.toUpperCase())}
            />
            <button onClick={joinSession}>Join</button>
          </div>

          {joinedSession && (
            <p style={{ marginTop: "10px" }}>
              Joined session <strong>{joinedSession}</strong>
            </p>
          )}
        </>
      )}
    </div>
  );
}
