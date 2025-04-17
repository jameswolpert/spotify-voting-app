import { useEffect, useState } from "react";

const clientId = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID;
const redirectUri = "https://spotify-voting-app.vercel.app/admin";
const scope = "playlist-read-private";

export default function App() {
  const [accessToken, setAccessToken] = useState(null);
  const [playlists, setPlaylists] = useState([]);
  const [error, setError] = useState("");

  // Check for stored token or code in URL
  useEffect(() => {
    const storedToken = localStorage.getItem("spotify_access_token");
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");

    if (storedToken) {
      setAccessToken(storedToken);
    } else if (code) {
      fetch("/api/callback?code=" + code)
        .then((res) => res.json())
        .then((data) => {
          if (data.access_token) {
            setAccessToken(data.access_token);
            localStorage.setItem("spotify_access_token", data.access_token);
            window.history.replaceState({}, document.title, "/admin");
          } else {
            throw new Error("No access token returned.");
          }
        })
        .catch((err) => {
          console.error("Callback error:", err);
          setError("⚠️ Failed to complete Spotify login.");
        });
    }
  }, []);

  // Fetch playlists
  useEffect(() => {
    if (accessToken) {
      fetch("https://api.spotify.com/v1/me/playlists", {
        headers: { Authorization: "Bearer " + accessToken },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.items) {
            setPlaylists(data.items);
          } else {
            setError("⚠️ Failed to load playlists.");
          }
        })
        .catch((err) => {
          console.error("Fetch error:", err);
          setError("⚠️ Failed to load playlists.");
        });
    }
  }, [accessToken]);

  const handleSpotifyLogin = () => {
    const authUrl = new URL("https://accounts.spotify.com/authorize");
    console.log("▶️ Using client ID:", clientId); // Debug: verify client ID
    authUrl.searchParams.set("client_id", clientId);
    authUrl.searchParams.set("response_type", "code");
    authUrl.searchParams.set("redirect_uri", redirectUri);
    authUrl.searchParams.set("scope", scope);

    const finalUrl = authUrl.toString();
    console.log("🔗 Redirecting to Spotify:", finalUrl); // Debug: verify URL
    window.location = finalUrl;
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <h1 className="text-2xl font-bold mb-4">Admin – Spotify Setup</h1>

      {!accessToken && (
        <button
          onClick={handleSpotifyLogin}
          className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
        >
          Log in with Spotify
        </button>
      )}

      {accessToken && playlists.length > 0 && (
        <div className="mt-6">
          <h2 className="text-lg font-bold mb-2">Your Playlists:</h2>
          <ul className="space-y-2">
            {playlists.map((pl) => (
              <li key={pl.id} className="bg-gray-800 p-3 rounded">
                {pl.name}
              </li>
            ))}
          </ul>
        </div>
      )}

      {error && <p className="text-red-400 mt-4">{error}</p>}
    </div>
  );
}
