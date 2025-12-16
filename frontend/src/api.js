/* ========================= CONFIG ========================= */
const API_URL = "http://172.20.10.13:4000";


/* ==================== IMPORT UTILS ======================== */
import { pdfToCSV } from "./utils/pdfToCsv.js";




/* ==================== CANDIDATS =========================== */
export async function getCandidates() {
  try {
    const res = await fetch(`${API_URL}/candidates`);
    return await res.json();
  } catch (err) {
    console.error("Erreur getCandidates:", err);
    return { candidates: [] };
  }
}

/* ================= UPLOAD VOTERS (CSV) ===================== */
export async function uploadVoters(csvFile, adminToken) {
  const formData = new FormData();
  formData.append("voters", csvFile);

  const res = await fetch(`${API_URL}/admin/upload-voters`, {
    method: "POST",
    headers: { "x-admin-token": adminToken },
    body: formData,
  });

  return res.json();
}

/* ============ UPLOAD VOTERS (PDF → CSV AUTO) =============== */
export async function uploadVotersFromPdf(pdfFile, adminToken) {
  // Convertir PDF → CSV
  const csvText = await pdfToCSV(pdfFile);

  // Transformer en fichier CSV
  const csvBlob = new Blob([csvText], { type: "text/csv" });

  // Réutiliser upload CSV
  return uploadVoters(csvBlob, adminToken);
}

/* =================== AJOUT CANDIDAT ======================== */
export async function addCandidate(formData, adminToken) {
  const res = await fetch(`${API_URL}/admin/candidates`, {
    method: "POST",
    headers: { "x-admin-token": adminToken },
    body: formData,
  });

  return res.json();
}

/* ====================== RÉSULTATS ========================== */
export async function getResults() {
  const res = await fetch(`${API_URL}/results`);
  return res.json();
}
