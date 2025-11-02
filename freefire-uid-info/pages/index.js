import { useState } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";

const CharacterCanvas = dynamic(() => import("../components/CharacterCanvas"), { ssr: false });

export default function Home() {
  const [uid, setUid] = useState("");
  const [playerData, setPlayerData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchPlayerInfo = async () => {
    if (!uid) return;
    setLoading(true);
    setError("");
    setPlayerData(null);
    try {
      const res = await fetch(`https://info-by-wotax-dev.vercel.app/info?uid=${uid}`);
      const data = await res.json();
      if (data.error) setError("⚠️ UID not found!");
      else setPlayerData(data);
    } catch {
      setError("❌ Failed to fetch info!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 text-white p-4">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-2">🔥 Free Fire UID Info 🔥</h1>
        <p className="text-lg text-gray-200">Enter UID to get player details 🎮</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-2 items-center">
        <input
          type="text"
          placeholder="Enter Free Fire UID"
          value={uid}
          onChange={(e) => setUid(e.target.value)}
          className="px-4 py-2 rounded-xl text-black w-64 outline-none"
        />
        <button
          onClick={fetchPlayerInfo}
          className="px-6 py-2 bg-yellow-400 text-black font-bold rounded-xl hover:bg-yellow-300 transition"
        >
          {loading ? "Loading..." : "Search 🔍"}
        </button>
      </div>

      {error && <p className="mt-4 text-red-400">{error}</p>}

      {playerData && (
        <div className="mt-10 bg-white/10 p-6 rounded-2xl shadow-lg backdrop-blur-md w-full max-w-md text-center animate-fadeIn">
          <h2 className="text-2xl font-bold mb-2 text-yellow-300">{playerData.nickname}</h2>
          <p className="text-gray-200">UID: {playerData.uid}</p>
          <p className="text-gray-300">Level: {playerData.level}</p>
          <p className="text-gray-300">Rank: {playerData.rank}</p>

          {playerData.dress_image && (
            <div className="flex justify-center mt-6">
              <img
                src={playerData.dress_image}
                alt="Player Dress"
                className="rounded-xl shadow-lg w-48 h-48 object-cover border-4 border-yellow-400"
              />
            </div>
          )}

          <p className="mt-4 text-sm text-gray-300">
            👕 Outfit: {playerData.outfit_name || "Not Available"}
          </p>
        </div>
      )}
          {/* 3D Character preview using Three.js - shows outfit texture on torso */}
          <div className="mt-6">
            <CharacterCanvas dressUrl={playerData.dress_image} />
          </div>

      <div className="mt-10 text-center">
        <div className="inline-block p-2 rounded-2xl shadow-lg developer-badge">
          <p className="text-yellow-300 text-lg font-semibold">👨‍💻 <span className="developer-name">Developer: Arjun</span></p>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.6s ease-in-out;
        }
      `}</style>
    </div>
  );
}
