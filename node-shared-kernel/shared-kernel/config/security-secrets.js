// /my-org/config/security-secrets.js
export const jwtSecret = process.env.JWT_SECRET || 'dev-secret';
export const sessionSecret = process.env.SESSION_SECRET || 'dev-session';
