'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { TYPE_OPTIONS } from '@/lib/templates';

export default function NewBusiness() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [type, setType] = useState('clinic');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function create() {
    setBusy(true);
    setError('');
    const res = await fetch('/api/admin/businesses', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ name, type }),
    });
    const data = await res.json();
    if (res.ok) router.push('/admin/b/' + data.id);
    else { setError(data.error || 'Error'); setBusy(false); }
  }

  return (
    <div className="panel">
      <p className="lbl">Naya business</p>
      <div className="row">
        <input className="field" style={{ flex: 2, minWidth: 180, margin: 0 }} placeholder="Business ka naam" value={name} onChange={(e) => setName(e.target.value)} />
        <select className="field" style={{ flex: 1, minWidth: 160, margin: 0 }} value={type} onChange={(e) => setType(e.target.value)}>
          {TYPE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <button className="btn sm" onClick={create} disabled={busy || !name.trim()}>Banao</button>
      </div>
      {error && <p className="err">{error}</p>}
    </div>
  );
}
