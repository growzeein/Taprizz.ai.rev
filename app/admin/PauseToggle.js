'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function PauseToggle({ businessId, paused, scope }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const isAll = scope === 'all';

  async function toggle() {
    setBusy(true);
    try {
      const payload = isAll ? { all: !paused } : { businessId, paused: !paused };
      const res = await fetch('/api/admin/pause', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) alert('Nahi hua, dubara try karo');
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  const label = isAll
    ? paused ? '▶ Sab clients chalu karo' : '⏸ Sab clients pause'
    : paused ? '▶ AI chalu karo' : '⏸ AI pause karo';

  return (
    <button
      onClick={toggle}
      disabled={busy}
      style={{
        padding: isAll ? '10px 16px' : '6px 10px',
        borderRadius: 8,
        border: 'none',
        cursor: 'pointer',
        fontWeight: 600,
        background: paused ? '#16a34a' : isAll ? '#dc2626' : '#f59e0b',
        color: '#fff',
        opacity: busy ? 0.6 : 1,
      }}
    >
      {busy ? '...' : label}
    </button>
  );
}
