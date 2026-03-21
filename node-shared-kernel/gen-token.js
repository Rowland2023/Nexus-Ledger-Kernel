// generate-token.js
import 'dotenv/config'; 
import { generateToken } from './shared-kernel/security-core/tokenService.js';

// 🛡️ SYNC: This MUST match the fallback in order/router.js
const secret = process.env.JWT_SECRET || 'super_secret_random_key_123';

const payload = { 
  id: 'user_123', 
  role: 'admin' 
};

try {
  const token = generateToken(payload, secret, '1h');
  console.log("\n--- 🔑 AUTHENTICATION TOKEN ---");
  console.log(`Secret Source: ${!!process.env.JWT_SECRET ? 'Environment Variable' : 'Fallback String'}`);
  console.log("\nCopy and paste this into your 'Authorization' header:\n");
  console.log(`Bearer ${token}`);
  console.log("\n--------------------------------\n");
} catch (err) {
  console.error("❌ Error:", err.message);
}