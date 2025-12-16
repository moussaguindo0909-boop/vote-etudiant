import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

export default function Avbar() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogoDoubleClick = () => {
    navigate("/admin"); // 🔐 Accès admin secret
  };

  return (
    <header className="bg-white/80 backdrop-blur-md shadow-md fixed top-0 w-full z-50">
      <div className="max-w-7xl mx-auto flex justify-between items-center px-6 py-3">

        {/* LOGO (double click admin) */}
        <div className="flex items-center gap-3">
          <img
            src="https://www.carte-du-monde.net/pays/mali/carte-drapeaux-mali.jpg"
            alt="Logo AMEST"
            className="w-12 h-12 rounded-full object-cover shadow-md border cursor-pointer"
            onDoubleClick={handleLogoDoubleClick}
          />
          <div className="flex flex-col leading-tight select-none">
            <span className="font-bold text-gray-900 text-lg tracking-wide">
              AMEST
            </span>
            <span className="text-sm text-gray-500">
              Plateforme de Vote
            </span>
          </div>
        </div>

        {/* MENU DESKTOP */}
        <nav className="hidden md:flex items-center gap-8 text-gray-700 font-medium">
          <Link className="hover:text-green-600 transition" to="/">Accueil</Link>
          <Link className="hover:text-green-600 transition" to="/vote">Vote</Link>
          <Link className="hover:text-green-600 transition" to="/candidats">Candidats</Link>
          <Link className="hover:text-green-600 transition" to="/resultats">Résultats</Link>
          <Link className="hover:text-green-600 transition" to="/reglement">Règlement</Link>
          <Link className="hover:text-green-600 transition" to="/apropos">À propos</Link>


          <Link
            to="/contact"
            className="bg-red-600 hover:bg-red-700 transition text-white px-4 py-2 rounded-lg shadow">
            Nous contacter
          </Link>
        </nav>

        {/* MOBILE BUTTON */}
        <button
          className="md:hidden text-3xl text-gray-800"
          onClick={() => setOpen(!open)}
        >
          ☰
        </button>

      </div>

      {/* MENU MOBILE */}
      {open && (
        <nav className="md:hidden bg-white shadow-md flex flex-col px-6 py-4 gap-4 text-gray-700 font-medium">
          <Link to="/" onClick={() => setOpen(false)}>Accueil</Link>
          <Link to="/vote" onClick={() => setOpen(false)}>Vote</Link>
          <Link to="/candidats" onClick={() => setOpen(false)}>Candidats</Link>
          <Link to="/resultats" onClick={() => setOpen(false)}>Résultats</Link>
          <Link to="/reglement" onClick={() => setOpen(false)}>Règlement</Link>
          <Link to="/apropos" onClick={() => setOpen(false)}>À propos</Link>

          <Link
            to="/contact"
            className="bg-red-600 text-white px-4 py-2 rounded-lg shadow"
            onClick={() => setOpen(false)}>
            Nous contacter
          </Link>
        </nav>
      )}

    </header>
  );
}
