import natural from 'natural'; // ✅ FIXED: Added missing import

/**
 * 🧼 NORMALIZATION UTILITY
 * Strips punctuation, business suffixes, and extra whitespace
 */
const normalize = (str) => {
  return str
    .toLowerCase()
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "") // Remove punctuation
    .replace(/\b(limited|ltd|incorporated|inc|corp|corporation|and)\b/g, "") // Strip suffixes
    .trim()
    .replace(/\s+/g, " "); // Collapse multiple spaces
};

/**
 * 🧮 CALCULATION LOGIC
 * Uses Jaro-Winkler for high-integrity business name matching
 */
export const calculateMatchingScore = (inputName, bankName) => {
  if (!inputName || !bankName) return 0;
  
  const cleanInput = normalize(inputName);
  const cleanBank = normalize(bankName);

  // ⚡ Fast path for exact matches after normalization
  if (cleanInput === cleanBank) return 100;

  try {
    // 📏 Jaro-Winkler is ideal for short strings (Business Names)
    const jaroScore = natural.JaroWinklerDistance(cleanInput, cleanBank);
    return Math.round(jaroScore * 100);
  } catch (error) {
    console.error('⚠️ [Matching Utility] calculation failed:', error.message);
    return 0; // Safe fallback to prevent system crash
  }
};