import { describe, expect, it } from 'vitest';
import { consumeReturnTo, isAllowedRedirect, rememberReturnTo } from './oauthPolicy';

describe('OAuth consent policy', () => {
  it('allows Claude, ChatGPT and local CLI callbacks only', () => {
    expect(isAllowedRedirect('https://claude.ai/api/mcp/auth_callback')).toBe(true);
    expect(isAllowedRedirect('https://chatgpt.com/connector_platform_oauth_redirect')).toBe(true);
    expect(isAllowedRedirect('http://localhost:53127/callback')).toBe(true);
    expect(isAllowedRedirect('https://claude.ai.evil.com/cb')).toBe(false);
    expect(isAllowedRedirect('http://chatgpt.com/cb')).toBe(false);
    expect(isAllowedRedirect('javascript:alert(1)')).toBe(false);
  });

  it('only returns to same-site paths after sign-in', () => {
    rememberReturnTo('//evil.com');
    expect(consumeReturnTo()).toBe('/');
    rememberReturnTo('/oauth/consent?authorization_id=1');
    expect(consumeReturnTo()).toBe('/oauth/consent?authorization_id=1');
    expect(consumeReturnTo()).toBe('/');
  });
});
