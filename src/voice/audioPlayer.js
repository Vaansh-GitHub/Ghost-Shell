import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { spawn } from 'node:child_process';
import { config } from '../config/settings.js';
import { logger } from '../utils/logger.js';

/**
 * Handles cross-platform audio playback.
 * Automatically uses ffplay if available, with built-in native Windows fallback.
 */
export class AudioPlayer {
  constructor() {
    this.playerBinary = config.audio.player || 'ffplay';
    this.tempDir = path.join(os.tmpdir(), 'ghostshell-audio');
  }

  /**
   * Ensures the temporary audio directory exists.
   */
  ensureTempDir() {
    if (!fs.existsSync(this.tempDir)) {
      fs.mkdirSync(this.tempDir, { recursive: true });
    }
  }

  /**
   * Plays audio using native Windows PowerShell MediaPlayer.
   * Useful when ffplay / ffmpeg is not installed on Windows.
   *
   * @param {string} filePath
   * @returns {Promise<boolean>}
   */
  async playWindowsNative(filePath) {
    return new Promise((resolve) => {
      const normalizedPath = filePath.replace(/\\/g, '/');
      const psCommand = `Add-Type -AssemblyName PresentationCore; $p = New-Object System.Windows.Media.MediaPlayer; $p.Open([System.Uri]'${normalizedPath}'); $p.Play(); Start-Sleep -Milliseconds 400; $t = 0; while ((!$p.NaturalDuration.HasTimeSpan -or $p.Position -lt $p.NaturalDuration.TimeSpan) -and $t -lt 150) { Start-Sleep -Milliseconds 100; $t++ }; $p.Close();`;

      const child = spawn('powershell', ['-NoProfile', '-NonInteractive', '-Command', psCommand], {
        stdio: 'ignore',
        windowsHide: true,
      });

      child.on('error', (err) => {
        logger.debug(`Windows native audio player error: ${err.message}`);
        resolve(false);
      });

      child.on('close', (code) => {
        resolve(code === 0);
      });
    });
  }

  /**
   * Plays audio buffer or file path.
   *
   * @param {Buffer|string} audioInput - Audio buffer or path to audio file
   * @returns {Promise<boolean>} Resolves true when playback completes or is skipped
   */
  async play(audioInput) {
    if (config.audio.muted || !audioInput) {
      return true;
    }

    let filePath = audioInput;
    let isTempFile = false;

    if (Buffer.isBuffer(audioInput)) {
      this.ensureTempDir();
      filePath = path.join(this.tempDir, `ghost_${Date.now()}.mp3`);
      fs.writeFileSync(filePath, audioInput);
      isTempFile = true;
    }

    const cleanup = () => {
      if (isTempFile && fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch {
          // Ignore cleanup errors
        }
      }
    };

    // Try configured player (e.g., ffplay)
    const playedWithBinary = await new Promise((resolve) => {
      const args = ['-nodisp', '-autoexit', '-loglevel', 'quiet', filePath];

      const child = spawn(this.playerBinary, args, {
        stdio: 'ignore',
        windowsHide: true,
      });

      child.on('error', () => {
        // Player binary not found
        resolve(false);
      });

      child.on('close', (code) => {
        resolve(code === 0);
      });
    });

    if (playedWithBinary) {
      cleanup();
      return true;
    }

    // Windows fallback: Native PowerShell MediaPlayer
    if (process.platform === 'win32') {
      logger.debug('ffplay not found. Falling back to native Windows audio player.');
      const playedWithWindows = await this.playWindowsNative(filePath);
      cleanup();
      if (playedWithWindows) {
        return true;
      }
    }

    cleanup();
    logger.debug('No compatible audio player found (install ffplay or check audio output device).');
    return false;
  }
}

export const audioPlayer = new AudioPlayer();
