import { cloudflareAI } from './cloudflare.js';
import { GHOST_SYSTEM_PROMPT, FALLBACK_DIALOGUES, RANDOM_FALLBACKS, buildGhostPrompt } from './prompts.js';
import { logger } from '../utils/logger.js';

/**
 * Clean and sanitize dialogue to ensure no shell injection, backticks,
 * or raw code blocks are produced by the AI.
 *
 * @param {string} text
 * @returns {string} Sanitized dialogue
 */
function sanitizeDialogue(text) {
  if (!text) return '';
  return text
    .replace(/^["']|["']$/g, '') // Strip outer quotes
    .replace(/```[\s\S]*?```/g, '') // Strip markdown codeblocks
    .replace(/`([^`]+)`/g, '$1') // Strip inline backticks
    .replace(/\r?\n|\r/g, ' ') // Collapse into single line
    .trim();
}

/**
 * Resolves a fallback dialogue for offline / unconfigured mode.
 * @param {string} command
 * @param {object} [context]
 * @returns {string}
 */
export function getFallbackDialogue(command, context = {}) {
  const normalized = command.trim().toLowerCase();

  // If command failed, provide contextual failure mockery
  if (context.exitCode !== undefined && context.exitCode !== 0) {
    return '[sinister chuckle] Oh dear... the spirits rejected your command! A tragic failure... Heh... heh... heh...';
  }

  for (const [key, dialogue] of Object.entries(FALLBACK_DIALOGUES)) {
    if (normalized === key || normalized.startsWith(key + ' ')) {
      return dialogue;
    }
  }

  // Pick random fallback so it never repeats the exact same line
  const idx = Math.floor(Math.random() * RANDOM_FALLBACKS.length);
  return RANDOM_FALLBACKS[idx];
}

/**
 * Generates witty, contextual ghost dialogue for a given terminal command.
 *
 * @param {string} command - Original user shell command
 * @param {object} [context] - Execution context (e.g. exitCode)
 * @returns {Promise<string>} Clean ghost dialogue text
 */
export async function generateDialogue(command, context = {}) {
  if (!command || !command.trim()) {
    return '[whispers] The silence of the terminal... it calls to me...';
  }

  try {
    const prompt = buildGhostPrompt(command.trim(), context);
    const generated = await cloudflareAI.generateText({
      prompt,
      systemPrompt: GHOST_SYSTEM_PROMPT,
    });

    if (generated) {
      const clean = sanitizeDialogue(generated);
      if (clean.length > 0) {
        return clean;
      }
    }
  } catch (error) {
    logger.debug('Using fallback dialogue due to error:', error.message);
  }

  // Graceful fallback dialogue
  return getFallbackDialogue(command, context);
}
