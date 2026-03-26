// infrastructure/ukOpenBanking.js
export const verifyUKPayee = async (accountNumber, sortCode, businessName) => {
  // Mocking the Open Banking CoP Request
  const response = await fetch('https://api.truelayer.com/verification/v1/verify', {
    method: 'POST',
    body: JSON.stringify({ account_number: accountNumber, sort_code: sortCode, name: businessName })
  });
  return await response.json(); 
  // Returns: { result: "MATCH" | "CLOSE_MATCH" | "NO_MATCH", score: 0-100 }
};