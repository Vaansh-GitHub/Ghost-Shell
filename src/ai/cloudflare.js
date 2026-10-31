import { config } from '../config/settings.js';
import { logger } from '../utils/logger.js';

/**
 * Cloudflare Workers AI client wrapper.
 * Target model: @cf/google/gemma-4-26b-a4b-it
 */
export class CloudflareAIClient {
  constructor(customConfig = {}) {
    this.accountId = customConfig.accountId || config.cloudflare.accountId;
    this.apiToken = customConfig.apiToken || config.cloudflare.apiToken;
    this.model = customConfig.model || config.cloudflare.model;
  }

  /**
   * Executes a text generation query against Cloudflare Workers AI.
   * In this setup phase, returns a mock response if credentials are not configured.
   *
   * @param {object} params
   * @param {string} params.prompt - User message / prompt
   * @param {string} [params.systemPrompt] - System instructions
   * @returns {Promise<string>} Generated dialogue text
   */
  async generateText({ prompt, systemPrompt }) {
    if (!this.accountId || !this.apiToken) {
      logger.debug('Cloudflare credentials not configured. Using starter placeholder.');
      return null;
    }

    const endpoint = `https://api.cloudflare.com/client/v4/accounts/${this.accountId}/ai/run/${this.model}`;

    const messages = [];
    if (systemPrompt) {
      messages.push({ role: 'system', content: systemPrompt });
    }
    messages.push({ role: 'user', content: prompt });

    try {
      // Native Node 18+ fetch API
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Cloudflare AI API error (${response.status}): ${errorText}`);
      }

      const data = await response.json();
      const text = data?.result?.choices?.[0]?.message?.content || data?.result?.response;
      return text?.trim() || null;
    } catch (error) {
      logger.error('Failed to communicate with Cloudflare Workers AI:', error.message);
      return null;
    }
  }
}

export const cloudflareAI = new CloudflareAIClient();

