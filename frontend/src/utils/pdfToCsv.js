import { getDocument, GlobalWorkerOptions } from "pdfjs-dist";
import pdfWorker from "./pdfWorker.js";

GlobalWorkerOptions.workerSrc = pdfWorker;

export async function pdfToCSV(file) {
  const arrayBuffer = await file.arrayBuffer();

  const pdf = await getDocument({
    data: arrayBuffer,
    useWorker: true,
  }).promise;

  let raw = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const parts = content.items.map((i) => i.str.trim());

    raw.push(...parts);
  }

  raw = raw.filter((t) => t !== "");

  let entries = [];
  let buffer = [];

  raw.forEach((txt) => {
    buffer.push(txt);
    if (/AMS-\d+/i.test(txt)) {
      entries.push([...buffer]);
      buffer = [];
    }
  });

  const csvLines = entries.map((row) => {
    const mle = row.find((x) => /AMS-\d+/.test(x)) || "";
    const idx = row.indexOf(mle);
    const clean = row.slice(0, idx);

    const nom = clean[0] || "";
    const prenom = clean[1] || "";
    const etablissement = clean.slice(2).join(" ").replace(/\s+/g, " ");

    return `${nom},${prenom},${etablissement},${mle}`;
  });

  return "NOM,PRENOM,ETABLISSEMENT,MATRICULE\n" + csvLines.join("\n");
}
