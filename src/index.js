#!/usr/bin/env node

import { startSession, processCommand } from './cli/session.js';
import { closePromptInterface } from './cli/input.js';
import { config } from './config/settings.js';
import { logger } from './utils/logger.js';
import chalk from 'chalk';

/**
 * Handle graceful shutdown on signals like Ctrl+C
 */
function setupSignalHandlers() {
  process.on('SIGINT', () => {
    console.log(chalk.cyanBright('\n\n👻 The ghost vanishes into the ether... Goodbye!\n'));
    closePromptInterface();
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    closePromptInterface();
    process.exit(0);
  });
}

/**
 * Main application bootstrap
 */
async function main() {
  setupSignalHandlers();

  const args = process.argv.slice(2);

  // Quick flag checks
  if (args.includes('--help') || args.includes('-h')) {
    console.log(chalk.cyanBright(`\n👻 ${config.app.name} v${config.app.version}`));
    console.log('An AI-powered, voice-enabled terminal experience with a ghost personality.\n');
    console.log('Usage:');
    console.log('  ghost                 Start the interactive GhostShell session');
    console.log('  ghost <command>       Run a single command with ghost dialogue');
    console.log('\nOptions:');
    console.log('  --mute                Disable voice audio output');
    console.log('  --version, -v         Display current version');
    console.log('  --help, -h            Show this help text\n');
    process.exit(0);
  }

  if (args.includes('--version') || args.includes('-v')) {
    console.log(`${config.app.name} v${config.app.version}`);
    process.exit(0);
  }

  if (args.includes('--mute')) {
    config.audio.muted = true;
    // Remove --mute from arguments if remaining args form a command
    const remainingArgs = args.filter((a) => a !== '--mute');
    if (remainingArgs.length > 0) {
      await processCommand(remainingArgs.join(' '));
      process.exit(0);
    }
  }

  // If user passed a single command directly (e.g. `ghost git status`)
  if (args.length > 0) {
    const directCommand = args.join(' ');
    await processCommand(directCommand);
    process.exit(0);
  }

  // Otherwise, start interactive terminal session
  try {
    await startSession();
  } catch (error) {
    logger.error('Fatal GhostShell error:', error);
    process.exit(1);
  }
}

main();

