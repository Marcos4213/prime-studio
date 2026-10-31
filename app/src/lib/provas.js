// Contagem de pacientes não desce para legenda, anúncio, imagem nem WhatsApp.
// Vale para o texto já gravado, inclusive grafia solta ("100mil", "paciêntes").

const COUNT =
  /(?:\b(?:mais|cerca|quase|acima)\s+de\s+|\b(?:uns|umas)\s+)?\d[\d.\s]*?(?:\s*mil(?:h(?:ao|ão|oes|ões))?|\s*milh(?:ao|ão|oes|ões))?\s*paci[eê]ntes?\b/gi;

const WORDS = /\b(?:milhares|centenas|dezenas)\s+de\s+paci[eê]ntes?\b/gi;

export function stripPatientCounts(text) {
  let s = String(text ?? "");
  s = s.replace(COUNT, " ");
  s = s.replace(WORDS, " ");
  s = s.replace(/[ \t]{2,}/g, " ");
  s = s.replace(/\s+([,.;:!?])/g, "$1");
  s = s.replace(/([.!?])[.!?]+/g, "$1");
  s = s.replace(/(^|\n)\s*[,.;:]+\s*/g, "$1");
  return s.replace(/[ \t]+\n/g, "\n").trim();
}

export function provasForPiece(text) {
  return stripPatientCounts(text);
}
