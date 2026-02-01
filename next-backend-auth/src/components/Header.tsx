'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

interface User {
  id: string;
  isHuman: boolean;
}

export function Header() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/auth/session')
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated) {
          setUser(data.user);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/';
  };

  return (
    <header className="header">
      <Link href="/" className="header-logo">
        <svg width="28" height="28" viewBox="0 0 100 100" fill="none">
          <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="6"/>
          <circle cx="50" cy="35" r="12" fill="currentColor"/>
          <path d="M25 75c0-14 11-25 25-25s25 11 25 25" stroke="currentColor" strokeWidth="6" strokeLinecap="round"/>
        </svg>
        Humanity Auth
      </Link>
      
      <nav className="header-nav">
        {loading ? (
          <div className="spinner" />
        ) : user ? (
          <>
            <Link href="/dashboard" className="btn btn-secondary">
              Dashboard
            </Link>
            <Link href="/debug" className="btn btn-secondary">
              Debug
            </Link>
            {user.isHuman && (
              <span className="badge badge-success">
                ✓ Verified Human
              </span>
            )}
            <button onClick={handleLogout} className="btn btn-secondary">
              Logout
            </button>
          </>
        ) : (
          <>
            <Link href="/debug" className="btn btn-secondary">
              Debug
            </Link>
            <Link href="/" className="btn btn-primary">
              Get Started
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}

