import { useState } from 'react';
import type { User } from 'firebase/auth';

interface Props {
  user?: User | null;
  name?: string | null;
  photoURL?: string | null;
  size?: number;
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// Colore stabile derivato dal nome.
function colorFor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue} 55% 45%)`;
}

export function Avatar({ user, name, photoURL, size = 32 }: Props) {
  const displayName = name ?? user?.displayName ?? 'Ospite';
  const url = photoURL ?? user?.photoURL ?? null;
  const [failed, setFailed] = useState(false);

  const style = { width: size, height: size, fontSize: size * 0.4 };

  if (url && !failed) {
    return (
      <img
        src={url}
        alt={displayName}
        className="avatar"
        style={style}
        referrerPolicy="no-referrer"
        onError={() => setFailed(true)}
      />
    );
  }

  return (
    <span
      className="avatar avatar-fallback"
      style={{ ...style, background: colorFor(displayName) }}
      aria-label={displayName}
    >
      {initials(displayName)}
    </span>
  );
}
