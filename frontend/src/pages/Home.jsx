import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div id="home" className="pt-24">

      {/* HERO */}
      <section
        className="grid grid-cols-1 md:grid-cols-2 px-8 md:px-16 py-20 text-white relative overflow-hidden"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,0,0,0.55), rgba(0,0,0,0.55)), url('https://www.carte-du-monde.net/pays/mali/carte-drapeaux-mali.jpgVaFB&_nc_zt=23&_nc_ht=scontent.ftun9-1.fna&oh=00_AYB5ZpUtSYkEJAQZd3iz5f5LI3cS21HohcPkrvq9ghdkYA&oe=67699573')",
          backgroundSize: "cover",
          backgroundPosition: "center 20%",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="absolute inset-0 bg-black/40"></div>

        {/* Contenu principale du Hero */}
        <div className="relative z-10 space-y-6">
          <h1 className="text-4xl md:text-5xl font-bold leading-tight">
            Participez au Vote du Bureau des Étudiants !
          </h1>

          <p className="text-lg md:text-xl max-w-xl">
            Explorez les candidats, votez pour vos représentants et suivez les résultats en direct.
          </p>

          <div className="space-x-4">
            <Link
              to="/candidats"
              className="px-6 py-3 bg-yellow-500 rounded-lg font-semibold hover:bg-yellow-600 transition"
            >
              Voir les candidats
            </Link>

            <Link
              to="/vote"
              className="px-6 py-3 bg-white text-black rounded-lg font-semibold hover:bg-gray-200 transition"
            >
              Voter maintenant
            </Link>
          </div>
        </div>

        {/* TEXTE complémentaire */}
        <div className="relative z-10 bg-black/40 backdrop-blur p-6 md:p-10 rounded-xl shadow-lg mt-10 md:mt-0">
          <h1 className="text-4xl md:text-5xl font-bold leading-tight">
            Plateforme de Vote des <br />
            Étudiants Maliens en Tunisie
          </h1>

          <p className="mt-4 text-gray-200 text-lg">
            Un système moderne, sécurisé et transparent pour élire le Président des étudiants.
          </p>

          <div className="mt-6 flex gap-4">
            <Link
              to="/vote"
              className="bg-green-700 text-white px-5 py-3 rounded-lg hover:bg-green-800 shadow-lg transition"
            >
              Commencer à voter
            </Link>

            <Link
              to="/candidats"
              className="bg-white/20 backdrop-blur px-5 py-3 rounded-lg hover:bg-white/30 shadow-lg transition"
            >
              Voir les candidats
            </Link>
          </div>
        </div>

        {/* HEXAGONES */}
        <div className="relative z-10 hidden md:grid grid-cols-3 gap-4 mt-10">
          {[
            { titre: "Vote", lien: "/vote", texte: "Accéder au vote" },
            { titre: "Candidats", lien: "/candidats", texte: "Voir la liste" },
            { titre: "Résultats", lien: "/resultats", texte: "Voir le gagnant" },
            { titre: "À propos", lien: "/about", texte: "Infos générales" },
            { titre: "Règlement", lien: "/reglement", texte: "Consulter les règles" },
            { titre: "Contact", lien: "/contact", texte: "Nous contacter" },
          ].map((item, i) => (
            <Link
              key={i}
              to={item.lien}
              className="w-full h-32 clip-hex bg-green-700/80 hover:bg-green-800 text-white
                        flex flex-col items-center justify-center text-center p-2
                        shadow-xl backdrop-blur-sm transition"
            >
              <h3 className="font-bold text-lg">{item.titre}</h3>
              <p className="text-sm opacity-90">{item.texte}</p>
            </Link>
          ))}
        </div>

      </section>
    </div>
  );
}
