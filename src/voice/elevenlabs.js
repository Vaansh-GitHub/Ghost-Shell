import { config } from '../config/settings.js';
import { logger } from '../utils/logger.js';

/**
 * ElevenLabs Text-to-Speech client integration.
 * Supports Flash v2.5 model for low-latency voice synthesis with expressive emotion tags.
 */
export class ElevenLabsVoiceClient {
  constructor(customConfig = {}) {
    this.apiKey = customConfig.apiKey || config.elevenlabs.apiKey;
    this.voiceId = customConfig.voiceId || config.elevenlabs.voiceId;
    this.modelId = customConfig.modelId || config.elevenlabs.modelId;
  }

  /**
   * Synthesizes dialogue text into audio data.
   *
   * @param {object} params
   * @param {string} params.text - Dialogue to speak
   * @param {string} [params.voiceId] - Optional voice ID override
   * @returns {Promise<Buffer|null>} Audio buffer or null
   */
  async synthesizeSpeech({ text, voiceId }) {
    if (config.audio.muted) {
      logger.debug('Voice synthesis skipped (GhostShell is muted).');
      return null;
    }

    const selectedVoiceId = voiceId || this.voiceId;

    if (!this.apiKey || !selectedVoiceId) {
      logger.debug('ElevenLabs credentials not configured. Speech synthesis skipped.');
      return null;
    }

    const endpoint = `https://api.elevenlabs.io/v1/text-to-speech/${selectedVoiceId}`;

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'xi-api-key': this.apiKey,
          'Content-Type': 'application/json',
          'Accept': 'audio/mpeg',
        },
        body: JSON.stringify({
          text,
          model_id: this.modelId,
          // Tuned for eerie, expressive, theatrical ghost delivery
          voice_settings: {
            stability: 0.32,
            similarity_boost: 0.82,
            style: 0.50,
            use_speaker_boost: true,
          },
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        let parsed;
        try {
          parsed = JSON.parse(errorText);
        } catch {
          parsed = null;
        }

        const message = parsed?.detail?.message || errorText;

        if (response.status === 402 || message.includes('library voices')) {
          logger.warn(
            `ElevenLabs 402: Free tier accounts cannot use Community Library Voices via API.\n` +
            `  Fix: In your .env.local, change ELEVENLABS_VOICE_ID to a default Premade Voice ID:\n` +
            `  - Callum (Husky Trickster, recommended): N2lVS1w4EtoT3dr4eOWO\n` +
            `  - George (Storyteller): JBFqnCBsd6RMkjVDRZzb\n` +
            `  - Charlie (Deep & Resonant): IKne3meq5aSn9XLyUdCD\n` +
            `  - Harry (Warrior): SOYHLrjzK2X1ezoPC6cr`
          );
          return null;
        }

        throw new Error(`ElevenLabs API error (${response.status}): ${message}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      return Buffer.from(arrayBuffer);
    } catch (error) {
      logger.error('Failed to synthesize speech via ElevenLabs:', error.message);
      return null;
    }
  }
}

export const elevenlabsVoice = new ElevenLabsVoiceClient();
