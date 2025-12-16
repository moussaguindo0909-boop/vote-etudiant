import { useEffect, useState } from "react";

export default function Results() {
  const [results, setResults] = useState([]);
  const [winner, setWinner] = useState(null);
  const [totalVotes, setTotalVotes] = useState(0);
  const [timeLeft, setTimeLeft] = useState({ finished: false });

  // === 🕒 FIN DU VOTE ===
  const END_DATE = new Date("2026-01-01T00:00:00").getTime();

  // === ⏳ COMPTE À REBOURS ===
  useEffect(() => {
  const updateCountdown = () => {
    const now = Date.now();
    const diff = END_DATE - now;

    if (diff <= 0) {
      setTimeLeft({
        days: "00",
        hours: "00",
        minutes: "00",
        seconds: "00",
        finished: true,
      });
      return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / 1000 / 60) % 60);
    const seconds = Math.floor((diff / 1000) % 60);

    setTimeLeft({
      days: days.toString().padStart(2, "0"),
      hours: hours.toString().padStart(2, "0"),
      minutes: minutes.toString().padStart(2, "0"),
      seconds: seconds.toString().padStart(2, "0"),
      finished: false,
    });
  };

  updateCountdown(); // 1ère mise à jour immédiate
  const interval = setInterval(updateCountdown, 1000);

  return () => clearInterval(interval);
}, []);


  // === 📊 Chargement des résultats (quand fini) ===
  useEffect(() => {
    if (!timeLeft.finished) return; // ⛔️ On NE charge PAS les résultats avant la fin

    const loadResults = () => {
      fetch("http://localhost:4000/results")
        .then((res) => res.json())
        .then((data) => {
          setResults(data.results || []);
          setWinner(data.winner || null);
          setTotalVotes(data.totalVotes || 0);
        })
        .catch(() => console.log("Backend non disponible"));
    };

    // Charger une fois dès que fini
    loadResults();
  }, [timeLeft.finished]);

  return (
    <div className="max-w-2xl mx-auto text-center p-6 pt-24">
      <h1 className="text-3xl font-bold mb-4">Résultats des élections</h1>

      {/* === ⏳ Avant la fin du vote : afficher le timer === */}
      {!timeLeft.finished ? (
        <div className="my-8">
          <h2 className="text-xl font-bold mb-3">Résultats disponibles dans :</h2>

          <div className="flex justify-center gap-4 text-white text-2xl font-bold">
            <div className="bg-green-700 px-4 py-3 rounded-lg shadow-lg">
              {timeLeft.days}
              <span className="text-sm font-normal block">jours</span>
            </div>

            <div className="bg-yellow-500 px-4 py-3 rounded-lg shadow-lg">
              {timeLeft.hours}
              <span className="text-sm font-normal block">heures</span>
            </div>

            <div className="bg-red-600 px-4 py-3 rounded-lg shadow-lg">
              {timeLeft.minutes}
              <span className="text-sm font-normal block">minutes</span>
            </div>

            <div className="bg-black px-4 py-3 rounded-lg shadow-lg">
              {timeLeft.seconds}
              <span className="text-sm font-normal block">secondes</span>
            </div>
          </div>
        </div>
      ) : (
        <div>
          <div className="text-green-600 text-3xl font-extrabold mt-6">
            🎉 Les résultats sont maintenant disponibles !
          </div>

          {/* === 🏆 Gagnant === */}
          {winner && (
            <div className="p-4 mb-6 bg-green-100 border-l-4 border-green-600 rounded">
              <h2 className="text-xl font-bold">Gagnant : {winner.name}</h2>
              <p className="text-green-700 font-semibold">{winner.percent}% des votes</p>
            </div>
          )}

          {/* === 📊 Répartition === */}
          <h3 className="text-lg font-semibold mb-4">Répartition des votes</h3>

          <div className="space-y-4">
            {results.map((candidat) => (
              <div key={candidat.id}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium">{candidat.name}</span>
                  <span>{candidat.percent}%</span>
                </div>

                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-blue-500 h-full transition-all duration-700"
                    style={{ width: `${candidat.percent}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>

          <p className="mt-6 text-gray-600">Nombre total de votes : {totalVotes}</p>
        </div>
      )}
    </div>
  );
}
