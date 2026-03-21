// /shared-kernel/security-core/jwtVerifier.js
import jwt from 'jsonwebtoken';

export function verifyJWT(token, secret) {
  return jwt.verify(token, secret);
}
