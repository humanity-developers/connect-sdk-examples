'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { resolveApiPath } from '@/lib/paths';

interface LoginButtonProps {
  children?: React.ReactNode;
  className?: string;
}

export function LoginButton({ children, className }: LoginButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(resolveApiPath('/api/auth/login'), { method: 'POST' });
      const data = await response.json();

      if (data.authUrl) {
        window.location.href = data.authUrl;
      }
    } catch (error) {
      console.error('Login failed:', error);
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleLogin}
      disabled={isLoading}
      className={className}
      size="lg"
    >
      {isLoading ? (
        <span className="loading-dots">Connecting</span>
      ) : (
        children || 'Connect with Humanity'
      )}
    </Button>
  );
}

