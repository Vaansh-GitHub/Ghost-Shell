import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { getPromptString } from '../ui/terminal.js';

let rlInterface = null;

/**
 * Initializes or returns the readline interface.
 * @returns {readline.Interface}
 */
export function getPromptInterface() {
  if (!rlInterface) {
    rlInterface = readline.createInterface({
      input,
      output,
      terminal: true,
    });
  }
  return rlInterface;
}

/**
 * Prompts the user for a single shell command.
 * @returns {Promise<string>} User input command string
 */
export async function readCommand() {
  const rl = getPromptInterface();
  const prompt = getPromptString();
  try {
    const answer = await rl.question(prompt);
    return answer.trim();
  } catch {
    // Interrupted by signal or closed stream
    return 'exit';
  }
}

/**
 * Closes the readline interface cleanly.
 */
export function closePromptInterface() {
  if (rlInterface) {
    rlInterface.close();
    rlInterface = null;
  }
}

