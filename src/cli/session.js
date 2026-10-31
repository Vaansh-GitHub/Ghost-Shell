import chalk from 'chalk';
import { readCommand, closePromptInterface } from './input.js';
import { renderGhost } from '../ui/ghost.js';
import { renderDialogue } from '../ui/dialogue.js';
import { renderBanner, renderDivider, clearScreen } from '../ui/terminal.js';
import { generateDialogue } from '../ai/dialogueGenerator.js';
import { elevenlabsVoice } from '../voice/elevenlabs.js';
import { audioPlayer } from '../voice/audioPlayer.js';
import { executeCommand } from '../executor/commandExecutor.js';
import { config } from '../config/settings.js';
import { logger } from '../utils/logger.js';

/**
 * Handles built-in ghost shell commands and flags.
 * @param {string} command
 * @returns {boolean} True if the command was a built-in command and handled
 */
export function handleBuiltinCommands(command) {
  const normalized = command.trim().toLowerCase();

  if (normalized === 'exit' || normalized === 'quit') {
    console.log(chalk.cyanBright('\n👻 The ghost fades into the shadows... Farewell!\n'));
    closePromptInterface();
    process.exit(0);
  }

  if (normalized === 'clear' || normalized === 'cls') {
    clearScreen();
    return true;
  }

  if (normalized === 'ghost --help' || normalized === '--help' || normalized === '-h') {
    console.log(chalk.cyanBright('\nGhostShell Help:'));
    console.log('  Type any shell command (e.g. git status, ls, npm install)');
    console.log('  The ghost will react before your command executes.');
    console.log('\nOptions:');
    console.log('  ghost --help     Show this help screen');
    console.log('  ghost --version  Show GhostShell version');
    console.log('  ghost --mute     Toggle voice playback');
    console.log('  exit, quit       Leave GhostShell\n');
    return true;
  }

  if (normalized === 'ghost --version' || normalized === '--version' || normalized === '-v') {
    console.log(chalk.cyanBright(`\n👻 ${config.app.name} v${config.app.version}\n`));
    return true;
  }

  if (normalized === 'ghost --mute' || normalized === '--mute') {
    config.audio.muted = !config.audio.muted;
    const state = config.audio.muted ? chalk.yellow('MUTED') : chalk.green('UNMUTED');
    console.log(chalk.cyanBright(`\n👻 Ghost voice is now ${state}.\n`));
    return true;
  }

  return false;
}

/**
 * Executes a single command through the full GhostShell pipeline:
 * 1. AI generates dialogue based on user command.
 * 2. UI renders ghost character and dialogue.
 * 3. Voice plays dialogue speech (if unmuted).
 * 4. Executor runs the UNMODIFIED original user command.
 *
 * @param {string} userCommand - Raw shell command entered by the user
 */
export async function processCommand(userCommand) {
  if (!userCommand || !userCommand.trim()) return;

  // Check if it is a built-in session command
  if (handleBuiltinCommands(userCommand)) return;

  try {
    // Step 1: AI generates contextual dialogue
    const dialogue = await generateDialogue(userCommand);

    // Step 2: UI renders ghost character
    renderGhost();

    // Step 3: UI displays dialogue
    renderDialogue(dialogue);

    // Step 4: Voice synthesis and audio playback
    if (!config.audio.muted) {
      const audioBuffer = await elevenlabsVoice.synthesizeSpeech({ text: dialogue });
      if (audioBuffer) {
        await audioPlayer.play(audioBuffer);
      }
    }

    // Step 5: Execute original, UNCHANGED command
    await executeCommand(userCommand);
  } catch (err) {
    logger.error('Session processing error:', err.message);
  } finally {
    renderDivider();
  }
}

/**
 * Starts the interactive GhostShell session loop.
 */
export async function startSession() {
  renderBanner();

  let active = true;

  while (active) {
    const command = await readCommand();

    if (command) {
      await processCommand(command);
    }
  }
}

