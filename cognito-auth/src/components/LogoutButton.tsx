'use client';

import { useRouter } from 'next/navigation';

export function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await fetch('/api/auth/session', { method: 'DELETE' });
    router.push('/');
  }

  return (
    <button className="btn btn-outline" onClick={handleLogout} style={{ padding: '6px 14px', fontSize: '13px' }}>
      Sign out
    </button>
  );
}
