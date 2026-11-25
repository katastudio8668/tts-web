/* global process, console */
// Packages the KATA TTS AI plugin (skills + MCP connection) for Claude and ChatGPT into public/plugins,
// so every user can download them from the AI Plugin page. Runs before each web build.
import { existsSync, readdirSync, statSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import JSZip from 'jszip';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
for (const envFile of ['.env.local', '.env']) {
  const envPath = path.join(root, envFile);
  if (existsSync(envPath) && typeof process.loadEnvFile === 'function') {process.loadEnvFile(envPath);}
}
const apiBase = (process.env.KATA_MCP_URL ? '' : (process.env.VITE_API_BASE_URL || 'http://localhost:3058/api/v1')).replace(/\/+$/, '');
const MCP_URL = process.env.KATA_MCP_URL?.trim() || `${apiBase}/mcp`;
const pluginRoot = path.join(root, 'ai-plugin');
const outDir = path.join(root, 'public', 'plugins');
const DATE = new Date('1980-01-01T00:00:00.000Z');
const FORBIDDEN = /korva|vieneu|remotion|ffmpeg/i;

function filesUnder(dir) {
  return readdirSync(dir).flatMap((entry) => {
    const full = path.join(dir, entry);
    return statSync(full).isDirectory() ? filesUnder(full) : [full];
  }).sort();
}

async function skillFiles({ includeOpenAiAgents }) {
  const skillsDir = path.join(pluginRoot, 'skills');
  const files = [];
  for (const full of filesUnder(skillsDir)) {
    const relative = path.relative(pluginRoot, full).split(path.sep).join('/');
    if (!includeOpenAiAgents && relative.includes('/agents/')) {continue;}
    let content = (await readFile(full, 'utf8')).replaceAll('__KATA_MCP_URL__', MCP_URL);
    // The plugin is public: it must not name the engines or libraries behind KATA TTS.
    if (FORBIDDEN.test(content)) {throw new Error(`${relative} names an internal engine or library.`);}
    files.push([relative, content]);
  }
  return files;
}

const zipOptions = { createFolders: false, date: DATE };
const generate = (zip) => zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE', compressionOptions: { level: 9 }, platform: 'UNIX' });

async function claudeBundle(manifest) {
  const zip = new JSZip();
  // Claude Code plugin layout: .claude-plugin/plugin.json + .mcp.json + skills/. OAuth happens at connect time.
  zip.file('.claude-plugin/plugin.json', `${JSON.stringify({
    name: manifest.name, version: manifest.version, description: manifest.description, author: manifest.author,
    keywords: ['kata-tts', 'tts', 'voice', 'video', 'vietnamese', 'mcp'],
  }, null, 2)}\n`, zipOptions);
  zip.file('.mcp.json', `${JSON.stringify({ mcpServers: { 'kata-tts': { type: 'http', url: MCP_URL } } }, null, 2)}\n`, zipOptions);
  for (const [name, content] of await skillFiles({ includeOpenAiAgents: false })) {zip.file(name, content, zipOptions);}
  zip.file('README.md', `# KATA TTS for Claude\n\nConnector URL: ${MCP_URL}\n\n- Claude Code: \`claude mcp add --transport http kata-tts ${MCP_URL}\`, or install this folder as a plugin.\n- Claude (web/desktop): add a custom connector with the URL above; upload each folder in skills/ as a skill.\n`, zipOptions);
  return generate(zip);
}

async function chatGptBundle(manifest) {
  const zip = new JSZip();
  zip.file('plugin.json', `${JSON.stringify(manifest, null, 2)}\n`, zipOptions);
  // ChatGPT registers itself (dynamic client registration) and uses PKCE; never bundle credentials.
  zip.file('mcp.json', `${JSON.stringify({
    $schema: 'https://agent-plugins.org/schemas/1.0.0/mcp.schema.json',
    mcpServers: { 'kata-tts': { type: 'streamable-http', url: MCP_URL,
      extensions: { 'com.openai': { auth: { type: 'oauth', client: { mode: 'dcr' }, baseScopes: ['openid', 'email', 'profile'] } } } } },
  }, null, 2)}\n`, zipOptions);
  for (const [name, content] of await skillFiles({ includeOpenAiAgents: true })) {zip.file(name, content, zipOptions);}
  return generate(zip);
}

const manifest = JSON.parse(await readFile(path.join(pluginRoot, 'plugin.json'), 'utf8'));
if (FORBIDDEN.test(JSON.stringify(manifest))) {throw new Error('plugin.json names an internal engine or library.');}
await mkdir(outDir, { recursive: true });
await writeFile(path.join(outDir, 'kata-tts-claude-plugin.zip'), await claudeBundle(manifest));
await writeFile(path.join(outDir, 'kata-tts-chatgpt-plugin.zip'), await chatGptBundle(manifest));
console.log(`AI plugin packages written to public/plugins (MCP: ${MCP_URL})`);
