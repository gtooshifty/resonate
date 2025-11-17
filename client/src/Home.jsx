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
  const [hoveredService, setHoveredService] = useState(null);

  // Session state
  const [sessionId, setSessionId] = useState("");
  const [joinedSession, setJoinedSession] = useState(null);

  // Handle OAuth callback
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");

    if (code) {
      exchangeCodeForToken(code);
      window.history.replaceState({}, document.title, "/");
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

      const allGenres = data.items.flatMap((artist) => artist.genres || []);
      setGenres([...new Set(allGenres)]);
    } catch (err) {
      console.error("Error fetching top artists:", err);
    }
  };

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

  const styles = {
    container: {
      minHeight: "100vh",
      background: "linear-gradient(135deg, #2d1b69 0%, #6b21a8 50%, #be185d 100%)",
      color: "white",
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    },
    nav: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "24px 32px",
    },
    logo: {
      display: "flex",
      alignItems: "center",
      gap: "12px",
    },
    logoIcon: {
      width: "40px",
      height: "40px",
      background: "white",
      borderRadius: "50%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "24px",
    },
    navButtons: {
      display: "flex",
      gap: "16px",
      alignItems: "center",
    },
    helpButton: {
      color: "rgba(255,255,255,0.8)",
      background: "none",
      border: "none",
      cursor: "pointer",
      padding: "8px 16px",
      fontSize: "16px",
    },
    loginButton: {
      background: "white",
      color: "#1f2937",
      padding: "10px 24px",
      borderRadius: "24px",
      fontWeight: "600",
      border: "none",
      cursor: "pointer",
    },
    main: {
      maxWidth: "1000px",
      margin: "0 auto",
      padding: "64px 32px",
    },
    heroTitle: {
      fontSize: "48px",
      fontWeight: "bold",
      textAlign: "center",
      marginBottom: "24px",
    },
    heroSubtitle: {
      fontSize: "20px",
      color: "rgba(255,255,255,0.8)",
      textAlign: "center",
      maxWidth: "700px",
      margin: "0 auto 64px",
      lineHeight: "1.6",
    },
    sectionTitle: {
      fontSize: "28px",
      fontWeight: "600",
      textAlign: "center",
      marginBottom: "32px",
    },
    servicesGrid: {
      display: "flex",
      gap: "24px",
      justifyContent: "center",
      marginBottom: "64px",
    },
    serviceCard: (service) => ({
      width: "250px",
      height: "250px",
      background: hoveredService === service 
        ? (service === "spotify" ? "#1DB954" : "linear-gradient(135deg, #fa2d55 0%, #9333ea 100%)")
        : "rgba(255,255,255,0.15)",
      backdropFilter: "blur(10px)",
      borderRadius: "24px",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: "16px",
      border: "none",
      cursor: service === "spotify" ? "pointer" : "not-allowed",
      transition: "all 0.3s ease",
      transform: hoveredService === service ? "scale(1.05)" : "scale(1)",
      opacity: service === "apple" ? 0.5 : 1,
    }),
    sessionCard: {
      background: "rgba(255,255,255,0.1)",
      backdropFilter: "blur(10px)",
      borderRadius: "16px",
      padding: "32px",
      marginTop: "64px",
    },
    createButton: {
      width: "100%",
      background: "white",
      color: "#1f2937",
      padding: "14px",
      borderRadius: "12px",
      fontWeight: "600",
      border: "none",
      cursor: "pointer",
      fontSize: "16px",
      marginBottom: "24px",
    },
    sessionCodeDisplay: {
      background: "rgba(34, 197, 94, 0.2)",
      border: "1px solid rgba(34, 197, 94, 0.5)",
      borderRadius: "12px",
      padding: "16px",
      marginBottom: "24px",
      textAlign: "center",
    },
    inputContainer: {
      display: "flex",
      gap: "12px",
    },
    input: {
      flex: 1,
      background: "rgba(255,255,255,0.1)",
      border: "1px solid rgba(255,255,255,0.2)",
      borderRadius: "12px",
      padding: "14px 16px",
      color: "white",
      fontSize: "16px",
      outline: "none",
    },
    joinButton: {
      background: "#9333ea",
      color: "white",
      padding: "14px 32px",
      borderRadius: "12px",
      fontWeight: "600",
      border: "none",
      cursor: "pointer",
      fontSize: "16px",
    },
    successMessage: {
      background: "rgba(34, 197, 94, 0.2)",
      border: "1px solid rgba(34, 197, 94, 0.5)",
      borderRadius: "12px",
      padding: "16px",
      marginTop: "16px",
      textAlign: "center",
      color: "#86efac",
    },
    tracksGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
      gap: "24px",
      marginBottom: "48px",
    },
    trackCard: {
      background: "rgba(255,255,255,0.1)",
      backdropFilter: "blur(10px)",
      borderRadius: "12px",
      padding: "16px",
      transition: "background 0.2s",
      cursor: "pointer",
    },
    trackImage: {
      width: "100%",
      aspectRatio: "1",
      objectFit: "cover",
      borderRadius: "8px",
      marginBottom: "12px",
    },
    trackName: {
      fontWeight: "600",
      fontSize: "14px",
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
      marginBottom: "4px",
    },
    trackArtist: {
      color: "rgba(255,255,255,0.6)",
      fontSize: "12px",
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
    },
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <nav style={styles.nav}>
        <div style={styles.logo}>
          <div style={styles.logoIcon}>🎵</div>
          <h1 style={{ fontSize: "24px", margin: 0, fontWeight: "bold" }}>Resonate</h1>
        </div>
        <div style={styles.navButtons}>
          <button style={styles.helpButton}>Help</button>
          <button style={styles.loginButton}>Login</button>
        </div>
      </nav>

      {/* Main Content */}
      <div style={styles.main}>
        {!accessToken ? (
          <>
            <div>
              <h2 style={styles.heroTitle}>
                Connect Your Music Services
              </h2>
              <p style={styles.heroSubtitle}>
                Bridge the gap between Apple Music and Spotify. Share your music taste and discover what resonates with your friends.
              </p>
            </div>

            <div>
              <h3 style={styles.sectionTitle}>Select your service</h3>
              
              <div style={styles.servicesGrid}>
                {/* Spotify Card */}
                <button
                  onClick={handleConnectSpotify}
                  onMouseEnter={() => setHoveredService("spotify")}
                  onMouseLeave={() => setHoveredService(null)}
                  style={styles.serviceCard("spotify")}
                >
                  <svg style={{ width: "80px", height: "80px" }} viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                  </svg>
                  <span style={{ fontSize: "24px", fontWeight: "600" }}>Spotify</span>
                </button>

                {/* Apple Music Card */}
                <button
                  onMouseEnter={() => setHoveredService("apple")}
                  onMouseLeave={() => setHoveredService(null)}
                  style={styles.serviceCard("apple")}
                  disabled
                >
                  <svg style={{ width: "80px", height: "80px" }} viewBox="0 0 24 24" fill="currentColor">
                    <path d="M23.997 6.124c0-.738-.065-1.47-.24-2.19-.317-1.31-1.062-2.31-2.18-3.043C21.003.517 20.373.285 19.7.164c-.517-.093-1.038-.135-1.564-.15-.04-.003-.083-.01-.124-.013H5.986c-.152.01-.303.017-.455.026C4.786.07 4.043.15 3.34.428 2.004.958 1.04 1.88.475 3.208c-.192.448-.292.925-.363 1.408-.056.392-.088.785-.1 1.18 0 .032-.007.062-.01.093v12.223c.01.14.017.283.027.424.05.815.154 1.624.497 2.373.65 1.42 1.738 2.353 3.234 2.801.42.127.856.187 1.293.228.555.053 1.11.06 1.667.06h11.03a12.5 12.5 0 001.57-.1c.822-.106 1.596-.35 2.296-.81a5.015 5.015 0 001.88-2.207c.186-.42.293-.87.37-1.324.113-.675.138-1.358.137-2.04-.002-3.8 0-7.595-.003-11.393zm-6.423 3.99v5.712c0 .417-.058.827-.244 1.206-.29.59-.76.962-1.388 1.14-.615.173-1.253.18-1.87.001-.385-.11-.725-.305-1.012-.596-.668-.676-.794-1.663-.308-2.5.36-.625.902-.99 1.57-1.147.41-.096.83-.14 1.25-.15.25-.007.505.01.75.05v-3.093c0-.038-.005-.077-.013-.115-.024-.1-.098-.13-.195-.125-.71.038-1.418.093-2.126.158-1.084.1-2.168.21-3.25.315-.325.032-.326.033-.327.364v7.874c0 .42-.046.832-.215 1.224-.296.676-.82 1.094-1.538 1.27-.58.142-1.174.15-1.755.03-.857-.177-1.453-.673-1.778-1.485-.13-.325-.18-.67-.177-1.017.013-1.084.589-1.826 1.63-2.1.464-.123.94-.165 1.416-.16.26.002.52.02.78.05.063.008.104-.007.104-.075V9.478c0-.085.006-.17.014-.255.02-.22.136-.313.35-.335.65-.063 1.296-.135 1.945-.2a602.166 602.166 0 015.144-.516c.148-.013.178.012.178.164-.002 1.353 0 2.706 0 4.058z"/>
                  </svg>
                  <span style={{ fontSize: "24px", fontWeight: "600" }}>Apple Music</span>
                  <span style={{ fontSize: "14px", color: "rgba(255,255,255,0.6)" }}>Coming Soon</span>
                </button>
              </div>
            </div>

            {/* Session Section */}
            <div style={styles.sessionCard}>
              <h3 style={{ ...styles.sectionTitle, marginBottom: "24px" }}>Create or Join a Session</h3>
              
              <button onClick={createSession} style={styles.createButton}>
                Create New Session
              </button>

              {sessionId && !joinedSession && (
                <div style={styles.sessionCodeDisplay}>
                  <p style={{ fontSize: "14px", margin: "0 0 8px", opacity: 0.8 }}>Share this code with friends:</p>
                  <p style={{ fontSize: "32px", fontWeight: "bold", letterSpacing: "4px", margin: 0 }}>{sessionId}</p>
                </div>
              )}

              <div style={styles.inputContainer}>
                <input
                  type="text"
                  placeholder="Enter Session Code"
                  value={sessionId}
                  onChange={(e) => setSessionId(e.target.value.toUpperCase())}
                  style={styles.input}
                />
                <button onClick={joinSession} style={styles.joinButton}>
                  Join
                </button>
              </div>

              {joinedSession && (
                <div style={styles.successMessage}>
                  <p style={{ margin: 0 }}>
                    ✓ Connected to session <strong>{joinedSession}</strong>
                  </p>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            {/* Connected State - Top Tracks */}
            <div>
              <h2 style={{ ...styles.sectionTitle, textAlign: "left", fontSize: "32px", marginBottom: "24px" }}>Your Top Tracks</h2>
              <div style={styles.tracksGrid}>
                {topTracks.map((track) => (
                  <div key={track.id} style={styles.trackCard}>
                    <img
                      src={track.album.images[0]?.url}
                      alt={track.name}
                      style={styles.trackImage}
                    />
                    <p style={styles.trackName}>{track.name}</p>
                    <p style={styles.trackArtist}>
                      {track.artists.map((a) => a.name).join(", ")}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Artists */}
            <div>
              <h2 style={{ ...styles.sectionTitle, textAlign: "left", fontSize: "32px", marginBottom: "24px" }}>Your Top Artists</h2>
              <div style={styles.tracksGrid}>
                {topArtists.map((artist) => (
                  <div key={artist.id} style={styles.trackCard}>
                    <img
                      src={artist.images[0]?.url}
                      alt={artist.name}
                      style={{ ...styles.trackImage, borderRadius: "50%" }}
                    />
                    <p style={{ ...styles.trackName, textAlign: "center" }}>{artist.name}</p>
                    <p style={{ ...styles.trackArtist, textAlign: "center" }}>
                      {artist.genres.slice(0, 2).join(", ")}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Genres */}
            {genres.length > 0 && (
              <div style={{ ...styles.sessionCard, marginTop: "24px" }}>
                <h2 style={{ ...styles.sectionTitle, textAlign: "left", fontSize: "24px", marginBottom: "16px" }}>Your Genres</h2>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  {genres.slice(0, 15).map((genre, i) => (
                    <span
                      key={i}
                      style={{
                        background: "rgba(255,255,255,0.2)",
                        padding: "8px 16px",
                        borderRadius: "24px",
                        fontSize: "14px",
                      }}
                    >
                      {genre}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Session Section for Connected State */}
            <div style={styles.sessionCard}>
              <h3 style={{ ...styles.sectionTitle, marginBottom: "24px" }}>Session</h3>
              
              <button onClick={createSession} style={styles.createButton}>
                Create New Session
              </button>

              {sessionId && !joinedSession && (
                <div style={styles.sessionCodeDisplay}>
                  <p style={{ fontSize: "14px", margin: "0 0 8px", opacity: 0.8 }}>Share this code:</p>
                  <p style={{ fontSize: "32px", fontWeight: "bold", letterSpacing: "4px", margin: 0 }}>{sessionId}</p>
                </div>
              )}

              <div style={styles.inputContainer}>
                <input
                  type="text"
                  placeholder="Enter Session Code"
                  value={sessionId}
                  onChange={(e) => setSessionId(e.target.value.toUpperCase())}
                  style={styles.input}
                />
                <button onClick={joinSession} style={styles.joinButton}>
                  Join
                </button>
              </div>

              {joinedSession && (
                <div style={styles.successMessage}>
                  <p style={{ margin: 0 }}>
                    ✓ Connected to session <strong>{joinedSession}</strong>
                  </p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}