import { useState, useEffect } from "react";
import { API_URL } from "../config";


export default function Vote() {
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    etablissement: "",
    mle: "",
    candidate_id: "",
  });

  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(false);



  useEffect(() => {
    fetch(`${API_URL}/candidates`)
      .then((res) => res.json())
      .then((data) => setCandidates(data.candidates || []))
      .catch(() => console.log("Erreur chargement candidats"));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: name === "candidate_id" ? parseInt(value) : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "❌ Erreur lors du vote");
      } else {
        alert("✅ Vote enregistré !");
      }
    } catch (err) {
      alert("❌ Erreur de connexion au serveur");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 pt-24 px-4">
      <div className="text-center mb-10">
        <img
          src="https://www.carte-du-monde.net/pays/mali/carte-drapeaux-mali.jpg"
          className="w-28 h-28 rounded-full mx-auto shadow-lg"
        />
        <h1 className="text-4xl font-bold mt-6 text-green-700">
          Élection du Président des Étudiants
        </h1>
        <p className="text-gray-600 mt-2">
          Identifiez-vous pour pouvoir voter
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="max-w-xl mx-auto bg-white shadow-xl p-8 rounded-2xl border border-gray-200 space-y-6"
      >
        {/* NOM */}
        <div>
          <label className="text-gray-700 font-semibold">Nom</label>
          <input
            name="nom"
            placeholder="Ex: Traoré"
            onChange={handleChange}
            required
            className="w-full mt-2 p-3 border rounded-lg bg-gray-50 focus:ring-2 focus:ring-green-600"
          />
        </div>

        {/* PRENOM */}
        <div>
          <label className="text-gray-700 font-semibold">Prénom</label>
          <input
            name="prenom"
            placeholder="Ex: Mohamed"
            onChange={handleChange}
            required
            className="w-full mt-2 p-3 border rounded-lg bg-gray-50 focus:ring-2 focus:ring-green-600"
          />
        </div>

        {/* ETABLISSEMENT */}
        <div>
          <label className="text-gray-700 font-semibold">Établissement</label>
          <input
            name="etablissement"
            placeholder="Nom de ton institut"
            onChange={handleChange}
            required
            className="w-full mt-2 p-3 border rounded-lg bg-gray-50 focus:ring-2 focus:ring-green-600"
          />
        </div>

        {/* MLE */}
        <div>
          <label className="text-gray-700 font-semibold">N° Matricule</label>
          <input
            name="mle"
            placeholder="Numéro MLE"
            onChange={handleChange}
            required
            className="w-full mt-2 p-3 border rounded-lg bg-gray-50 focus:ring-2 focus:ring-green-600"
          />
        </div>

        {/* CANDIDAT */}
        <div>
          <label className="text-gray-700 font-semibold">
            Choisissez un candidat
          </label>
        <select
  name="candidate_id"
  onChange={handleChange}
  required
  className="w-full mt-2 p-3 border rounded-lg bg-gray-50 focus:ring-2 focus:ring-green-600"
>
  <option value="">-- Sélectionner --</option>

  {candidates.map((c) => (
    <option key={c.id} value={c.id}>
      {c.name}
    </option>
  ))}
</select>

        </div>

        {/* BOUTON */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-700 text-white py-3 rounded-xl shadow-md hover:bg-green-800 transition font-semibold"
        >
          {loading ? "Vérification..." : "Vérifier & Voter"}
        </button>
      </form>
    </div>
  );
}
