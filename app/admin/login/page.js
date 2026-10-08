'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit() {
    setBusy(true);
    setError('');
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (res.ok) {
      router.push('/admin');
      router.refresh();
    } else {
      setError((await res.json()).error || 'Login fail');
      setBusy(false);
    }
  }

  return (
    <div className="login">
      <h1>Taprizz admin</h1>
      <label className="lbl" htmlFor="e">Email</label>
      <input id="e" className="field" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" />
      <label className="lbl" htmlFor="p">Password</label>
      <input
        id="p" className="field" type="password" value={password} autoComplete="current-password"
        onChange={(e) => setPassword(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && submit()}
      />
      <button className="btn" onClick={submit} disabled={busy || !email || !password}>Login</button>
      {error && <p className="err">{error}</p>}
    </div>
  );
}
