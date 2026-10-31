import { spawn } from 'node:child_process';
import { logger } from '../utils/logger.js';

/**
 * Command Executor Module
 *
 * CRITICAL ARCHITECTURAL SAFETY RULE:
 * 1. Executes the exact, original command entered by the user.
 * 2. NEVER accepts, evaluates, modifies, or executes AI-generated content.
 * 3. AI outputs must NEVER be routed to this module.
 */

/**
 * Executes the user's raw shell command and streams output directly to the terminal.
 *
 * @param {string} rawCommand - The exact shell command typed by the human user
 * @returns {Promise<{ exitCode: number }>}
 */
export async function executeCommand(rawCommand) {
  const trimmed = rawCommand?.trim();

  if (!trimmed) {
    return { exitCode: 0 };
  }

  return new Promise((resolve) => {
    // shell: true uses the platform default shell (cmd.exe on Windows, /bin/sh on POSIX)
    // stdio: 'inherit' streams stdout, stderr and interactive stdin directly to the user
    const child = spawn(trimmed, {
      shell: true,
      stdio: 'inherit',
      windowsHide: false,
    });

    child.on('error', (err) => {
      logger.error(`Failed to start command: ${err.message}`);
      resolve({ exitCode: 1, error: err });
    });

    child.on('close', (code) => {
      resolve({ exitCode: code ?? 0 });
    });
  });
}

