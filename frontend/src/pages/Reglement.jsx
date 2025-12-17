export default function Reglement() {
  return (
    <div className="pt-24 px-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-gray-900">
        Règlement de l'AMEST
      </h1>

      {/* Bouton pour ouvrir le PDF */}
      <div className="mt-8">
        <a
          href="/reglement.pdf"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow hover:bg-blue-700 transition"
        >
          📄 Ouvrir le règlement (PDF)
        </a>
      </div>
    </div>
  );
}
