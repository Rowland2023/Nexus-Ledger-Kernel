// /shared/security-core/roleService.js
import { roleCheck } from './roleCheck.js';

export function enforceRole(requiredRole) {
  return (req, res, next) => {
    if (!roleCheck(req.user, requiredRole)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    next();
  };
}
