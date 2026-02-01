/**
 * Path utilities for Next.js rewrites deployment
 * Next.js rewrites forward requests while preserving headers for reliable detection
 */

/**
 * Get the base path from environment variable
 */
function getBasePath(): string {
  return process.env.NEXT_PUBLIC_BASE_PATH || '';
}

/**
 * Get the proxy domain from environment variable
 */
function getProxyDomain(): string {
  return process.env.NEXT_PUBLIC_PROXY_DOMAIN || '';
}

/**
 * Detect if we should use proxy paths
 * Client-side: Check actual hostname
 * Server-side: Use header detection for Next.js rewrites
 */
function shouldUseProxyPaths(request?: Request): boolean {
  const proxyDomain = getProxyDomain();
  if (!proxyDomain) return false;

  if (typeof window !== 'undefined') {
    // Client-side: check if we're actually viewing through the proxy domain
    return window.location.hostname === proxyDomain;
  }

  // Server-side: use header detection for Next.js rewrites
  if (request) {
    const host = request.headers.get('host');
    const xForwardedHost = request.headers.get('x-forwarded-host');
    const xForwardedFor = request.headers.get('x-forwarded-for');
    const referer = request.headers.get('referer');
    const origin = request.headers.get('origin');

    // Next.js rewrites typically preserve the original host in the 'host' header
    // or provide forwarding headers with the original domain
    const fromProxy = !!(
      (host && host.includes(proxyDomain)) ||
      (xForwardedHost && xForwardedHost.includes(proxyDomain)) ||
      (referer && referer.includes(proxyDomain)) ||
      (origin && origin.includes(proxyDomain))
    );

    if (fromProxy) {
      return true;
    }
  }

  // Fallback: if no proxy headers detected but proxy is configured,
  // assume direct access (return false for no base path)
  return false;
}

/**
 * Resolve a path for redirects, considering Next.js rewrites
 * @param path - The path to resolve (should start with /)
 * @param request - Optional request object for server-side detection
 * @returns The path with or without base path prefix
 */
export function resolvePath(path: string, request?: Request): string {
  const basePath = getBasePath();

  // Add base path if configured for proxy and should use proxy paths
  if (shouldUseProxyPaths(request) && basePath) {
    return `${basePath}${path}`;
  }

  // Direct access or no base path configured
  return path;
}

/**
 * Resolve an API path for client-side requests
 * @param apiPath - The API path to resolve (should start with /api)
 * @returns The API path with or without base path prefix
 */
export function resolveApiPath(apiPath: string): string {
  const basePath = getBasePath();

  // Client-side: add base path if viewing through proxy
  if (typeof window !== 'undefined' && shouldUseProxyPaths() && basePath) {
    return `${basePath}${apiPath}`;
  }

  // Server-side API calls always use clean paths
  return apiPath;
}