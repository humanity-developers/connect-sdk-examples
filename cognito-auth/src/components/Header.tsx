import Link from 'next/link';

export default function Header() {
  return (
    <header className="header">
      <div className="container header-inner">
        <Link href="/" className="header-brand">
          <span>⚡ Humanity Protocol</span>
          <span className="header-badge">Cognito</span>
        </Link>
        <nav className="header-nav">
          <a
            href="https://docs.humanity.org/build-with-humanity/build-with-the-sdk-api/"
            target="_blank"
            rel="noreferrer"
          >
            Docs
          </a>
          <a
            href="https://github.com/humanity-developers/connect-sdk"
            target="_blank"
            rel="noreferrer"
          >
            SDK
          </a>
          <a
            href="https://developer.humanity.org"
            target="_blank"
            rel="noreferrer"
          >
            Dev Portal
          </a>
        </nav>
      </div>
    </header>
  );
}
