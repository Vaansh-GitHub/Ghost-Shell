import dotenv from 'dotenv';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../../');

// 1. Load standard .env if present
const envPath = path.join(projectRoot, '.env');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
} else {
  dotenv.config();
}

// 2. Load .env.local if present (takes precedence for local secrets)
const envLocalPath = path.join(projectRoot, '.env.local');
if (fs.existsSync(envLocalPath)) {
  dotenv.config({ path: envLocalPath, override: true });
}

/**
 * GhostShell centralized application configuration.
 * Consolidates environment variables with fallback defaults.
 */
export const config = {
  app: {
    name: 'GhostShell',
    version: '0.1.0',
    logLevel: process.env.LOG_LEVEL || 'info',
  },
  cloudflare: {
    accountId: process.env.CLOUDFLARE_ACCOUNT_ID || '',
    apiToken: process.env.CLOUDFLARE_API_TOKEN || '',
    model: process.env.CLOUDFLARE_AI_MODEL || '@cf/google/gemma-4-26b-a4b-it',
    get isConfigured() {
      return Boolean(this.accountId && this.apiToken);
    },
  },
  elevenlabs: {
    apiKey: process.env.ELEVENLABS_API_KEY || '',
    voiceId: process.env.ELEVENLABS_VOICE_ID || '',
    modelId: process.env.ELEVENLABS_MODEL_ID || 'eleven_flash_v2_5',
    get isConfigured() {
      return Boolean(this.apiKey && this.voiceId);
    },
  },
  audio: {
    muted: process.env.GHOST_MUTE === 'true',
    player: process.env.GHOST_AUDIO_PLAYER || 'ffplay',
  },
};

/**
 * Validates the core configuration state.
 * @returns {{ valid: boolean, missing: string[] }}
 */
export function validateConfig() {
  const missing = [];

  if (!config.cloudflare.accountId) missing.push('CLOUDFLARE_ACCOUNT_ID');
  if (!config.cloudflare.apiToken) missing.push('CLOUDFLARE_API_TOKEN');
  if (!config.elevenlabs.apiKey) missing.push('ELEVENLABS_API_KEY');
  if (!config.elevenlabs.voiceId) missing.push('ELEVENLABS_VOICE_ID');

  return {
    valid: missing.length === 0,
    missing,
  };
}

