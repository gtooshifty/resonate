import { useEffect } from "react";
import axios from "axios";

export default function Callback() {
  useEffect(() => {
    const url = new URL(window.location.href);
    const code = url.searchParams.get("code");

    if (!code) {
      console.error("No Spotify authorization code found.");
      return;
    }

    axios.post("http://127.0.0.1:3000/exchange-token", { code })
      .then((res) => {
        console.log("Got Spotify tokens:", res.data);

        // Store tokens if you want (localStorage for now)
        localStorage.setItem("spotify_access_token", res.data.access_token);

        // Go home
        window.location.href = "/";
      })
      .catch((err) => {
        console.error("Token exchange failed:", err);
      });
  }, []);

  return (
    <div style={{ padding: "40px", textAlign: "center", color: "white" }}>
      Connecting to Spotify… please wait.
    </div>
  );
}
