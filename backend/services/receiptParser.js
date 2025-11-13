// Extract storeName, date, total; keep raw lines for further processing
export function parseReceiptText(text) {
  // Split text into non-empty trimmed lines
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  const storeName = lines[0] || "Unknown Store"; // Assume first line is store name

  // --- DATE DETECTION ---
  const dateRegexes = [
    /\b(\d{2}[\/-]\d{2}[\/-]\d{4})\b/, // DD/MM/YYYY or DD-MM-YYYY
    /\b(\d{4}[\/-]\d{2}[\/-]\d{2})\b/, // YYYY/MM/DD or YYYY-MM-DD
  ];

  let date = null;
  for (const r of dateRegexes) {
    const m = lines.join(" ").match(r);
    if (m) {
      const val = m[1].replace(/\//g, "-");
      // Normalize date to YYYY-MM-DD
      date = /^\d{4}-/.test(val)
        ? val
        : val.replace(/(\d{2})-(\d{2})-(\d{4})/, "$3-$2-$1");
      break;
    }
  }

  // --- TOTAL DETECTION ---
  let total = null;
  const totalRegexes = [
    /(grand\s*total|total\s*amount|amount\s*due|total)\s*[:\-]?\s*([\d.,]+)/i,
    /^\s*(TOTAL)\s*[:\-]?\s*([\d.,]+)/i,
  ];

  // Try regexes line by line
  for (const r of totalRegexes) {
    for (const line of lines) {
      const m = line.match(r);
      if (m) {
        total = parseFloat(m[2].replace(/[^\d.]/g, ""));
        break;
      }
    }
    if (total != null) break;
  }

  // Fallback: line after TOTAL keyword
  if (total == null) {
    for (let i = 0; i < lines.length; i++) {
      if (/total/i.test(lines[i])) {
        for (let j = i + 1; j < lines.length; j++) {
          const num = parseFloat(lines[j].replace(/[^\d.]/g, ""));
          if (!isNaN(num)) {
            total = num;
            break;
          }
        }
        if (total != null) break;
      }
    }
  }

  // Fallback: last numeric line
  if (total == null) {
    for (let i = lines.length - 1; i >= 0; i--) {
      const num = parseFloat(lines[i].replace(/[^\d.]/g, ""));
      if (!isNaN(num)) {
        total = num;
        break;
      }
    }
  }

  return { storeName, date, total, rawLines: lines }; // Return extracted data
}

// --- SIMPLE CATEGORY DETECTION ---
// Detect category based on store name or content lines
export function categorizeExpense(storeName, lines) {
  const blob = lines.join(" ");

  if (/supermarket|grocery|mart|walmart|big bazaar|d-mart/i.test(storeName))
    return "Groceries";
  if (/restaurant|resto|cafe|coffee|starbucks|pizza|kfc|mcdonald/i.test(blob))
    return "Dining";
  if (/uber|ola|rapido|cab|taxi|bus|metro|train|fuel|petrol/i.test(blob))
    return "Transport";
  if (/netflix|prime|hotstar|ticket|cinema|movie|ott/i.test(blob))
    return "Entertainment";
  if (/electric|internet|mobile|postpaid|broadband|bill/i.test(blob))
    return "Bills";
  if (/amazon|mall|fashion|shoe|clothes|apparel|zara|h&m/i.test(blob))
    return "Shopping";

  return "Other"; // Default category if none match
}
