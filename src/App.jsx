
import { useState } from "react";

export default function App() {
  const [name, setName] = useState("");
  const [adminId, setAdminId] = useState("admin-001"); //redeploy
  const [response, setResponse] = useState(null);
  const [error, setError] = useState("");

  const createSession = async () => {
    setError("");
    const res = await fetch("/api/create-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, admin_id: adminId }),
    });

    try {
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Unknown error");
      setResponse(data.session);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <h1 className="text-3xl font-bold mb-4">Admin Portal</h1>

      <div className="mb-4">
        <label className="block text-sm mb-1">Session Name</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="p-2 rounded bg-gray-800 border border-gray-600 w-full"
          placeholder="e.g. Wedding Party"
        />
      </div>

      <button
        onClick={createSession}
        className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
      >
        Start New Session
      </button>

      {error && <p className="text-red-400 mt-4">⚠️ {error}</p>}

      {response && (
        <div className="mt-6 p-4 bg-gray-800 rounded">
          <h2 className="text-xl mb-2">🎉 Session Created!</h2>
          <p><strong>Name:</strong> {response.name}</p>
          <p><strong>PIN:</strong> {response.pin}</p>
          <p><strong>Admin ID:</strong> {response.admin_id}</p>
        </div>
      )}
    </div>
  );
}
