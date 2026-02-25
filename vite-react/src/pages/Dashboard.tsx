import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { VerificationStatus } from '../components/VerificationStatus';
import { Button } from '../components/Button';

export function Dashboard() {
  const { isAuthenticated, logout, tokenData } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/" />;
  }

  console.log('Dashboard tokenData:', tokenData);

  const expiresIn = tokenData?.expiresIn ? Math.floor(tokenData.expiresIn / 60) : 0;
  const authorizationId = tokenData?.authorizationId || tokenData?.authorization_id || '—';

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-3/4 max-w-5xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
            <h2 className="text-sm font-semibold">Active Session</h2>
          </div>
          <Button variant="ghost" onClick={logout}>
            Sign out
          </Button>
        </div>

        {/* Session Info */}
        <div className="rounded-md border border-border bg-muted p-5 space-y-5">
          <div className="space-y-1">
            <div className="text-xs font-medium text-muted-foreground tracking-wider">AUTHORIZATION ID</div>
            <div className="text-sm font-mono text-foreground">{authorizationId}</div>
          </div>

          <div className="space-y-1">
            <div className="text-xs font-medium text-muted-foreground tracking-wider">GRANTED SCOPES</div>
            <div className="flex gap-2">
              {tokenData?.presetKeys?.map((scope: string) => (
                <span
                  key={scope}
                  className="text-xs px-2 py-1 rounded bg-green-500 text-primary-foreground font-medium"
                >
                  {scope}
                </span>
              ))}
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-xs font-medium text-muted-foreground tracking-wider">ACCESS TOKEN EXPIRES IN</div>
            <div className="text-sm text-foreground">{expiresIn} min</div>
          </div>

          <div className="space-y-1">
            <div className="text-xs font-medium text-muted-foreground tracking-wider">API BASE URL</div>
            <div className="text-sm font-mono text-foreground">https://api.sandbox.humanity.org/</div>
          </div>
        </div>

        {/* Preset Evidence */}
        <VerificationStatus />
      </div>
    </div>
  );
}
