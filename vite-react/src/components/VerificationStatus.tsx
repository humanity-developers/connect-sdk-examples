import { useAuth } from '../hooks/useAuth';

// Map presets to their OAuth scopes
const PRESET_SCOPE_MAP: Record<string, string[]> = {
  'is_human': ['identity:read'],
  'email': ['identity:read'],
  'phone': ['identity:read'],
  'is_18_plus': ['identity:date_of_birth'],
  'is_21_plus': ['identity:date_of_birth'],
  'humanity_user': ['profile.full'],
};

export function VerificationStatus() {
  const { presets, isAuthenticated, tokenData } = useAuth();

  if (!isAuthenticated || !presets) {
    return (
      <div className="rounded-md border border-border p-4">
        <p className="text-sm text-muted-foreground text-center">Not verified</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {presets.map((preset: any) => {
        const presetScopes = PRESET_SCOPE_MAP[preset.preset] || ['identity:read'];

        return (
          <div key={preset.preset} className="rounded-md border border-border bg-muted">
            {/* Header */}
            <div className="border-b border-border p-4">
              <div>
                <h3 className="text-sm font-semibold mb-1">
                  {preset.preset} preset evidence
                </h3>
                <p className="text-xs text-muted-foreground">
                  Verifies the <span className="font-mono text-foreground">{preset.preset}</span> preset using the HumanitySDK
                </p>
              </div>
            </div>

            {/* Content */}
            <div className="p-5 space-y-5">
              <div className="space-y-1">
                <div className="text-xs font-medium text-muted-foreground tracking-wider">PRESET</div>
                <div className="text-sm text-foreground">{preset.preset}</div>
              </div>

              <div className="space-y-1">
                <div className="text-xs font-medium text-muted-foreground tracking-wider">STATUS</div>
                <div className="text-sm">
                  {preset.status === 'valid' ? (
                    <span className="text-green-400 flex items-center">
                      <span className="mr-2">•</span> valid
                    </span>
                  ) : (
                    <span className="text-red-400 flex items-center">
                      <span className="mr-2">•</span> invalid
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-xs font-medium text-muted-foreground tracking-wider">SUBJECT (SUB)</div>
                <div className="text-sm text-foreground">—</div>
              </div>

              <div className="space-y-1">
                <div className="text-xs font-medium text-muted-foreground tracking-wider">AUTHORIZATION_ID</div>
                <div className="text-sm font-mono text-foreground">
                  {tokenData?.authorizationId || tokenData?.authorization_id || '—'}
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-xs font-medium text-muted-foreground tracking-wider">SCOPES</div>
                <div className="flex gap-2">
                  {presetScopes.map((scope: string) => (
                    <span
                      key={scope}
                      className="text-xs px-2 py-1 rounded bg-muted border border-border font-mono text-foreground"
                    >
                      {scope}
                    </span>
                  ))}
                </div>
              </div>

              {preset.expiresAt && (
                <div className="space-y-1">
                  <div className="text-xs font-medium text-muted-foreground tracking-wider">EXPIRES_AT</div>
                  <div className="text-sm text-foreground">
                    {new Date(preset.expiresAt).toLocaleString('en-US', {
                      month: '2-digit',
                      day: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                      hour12: true
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
