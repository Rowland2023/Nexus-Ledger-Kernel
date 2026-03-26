import { calculateMatchingScore } from '../utils/matching.js';

export const verifyBusinessEntity = async (businessName, bankRecordName) => {
  // 🧼 NORMALIZATION: Ensure case-insensitivity and remove trailing spaces
  const nameA = (businessName || "").toString().toUpperCase().trim();
  const nameB = (bankRecordName || "").toString().toUpperCase().trim();

  // If both are empty, it's a fail (0)
  const score = (nameA && nameB) ? calculateMatchingScore(nameA, nameB) : 0;

  return {
    score,
    isTrusted: score >= 90,
    needsReview: score >= 70 && score < 90,
    isRejected: score < 70 // 400 Error triggered if < 70
  };
};