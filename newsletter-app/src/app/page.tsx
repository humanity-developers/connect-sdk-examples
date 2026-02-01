import { Header } from '@/components/Header';
import { LoginButton } from '@/components/LoginButton';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { SocialIcon } from '@/components/SocialIcons';
import { redirect } from 'next/navigation';
import { readAppSession } from '@/lib/session';
import { SOCIAL_CONNECTIONS_URL } from '@/lib/constants';
import { 
  ArrowRight, 
  Zap, 
  Code, 
  AlertTriangle, 
  ExternalLink, 
  RefreshCw,
  Eye,
  Terminal
} from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default function HomePage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  const session = readAppSession();
  if (session && session.expiresAt > Date.now()) {
    redirect('/feed');
  }

  const error = searchParams.error;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 flex flex-col">
        {/* Error Alerts */}
        {error === 'no_social_connections' && (
          <div className="border-b border-[rgba(255,184,0,0.2)] bg-[rgba(255,184,0,0.08)] px-6 py-4">
            <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-[#ffb800] flex-shrink-0" />
                <div>
                  <p className="text-[#ffb800] font-medium">
                    Connect at least one social account to try this demo
                  </p>
                  <p className="text-[#ffb800]/70 text-sm">
                    Link Google, LinkedIn, Discord, or another social on Humanity.
                  </p>
                </div>
              </div>
              <a href={SOCIAL_CONNECTIONS_URL} target="_blank" rel="noopener noreferrer">
                <button className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#ffb800] border border-[rgba(255,184,0,0.3)] rounded-lg bg-transparent hover:bg-[rgba(255,184,0,0.1)] transition-colors">
                  Connect Socials
                  <ExternalLink className="w-4 h-4" />
                </button>
              </a>
            </div>
          </div>
        )}

        {error && error !== 'no_social_connections' && (
          <div className="border-b border-[rgba(255,71,87,0.2)] bg-[rgba(255,71,87,0.08)] px-6 py-3">
            <p className="text-[#ff4757] text-sm font-medium max-w-4xl mx-auto">
              <strong>Error:</strong> {decodeURIComponent(error)}
            </p>
          </div>
        )}

        {/* Hero Section */}
        <section className="flex-1 flex items-center justify-center px-6 py-20">
          <div className="max-w-3xl mx-auto text-center">
            <Badge variant="live" className="mb-6 gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-humanity-lime animate-pulse" />
              Humanity Protocol SDK Demo
            </Badge>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight text-white">
              Personalized{' '}
              <span className="text-humanity-lime">Newsletter</span>
            </h1>

            <p className="text-[rgba(255,255,255,0.65)] text-lg md:text-xl max-w-2xl mx-auto mb-6 leading-relaxed">
              This demo uses email and social accounts to personalize your feed.
              But that&apos;s just the start.
            </p>

            <p className="text-[rgba(255,255,255,0.5)] text-base max-w-2xl mx-auto mb-10 leading-relaxed">
              <span className="text-white font-medium">Humanity has 30+ presets</span>{' '}
              covering identity, age, KYC, and financial data.{' '}
              <span className="text-white font-medium">Instant access to 25+ loyalty programs</span>{' '}
              from airlines, hotels, and casinos.{' '}
              <span className="text-humanity-lime font-medium">No BD calls required.</span>
            </p>

            {/* Social Providers */}
            <div className="flex items-center justify-center gap-3 mb-10">
              {['linkedin', 'discord', 'twitter', 'github', 'google'].map((provider) => (
                <div
                  key={provider}
                  className="w-11 h-11 rounded-xl border border-[rgba(255,255,255,0.08)] bg-[#111111] flex items-center justify-center text-[rgba(255,255,255,0.4)] hover:text-white hover:border-[rgba(255,255,255,0.12)] transition-all duration-200"
                >
                  <SocialIcon provider={provider} />
                </div>
              ))}
            </div>

            {/* CTA */}
            {error === 'no_social_connections' ? (
              <>
                <LoginButton className="text-base px-8 py-3 bg-[#ffb800] hover:bg-[#ffcc33] text-black shadow-[0_4px_24px_rgba(255,184,0,0.25)]">
                  <RefreshCw className="w-4 h-4" />
                  Refresh Credentials
                </LoginButton>
                <p className="text-xs text-[#ffb800]/70 mt-4">
                  After connecting socials on Humanity, click to refresh
                </p>
              </>
            ) : (
              <LoginButton className="text-base px-8 py-3">
                Try the Demo
                <ArrowRight className="w-4 h-4" />
              </LoginButton>
            )}
            {error !== 'no_social_connections' && (
              <p className="text-xs text-[rgba(255,255,255,0.4)] mt-4">
                Connect with Humanity Protocol to see your personalized feed
              </p>
            )}
          </div>
        </section>

        {/* Features */}
        <section className="border-t border-[rgba(255,255,255,0.08)] bg-[rgba(17,17,17,0.5)] px-6 py-20">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-14">
              <h2 className="text-2xl font-bold mb-3 text-white">What This Demo Shows</h2>
              <p className="text-[rgba(255,255,255,0.5)]">
                Explore the SDK features in action with the built-in developer panel
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="p-6 hover:shadow-glow transition-shadow duration-300">
                <div className="w-11 h-11 rounded-xl bg-[rgba(143,255,0,0.1)] border border-[rgba(143,255,0,0.2)] flex items-center justify-center mb-5">
                  <Code className="w-5 h-5 text-humanity-lime" />
                </div>
                <h3 className="font-semibold mb-2 text-white">Live API Logs</h3>
                <p className="text-sm text-[rgba(255,255,255,0.5)]">
                  See every SDK call in real-time with request and response details.
                </p>
              </Card>

              <Card className="p-6 hover:shadow-glow transition-shadow duration-300">
                <div className="w-11 h-11 rounded-xl bg-[rgba(143,255,0,0.1)] border border-[rgba(143,255,0,0.2)] flex items-center justify-center mb-5">
                  <Eye className="w-5 h-5 text-humanity-lime" />
                </div>
                <h3 className="font-semibold mb-2 text-white">Identity Signals</h3>
                <p className="text-sm text-[rgba(255,255,255,0.5)]">
                  Toggle signals on/off to see how the feed changes based on your credentials.
                </p>
              </Card>

              <Card className="p-6 hover:shadow-glow transition-shadow duration-300">
                <div className="w-11 h-11 rounded-xl bg-[rgba(143,255,0,0.1)] border border-[rgba(143,255,0,0.2)] flex items-center justify-center mb-5">
                  <Terminal className="w-5 h-5 text-humanity-lime" />
                </div>
                <h3 className="font-semibold mb-2 text-white">Code Examples</h3>
                <p className="text-sm text-[rgba(255,255,255,0.5)]">
                  View the TypeScript code powering each feature. Copy and adapt.
                </p>
              </Card>
            </div>
          </div>
        </section>

        {/* Code Preview */}
        <section className="border-t border-[rgba(255,255,255,0.08)] px-6 py-20">
          <div className="max-w-5xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-14 items-start">
              <div>
                <h2 className="text-2xl font-bold mb-4 text-white">Simple Integration</h2>
                <p className="text-[rgba(255,255,255,0.5)] mb-8">
                  The Humanity Protocol SDK makes it easy to verify identity signals 
                  and build personalized experiences.
                </p>
                <ul className="space-y-4 text-sm">
                  <li className="flex items-center gap-3 text-[rgba(255,255,255,0.65)]">
                    <div className="w-6 h-6 rounded-full bg-[rgba(143,255,0,0.1)] flex items-center justify-center">
                      <Zap className="w-3.5 h-3.5 text-humanity-lime" />
                    </div>
                    <span>OAuth 2.0 with PKCE for secure auth</span>
                  </li>
                  <li className="flex items-center gap-3 text-[rgba(255,255,255,0.65)]">
                    <div className="w-6 h-6 rounded-full bg-[rgba(143,255,0,0.1)] flex items-center justify-center">
                      <Zap className="w-3.5 h-3.5 text-humanity-lime" />
                    </div>
                    <span>Batch preset verification in one API call</span>
                  </li>
                  <li className="flex items-center gap-3 text-[rgba(255,255,255,0.65)]">
                    <div className="w-6 h-6 rounded-full bg-[rgba(143,255,0,0.1)] flex items-center justify-center">
                      <Zap className="w-3.5 h-3.5 text-humanity-lime" />
                    </div>
                    <span>Query Engine for complex credential checks</span>
                  </li>
                </ul>
              </div>
              
              <Card className="overflow-hidden">
                <div className="px-4 py-3 border-b border-[rgba(255,255,255,0.08)] bg-[#0a0a0a] flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
                  <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
                  <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
                  <span className="text-xs text-[rgba(255,255,255,0.4)] ml-3 font-mono">
                    example.ts
                  </span>
                </div>
                <pre className="p-5 text-sm overflow-x-auto bg-[#0a0a0a]">
                  <code className="text-[rgba(255,255,255,0.65)] font-mono">{`// Check social connections
const socials = await sdk.verifyPresets({
  accessToken,
  presets: [
    'google_connected',
    'linkedin_connected',
    'discord_connected',
  ],
});

// Get connected accounts
const connected = socials.results
  .filter(r => r.value === true)
  .map(r => r.presetName);

// → ['google_connected', 'linkedin_connected']`}</code>
                </pre>
              </Card>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-[rgba(255,255,255,0.08)] px-6 py-8">
          <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-[rgba(255,255,255,0.4)]">
              Built with{' '}
              <a
                href="https://humanity.org"
                target="_blank"
                rel="noopener noreferrer"
                className="text-humanity-lime hover:text-humanity-lime-hover transition-colors"
              >
                Humanity Protocol SDK
              </a>
            </p>
            <div className="flex items-center gap-8 text-sm text-[rgba(255,255,255,0.4)]">
              <a 
                href="https://docs.humanity.org" 
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors"
              >
                Documentation
              </a>
              <a 
                href="https://github.com/humanity-org/connect-sdk" 
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors"
              >
                GitHub
              </a>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
