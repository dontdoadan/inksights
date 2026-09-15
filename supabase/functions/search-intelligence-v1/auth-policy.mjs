function decodeJwtPayload(token) {
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  try {
    const segment = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = segment + '='.repeat((4 - (segment.length % 4)) % 4);
    const json = decodeURIComponent(
      Array.from(atob(padded), (char) => `%${char.charCodeAt(0).toString(16).padStart(2, '0')}`).join(''),
    );
    const value = JSON.parse(json);
    return value && typeof value === 'object' ? value : null;
  } catch {
    return null;
  }
}

export function isServiceRoleAuthorization(value) {
  if (typeof value !== 'string') return false;
  const match = value.match(/^Bearer\s+(.+)$/i);
  if (!match) return false;
  const payload = decodeJwtPayload(match[1].trim());
  return payload?.role === 'service_role';
}
