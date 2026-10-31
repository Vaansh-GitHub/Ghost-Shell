import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import chalk from 'chalk';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const GHOST_ASSET_PATH = path.resolve(__dirname, '../../assets/ghost.txt');

/**
 * Loads the raw ASCII ghost art from assets/ghost.txt.
 * @returns {string}
 */
export function getGhostAscii() {
  try {
    return fs.readFileSync(GHOST_ASSET_PATH, 'utf-8');
  } catch {
    // Fallback inline ASCII if file is missing
    return `
                     ..
                 .:-::....
                -0-:. .. .:..
              .10-:... .:
             .1:.:--:.  ::        ..
             -:    .:-:: ::.      ..:.
    .:.     -: -*: +#-.-:..::::::....
  .-0::-.   :: :*1 1+.  -. ..:..::.
  ::.:..:-.  :-:       .-.:.    .:-:.
    :.  ::----:::::.  .-:.       .:----:::.......  ......
   .-:. -..:.: .  .:  :.. .  .  .. .::---:..       :.    :
 .--::-:.-::..: . :..  :: .  ..  ..  ...::--:::::::...    .
.:-:1-:-..--:::-..::..  ::.. ..   .. .........:::.    :.    .
:--1#*01:..:--::-:.-.:.  :-.. .. .   . ......::-:.   ..
:-1+#*10:.. -:. .: :-::.  :-::.:....       ..:--:-:.            .
.-------:.. .:   ...----.. ::::--:.::::::.  :-.   .:::.....
 ..::::.          . .- :-:::::::---:.:..:::::-..     ..     .
    :.            .. .  .:-. .:-:----:::.   ..:::.   .
    .                     ::    ..::::---:.     .. ...  .
                           ..          ::.......   ..
                                               ..      .
    `.trim();
  }
}

/**
 * Applies multi-tier Matrix CRT glow shading to the ASCII ghost art.
 * - Eyes and lantern flame: luminous neon lime/white-green
 * - Lantern cage & prominent cloak contours: bright matrix green
 * - Flowing binary digits (0, 1): classic terminal green
 * - Subtle trailing wisps & embers: deep shadow green
 *
 * @param {string} rawAscii
 * @returns {string}
 */
export function formatMatrixGhost(rawAscii) {
  const lines = rawAscii.split(/\r?\n/);

  const styledLines = lines.map((line, lineIdx) => {
    const chars = line.split('');

    return chars.map((ch, colIdx) => {
      if (ch === ' ') return ' ';

      // 1. Glowing eyes (lines 6 & 7, cols 14..22)
      if ((lineIdx === 6 || lineIdx === 7) && colIdx >= 14 && colIdx <= 22 &&
          (ch === '*' || ch === '#' || ch === '+' || ch === '1')) {
        return chalk.bold.hex('#75ffaa')(ch);
      }

      // 2. Glowing lantern flame (lines 13 & 14, cols 3..8)
      if ((lineIdx === 13 || lineIdx === 14) && colIdx >= 3 && colIdx <= 8 &&
          (ch === '*' || ch === '#' || ch === '+' || ch === '1' || ch === '0')) {
        return chalk.bold.hex('#88ffbb')(ch);
      }

      // 3. Lantern frame, chain & hand (lines 6-16, cols 0..9)
      if (lineIdx >= 6 && lineIdx <= 16 && colIdx <= 9 &&
          (ch === '-' || ch === '.' || ch === ':' || ch === '1' || ch === '0')) {
        return chalk.hex('#00ff66')(ch);
      }

      // 4. Matrix binary digits & prominent code glyphs
      if (ch === '0' || ch === '1' || ch === '#' || ch === '%' || ch === '@' || ch === '*') {
        return chalk.hex('#00ee55')(ch);
      }

      // 5. Cloak midtone folds
      if (ch === '-' || ch === '=' || ch === '+') {
        return chalk.hex('#00aa33')(ch);
      }

      // 6. Deep background wisps, dust, colons, and dots
      return chalk.hex('#005511')(ch);
    }).join('');
  });

  return styledLines.join('\n');
}

/**
 * Renders the matrix ghost character with terminal styling.
 * @param {object} [options]
 * @param {string} [options.theme='matrix'] - Color theme ('matrix', 'cyan', 'mono')
 */
export function renderGhost(options = {}) {
  const ascii = getGhostAscii();

  if (options.theme === 'cyan') {
    console.log(chalk.cyanBright(ascii));
    return;
  }

  if (options.theme === 'mono') {
    console.log(ascii);
    return;
  }

  // Default: Authentic Glowing Matrix Theme
  console.log(formatMatrixGhost(ascii));
}
