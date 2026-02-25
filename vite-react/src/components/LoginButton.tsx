import { sdk, storeCodeVerifier } from '../lib/humanity';
import { Button } from './Button';

export function LoginButton() {
  const handleLogin = () => {
    const { url, codeVerifier } = sdk.buildAuthUrl({
      scopes: ['openid', 'identity:read'],  // OAuth scopes, not presets
      prompt: 'consent',
    });

    // Only store codeVerifier (state is handled by Humanity)
    storeCodeVerifier(codeVerifier);
    window.location.href = url;
  };

  return (
    <Button onClick={handleLogin} className="w-full">
      Verify with Humanity Protocol
    </Button>
  );
}
