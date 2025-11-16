import { useEffect, useState } from "react";

const CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
const REDIRECT_URI = import.meta.env.VITE_SPOTIFY_REDIRECT_URI;
const SCOPES = "user-top-read";

export default function Home() {
  const [accessToken, setAccessToken] = useState("");
  const [topTracks, setTopTracks] = useState([]);
  const [topArtists, setTopArtists] = useState([]);
  const [genres, setGenres] = useState([]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    if (code) exchangeCodeForToken(code);
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

      window.history.replaceState({}, "", "/");

      // Fetch tracks and artists immediately
      fetchTopTracks(data.access_token);
      fetchTopArtists(data.access_token);
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

  const fetchTopArtists = async (token = accessToken) => {
    try {
      const res = await fetch("http://127.0.0.1:5000/api/spotify/top-artists", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setTopArtists(data.items || []);

      // Extract genres
      const allGenres = data.items.flatMap((artist) => artist.genres);
      setGenres([...new Set(allGenres)]); // unique genres
    } catch (err) {
      console.error("Error fetching top artists", err);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      {!accessToken ? (
        <button onClick={handleConnectSpotify}>Connect Spotify</button>
      ) : (
        <>
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
        </>
      )}
    </div>
  );
}
