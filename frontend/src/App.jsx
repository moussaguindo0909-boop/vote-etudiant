import { BrowserRouter, Routes, Route } from "react-router-dom";
import Avbar from "./components/Avbar";
import Home from "./pages/Home";
import Admin from "./pages/Admin";
import Vote from "./pages/Vote";
import Candidats from "./pages/Candidats";
import Resultats from "./pages/Resultats";
import Contact from "./pages/Contact";
import Reglement from "./pages/Reglement";
import Apropos from "./pages/Apropos";


function App() {
  return (
    <BrowserRouter>
      <Avbar />

      <div className="pt-20">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/vote" element={<Vote />} />
          <Route path="/candidats" element={<Candidats />} />
          <Route path="/resultats" element={<Resultats />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/reglement" element={<Reglement />} />
          <Route path="/apropos" element={<Apropos />} />


        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
