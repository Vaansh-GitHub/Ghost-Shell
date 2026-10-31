import chalk from 'chalk';

/**
 * Formats dialogue text by styling emotion/direction tags in purple italics.
 * @param {string} rawText
 * @returns {string}
 */
function styleEmotionTags(rawText) {
  // Matches tags like [whispers eerily] or *sinister chuckle*
  return rawText.replace(/(\[[^\]]+\]|\*[^*]+\*)/g, (match) => {
    return chalk.magentaBright.italic(match);
  });
}

/**
 * Renders the ghost's dialogue to the terminal with eerie styling and distinct emotion cues.
 * @param {string} text - Dialogue spoken by the ghost
 * @param {object} [options]
 * @param {string} [options.prefix='Ghost:']
 */
export function renderDialogue(text, options = {}) {
  const prefix = options.prefix ?? chalk.magentaBright.bold('👻 Ghost:');
  const styledContent = styleEmotionTags(text);
  const speech = chalk.italic.cyanBright(`"${styledContent}"`);
  console.log(`\n${prefix} ${speech}\n`);
}

/**
 * Displays dialogue with a subtle typewriter effect.
 * @param {string} text
 * @param {number} [speedMs=20]
 * @returns {Promise<void>}
 */
export async function typewriterDialogue(text, speedMs = 20) {
  process.stdout.write(chalk.magentaBright.bold('👻 Ghost: ') + chalk.italic.cyanBright('"'));
  for (const char of text) {
    process.stdout.write(chalk.italic.cyanBright(char));
    await new Promise((resolve) => setTimeout(resolve, speedMs));
  }
  process.stdout.write(chalk.italic.cyanBright('"\n\n'));
}
