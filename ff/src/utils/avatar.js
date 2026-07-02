const API_BASE = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api').replace(/\/api\/?$/, '');

export function resolveAvatar(avatar, name = '') {
  if (avatar && avatar !== 'null' && avatar !== 'NULL') {
    return avatar.startsWith('http') ? avatar : `${API_BASE}${avatar}`;
  }
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0f4c4a&color=fff&bold=true`;
}

export function initials(name = '') {
  return name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}
