import chalk from 'chalk';
import { config } from '../config/settings.js';

const LOG_LEVELS = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const currentLevel = LOG_LEVELS[config.app.logLevel.toLowerCase()] ?? LOG_LEVELS.info;

/**
 * Clean terminal logging utilities with chalk styling.
 */
export const logger = {
  debug(...args) {
    if (currentLevel <= LOG_LEVELS.debug) {
      console.log(chalk.gray('[DEBUG]', ...args));
    }
  },

  info(...args) {
    if (currentLevel <= LOG_LEVELS.info) {
      console.log(chalk.blue('ℹ', ...args));
    }
  },

  warn(...args) {
    if (currentLevel <= LOG_LEVELS.warn) {
      console.warn(chalk.yellow('⚠', ...args));
    }
  },

  error(...args) {
    if (currentLevel <= LOG_LEVELS.error) {
      console.error(chalk.red('✖', ...args));
    }
  },

  ghost(...args) {
    console.log(chalk.cyanBright('👻', ...args));
  },
};

