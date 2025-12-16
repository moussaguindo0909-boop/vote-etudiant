import { useState, useEffect } from "react";
import { getCandidates } from "../api";

export default function Candidats() {
  const [candidats, setCandidats] = useState([]);
  const [selected, setSelected] = useState(null); // candidat sélectionné

  // Charger depuis backend
  useEffect(() => {
    getCandidates().then((data) => {
      setCandidats(data.candidates || []);
    });
  }, []);

  return (
    <div className="p-6 pt-24">
      <h1 className="text-3xl font-bold text-center mb-10">
        Liste des Candidats
      </h1>

      {/* GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {candidats.map((c) => (
          <div
            key={c.id}
            className="bg-white shadow-lg rounded-xl p-6 flex flex-col items-center text-center"
          >
            <img
              src={`${c.photo}`} // backend renvoie URL complète
              alt={c.name}
              className="w-32 h-32 rounded-full object-cover mb-4 shadow"
            />

            <h2 className="text-xl font-semibold mb-3">{c.name}</h2>

            <button
              onClick={() => setSelected(c)}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Voir son programme
            </button>
          </div>
        ))}
      </div>

      {/* MODAL PROGRAMME */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white w-11/12 max-w-lg p-6 rounded-xl shadow-xl relative">

            {/* Bouton fermer */}
            <button
              onClick={() => setSelected(null)}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 text-2xl"
            >
              ✕
            </button>

            <h2 className="text-2xl font-bold mb-4">
              Programme de {selected.name}
            </h2>

            <p className="text-gray-700 whitespace-pre-line">
              {selected.manifesto}
            </p>

            <div className="text-right mt-6">
              <button
                onClick={() => setSelected(null)}
                className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
