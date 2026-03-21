// /shared/security-core/roleCheck.js
export function roleCheck(user, requiredRole) {
  return user && user.roles.includes(requiredRole);
}
