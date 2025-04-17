
import { useEffect, useState } from "react";

const clientId = "b8a2137f3e61400682ed3d2f8f001016";
const redirectUri = "https://spotify-voting-app.vercel.app/admin";
const scope = "playlist-read-private";

export default function App() {
  const [accessToken, setAccessToken] = useState(null);
  const [playlists, setPlaylists] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const hashParams = new URLSearchParams(window.location.search);
    const code = hashParams.get("code");

    if (code && !accessToken) {
      fetch("/api/callback?code=" + code)
        .then((res) => res.json())
        .then((data) => {
          setAccessToken(data.access_token);
          window.history.replaceState({}, document.title, "/admin");
        })
        .catch((err) => {
          console.error("Callback error:", err);
          setError("Failed to complete Spotify login.");
        });
    }
  }, [accessToken]);

  useEffect(() => {
    if (accessToken) {
      fetch("https://api.spotify.com/v1/me/playlists", {
        headers: { Authorization: "Bearer " + accessToken },
      })
        .then((res) => res.json())
        .then((data) => setPlaylists(data.items || []))
        .catch((err) => {
          console.error("Fetch error:", err);
          setError("Failed to load playlists.");
        });
    }
  }, [accessToken]);

  const handleSpotifyLogin = () => {
    const authUrl = new URL("https://accounts.spotify.com/authorize");
    authUrl.searchParams.set("client_id", clientId);
    authUrl.searchParams.set("response_type", "code");
    authUrl.searchParams.set("redirect_uri", redirectUri);
    authUrl.searchParams.set("scope", scope);
    window.location = authUrl.toString();
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

      {error && <p className="text-red-400 mt-4">⚠️ {error}</p>}
    </div>
  );
}
