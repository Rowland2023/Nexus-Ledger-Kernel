// 1. ADD THIS IMPORT
import { verifyJWT } from './jwtVerifier.js'; 
import { runWithUserContext } from './auth.context.js';

export function authMiddleware(secret) {
  return (req, res, next) => {
    const authHeader = req.headers['authorization'];
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No Bearer token provided' });
    }

    const token = authHeader.split(' ')[1];

    try {
      // 2. NOW THIS WILL WORK
      const decoded = verifyJWT(token, secret);
      
      if (!decoded) {
        throw new Error('Token decoding returned null');
      }

      req.user = decoded;

      runWithUserContext(decoded, () => {
        console.log('🛡️ [Auth] Context established for user:', decoded.id || 'unknown');
        next();
      });

    } catch (err) {
      console.error('[Security Kernel] Auth Failure:', err.message);
      return res.status(401).json({ error: 'Unauthorized' });
    }
  };
}