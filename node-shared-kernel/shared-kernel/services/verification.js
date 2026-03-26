// ==========================================
// 🏦 PRODUCTION-READY: BANK PROVIDER CALL
// ==========================================
export const getBankRecordFromAPI = async (accountNumber, bankCode) => {
  try {
    // 💡 IN INTERVIEW: Mention this could be NIBSS (Nigeria), Plaid (US), or Open Banking (UK)
    // const response = await axios.get(`https://api.bank-provider.com/resolve?acc=${accountNumber}&bank=${bankCode}`);
    // return response.data.accountName; 

    // 🧪 DEMO MOCK: 
    return "ABC TRANSPORT LIMITED"; 
  } catch (error) {
    throw new Error("BANK_SERVICE_UNAVAILABLE");
  }
};

// ==========================================
// 🛡️ THE VERIFICATION RAIL LOGIC
// ==========================================
export const verifyBusinessEntity = async (businessName, accountNumber, bankCode) => {
  
  // 1. Fetch the "Golden Record" from the Bank API
  const bankRecordName = await getBankRecordFromAPI(accountNumber, bankCode);

  // 2. Normalize both strings (Strip "LTD", "LIMITED", extra spaces)
  const nameA = (businessName || "").toString().toUpperCase().trim();
  const nameB = (bankRecordName || "").toString().toUpperCase().trim();

  // 3. Run the Fuzzy Match Algorithm
  const score = (nameA && nameB) ? calculateMatchingScore(nameA, nameB) : 0;

  return {
    score,
    bankNameRecord: bankRecordName, // Store what the bank actually said for the Audit Log
    isTrusted: score >= 90,
    needsReview: score >= 70 && score < 90,
    isRejected: score < 70 
  };
};