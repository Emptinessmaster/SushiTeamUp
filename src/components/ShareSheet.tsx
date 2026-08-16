import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import type { Room } from '../types';

export function ShareSheet({ room, onClose }: { room: Room; onClose: () => void }) {
  const url = `${window.location.origin}/room/${room.id}`;
  const [copied, setCopied] = useState<'link' | 'code' | null>(null);

  const copy = async (text: string, what: 'link' | 'code') => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(what);
      setTimeout(() => setCopied(null), 1800);
    } catch {
      /* clipboard non disponibile */
    }
  };

  const nativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `SushiTeamUp · ${room.name}`,
          text: `Unisciti alla stanza "${room.name}" per ordinare insieme!`,
          url,
        });
      } catch {
        /* condivisione annullata */
      }
    } else {
      copy(url, 'link');
    }
  };

  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-handle" />
        <h2 className="sheet-title">Invita nella stanza</h2>
        <p className="sheet-sub">
          Inquadra il QR o condividi il link. Chiunque potrà entrare accedendo con
          Google.
        </p>

        <div className="qr-wrap">
          <QRCodeSVG
            value={url}
            size={200}
            level="M"
            bgColor="#ffffff"
            fgColor="#1a1a1a"
            includeMargin
          />
        </div>

        <div className="code-badge">
          <span className="code-badge-label">Codice</span>
          <span className="code-badge-value">{room.id}</span>
          <button className="btn small ghost" onClick={() => copy(room.id, 'code')}>
            {copied === 'code' ? 'Copiato ✓' : 'Copia'}
          </button>
        </div>

        <div className="share-actions">
          <button className="btn primary" onClick={nativeShare}>
            Condividi link
          </button>
          <button className="btn ghost" onClick={() => copy(url, 'link')}>
            {copied === 'link' ? 'Link copiato ✓' : 'Copia link'}
          </button>
        </div>

        <button className="sheet-close" onClick={onClose}>
          Chiudi
        </button>
      </div>
    </div>
  );
}
