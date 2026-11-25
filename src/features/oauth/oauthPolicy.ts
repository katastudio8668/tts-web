/** AI apps allowed to receive a KATA TTS authorization code. Everything else is refused on the consent page. */
const ALLOWED_HOSTS = ['claude.ai', 'claude.com', 'anthropic.com', 'chatgpt.com', 'openai.com'];

export function isAllowedRedirect(value: string): boolean {
  try {
    const url = new URL(value);
    const host = url.hostname.toLowerCase();
    // Claude Code / desktop clients receive the code on a loopback port.
    if ((url.protocol === 'http:' || url.protocol === 'https:') && (host === 'localhost' || host === '127.0.0.1' || host === '[::1]')) {return true;}
    return url.protocol === 'https:' && ALLOWED_HOSTS.some((allowed) => host === allowed || host.endsWith(`.${allowed}`));
  } catch {
    return false;
  }
}

const RETURN_KEY = 'kata-tts-return-to';

/** Remembers where to come back after Google sign-in (same-site paths only). */
export function rememberReturnTo(path: string): void {
  if (path.startsWith('/') && !path.startsWith('//')) {sessionStorage.setItem(RETURN_KEY, path);}
}

export function consumeReturnTo(): string {
  const value = sessionStorage.getItem(RETURN_KEY);
  sessionStorage.removeItem(RETURN_KEY);
  return value && value.startsWith('/') && !value.startsWith('//') ? value : '/';
}
