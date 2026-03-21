// /shared/security-core/hashUtil.js
import crypto from 'crypto';

export function hashSHA256(data) {
  return crypto.createHash('sha256').update(data).digest('hex');
}
