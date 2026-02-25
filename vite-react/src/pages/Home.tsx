import { LoginButton } from '../components/LoginButton';
import { useAuth } from '../hooks/useAuth';
import { Navigate } from 'react-router-dom';

export function Home() {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight">
            Humanity Protocol
          </h1>
          <p className="text-sm text-muted-foreground">
            Verify your humanity to access the application
          </p>
        </div>
        <LoginButton />
      </div>
    </div>
  );
}
