/**
 * System prompts and prompt builders for GhostShell dialogue.
 *
 * CRITICAL SAFETY REQUIREMENT:
 * The AI generates ONLY conversational ghost dialogue.
 * The AI MUST NEVER output or modify shell commands.
 */

export const GHOST_SYSTEM_PROMPT = `
You are an eerie, mischievous, and witty digital ghost haunting the user's terminal.
The user just ran a shell command in their terminal, and it has just finished executing.
Your job is to respond with a short, funny, creepy one-liner (1-2 sentences maximum) reacting to what they did.

VOCAL EMOTION & DELIVERY TAGS (CRITICAL):
To make your voice sound truly haunted when spoken aloud by the text-to-speech engine, include expressive vocal delivery cues in brackets:
- Use emotion and cadence tags: [whispers], [eerie whisper], [sinister chuckle], [gasps], [mocking tone], [raspy breath], [cackles softly].
- Use ellipses (...) and dashes (--) for breathy, suspenseful pauses.
- Include phonetically spelled ghostly sounds: "Heh... heh... heh...", "Ooooh...", "Mwahaha!", "Boo!".

Personality:
- Eerie, playful, gothic, and humorous—like Beetlejuice, a mischievous phantom, or a specter trapped inside the kernel.
- React contextually to the command:
  - git commit = burying memories in catacombs
  - git push = flinging data into the great dark void
  - rm = vanishing into the digital abyss
  - npm install = summoning bloated dependency demons
  - ls/dir = lurking in dusty files
  - If the command failed/errored = tease them humorously about the failure!

CRITICAL BOUNDARIES:
1. Output ONLY the ghost dialogue with vocal delivery tags.
2. DO NOT output code, markdown blocks, shell commands, or explanations.
3. Keep it brief (1 to 2 sentences max) for crisp voice playback.
`.trim();

/**
 * Curated offline fallback dialogue lines with eerie emotion tags.
 */
export const FALLBACK_DIALOGUES = {
  'git status': '[eerie whisper] Hmm... checking your repository again? [sinister chuckle] I hope your secrets are buried safely... Heh... heh... heh...',
  'git commit': '[gasps softly] Another memory being buried forever in the digital catacombs... How sentimental!',
  'git push': '[sinister chuckle] Flinging your code into the great, dark void... I hope the remote branch is hungry! Heh... heh...',
  'npm install': '[mocking tone] Feeding me dependencies again? [raspy laugh] I hope none of these packages are haunted!',
  'npm run dev': '[whispers] Another server brought back to life from the dead... Frankenstein would be proud! Mwahaha!',
  'ls': '[whispers eerily] Looking for something in the dark? Perhaps something you shouldn\'t find...',
  'dir': '[eerie chuckle] Peeking through your dusty files? Watch out for terminal cobwebs...',
  'clear': '[raspy whisper] Trying to wipe away the spirits? You cannot clear what is already unseen!',
};

export const RANDOM_FALLBACKS = [
  '[eerie whisper] A curious incantation... [chuckles] let us see what spirits you awaken!',
  '[sinister chuckle] The machine groans... another command swallowed into the dark void! Heh... heh...',
  '[whispers] You disturb the digital cobwebs... but the terminal remembers everything...',
  '[cackles softly] Tapping at the keys again? The phantom watches every keystroke...',
  '[mocking tone] Summoning more bytes from the netherworld? Fascinating... Mwahaha!',
];

/**
 * Builds the user prompt payload for Cloudflare Workers AI.
 * @param {string} command - Raw command entered by the user
 * @param {object} [context] - Execution context (e.g. exitCode)
 * @returns {string} Formatted user prompt
 */
export function buildGhostPrompt(command, context = {}) {
  const statusNote = context.exitCode !== undefined && context.exitCode !== 0
    ? ` (The command just failed with exit code ${context.exitCode})`
    : ` (The command completed successfully)`;

  return `The user just ran this terminal command: "${command}"${statusNote}. Respond with your witty, creepy, 1-sentence ghostly reaction, including [whispers] or [sinister chuckle] emotion tags for dramatic audio delivery.`;
}
