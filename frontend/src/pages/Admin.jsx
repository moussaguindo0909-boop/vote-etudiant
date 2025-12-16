import { useState } from "react";
import { uploadVotersFromPdf, addCandidate } from "../api";
import { pdfToCSV } from "../utils/pdfToCsv";  // <- OK

export default function Admin() {
  const [adminToken, setAdminToken] = useState("");
  const [pdfFile, setPdfFile] = useState(null);
  const [candidateName, setCandidateName] = useState("");
  const [manifesto, setManifesto] = useState("");
  const [photo, setPhoto] = useState(null);
  const [message, setMessage] = useState("");

  /* ---------------------- TEST CONVERSION PDF ---------------------- */
  const testPdfConversion = async () => {
    if (!pdfFile) {
      console.log("Aucun PDF sélectionné.");
      return;
    }

    try {
      const csv = await pdfToCSV(pdfFile); // <- FIX ici
      console.log("====== CSV GÉNÉRÉ ======");
      console.log(csv);
    } catch (err) {
      console.error("🔴 ERREUR PARSING PDF :", err);
    }
  };

  /* ------------------------- UPLOAD PDF ------------------------- */
  const handleUploadPDF = async () => {
    if (!pdfFile) return setMessage("❌ Choisis un fichier PDF !");

    try {
      const res = await uploadVotersFromPdf(pdfFile, adminToken);
      setMessage(JSON.stringify(res, null, 2));
    } catch (err) {
      console.error("🔴 ERREUR IMPORT PDF :", err);
      setMessage("❌ Erreur lors de l'import PDF : " + err.message);
    }
  };

  /* --------------------- AJOUT CANDIDAT ------------------------ */
  const handleAddCandidate = async () => {
    if (!candidateName) return setMessage("❌ Nom du candidat manquant !");
    if (!photo) return setMessage("❌ Une photo est obligatoire !");

    const formData = new FormData();
    formData.append("name", candidateName);
    formData.append("manifesto", manifesto);
    formData.append("photo", photo);

    try {
      const res = await addCandidate(formData, adminToken);
      setMessage(JSON.stringify(res, null, 2));
    } catch (err) {
      setMessage("❌ Erreur lors de l'ajout du candidat");
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 mt-10">
      <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">
        🛡️ Admin Panel
      </h1>

      {/* TOKEN */}
      <div className="mb-8 p-5 bg-white shadow rounded-lg">
        <label className="block font-semibold mb-2 text-gray-700">
          Admin Token
        </label>
        <input
          type="password"
          className="w-full p-3 border rounded-lg"
          value={adminToken}
          onChange={(e) => setAdminToken(e.target.value)}
          placeholder="Entrez votre token admin"
        />
      </div>

      {/* IMPORT PDF */}
      <div className="p-5 bg-white shadow rounded-lg mb-8">
        <h2 className="text-xl font-bold mb-4">📥 Importer les électeurs (PDF)</h2>

        <input
          type="file"
          accept="application/pdf"
          onChange={(e) => setPdfFile(e.target.files[0])}
        />

        <button
          onClick={handleUploadPDF}
          className="w-full mt-3 py-2 bg-blue-600 text-white rounded-lg"
        >
          Importer le fichier PDF
        </button>

        {/* Bouton test PDF */}
        <button
          onClick={testPdfConversion}
          className="w-full mt-3 py-2 bg-gray-700 text-white rounded-lg"
        >
          🔍 Tester conversion PDF → CSV
        </button>
      </div>

      {/* AJOUT CANDIDAT */}
      <div className="p-5 bg-white shadow rounded-lg">
        <h2 className="text-xl font-bold mb-4">🧑‍💼 Ajouter un candidat</h2>

        <input
          type="text"
          className="w-full p-3 border rounded-lg mb-3"
          placeholder="Nom du candidat"
          value={candidateName}
          onChange={(e) => setCandidateName(e.target.value)}
        />

        <textarea
          className="w-full p-3 border rounded-lg mb-3"
          placeholder="Programme"
          value={manifesto}
          onChange={(e) => setManifesto(e.target.value)}
        />

        <input
          type="file"
          accept="image/*"
          onChange={(e) => setPhoto(e.target.files[0])}
          className="mb-3"
        />

        <button
          onClick={handleAddCandidate}
          className="w-full py-2 bg-green-600 text-white rounded-lg"
        >
          Ajouter le candidat
        </button>
      </div>

      {/* MESSAGE */}
      {message && (
        <pre className="mt-8 p-4 bg-gray-100 rounded-lg whitespace-pre-wrap">
          {message}
        </pre>
      )}
    </div>
  );
}
