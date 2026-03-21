// /shared/security-core/tokenService.js
import jwt from 'jsonwebtoken';

export function generateToken(payload, secret, expiresIn = '1h') {
  return jwt.sign(payload, secret, { expiresIn });
}

export function refreshToken(oldToken, secret, expiresIn = '1h') {
  const payload = jwt.verify(oldToken, secret, { ignoreExpiration: true });
  return generateToken(payload, secret, expiresIn);
}
