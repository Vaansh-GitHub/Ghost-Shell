import chalk from 'chalk';
import { config } from '../config/settings.js';

/**
 * Clears the terminal screen.
 */
export function clearScreen() {
  process.stdout.write('\x1Bc');
}

/**
 * Renders the initial GhostShell welcome banner.
 */
export function renderBanner() {
  console.log(chalk.magentaBright('===================================================='));
  console.log(chalk.bold.cyanBright(` 👻 ${config.app.name} v${config.app.version} `) + chalk.gray('- The AI Haunted Terminal'));
  console.log(chalk.gray(' Type commands as usual. Type "exit" or press Ctrl+C to quit.'));
  console.log(chalk.magentaBright('====================================================\n'));
}

/**
 * Prints a subtle divider line.
 */
export function renderDivider() {
  console.log(chalk.gray('─'.repeat(Math.min(process.stdout.columns || 60, 60))));
}

/**
 * Formats a command prompt string.
 * @returns {string}
 */
export function getPromptString() {
  return chalk.greenBright('ghost') + chalk.gray('❯ ');
}

/**
 * Displays a formatted error message.
 * @param {string|Error} error
 */
export function renderError(error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(chalk.red(`\n✖ [Error]: ${message}\n`));
}

