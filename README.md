# GhostShell 👻

> An AI-powered, voice-enabled terminal experience with a playful, eerie ghost personality.

---

## 1. Overview

**GhostShell** is a wrapper terminal session that haunts your command line. When you enter standard shell commands (such as `git status`, `npm install`, or `ls`), a ghostly companion appears, delivers a witty, eerie one-liner commenting on your command, speaks the dialogue aloud via Text-to-Speech, and then lets your original shell command execute normally.

### Example Interaction

```text
ghost❯ git status

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

👻 Ghost: "[eerie whisper] Hmm... checking your repository again? [sinister chuckle] I hope your secrets are buried safely... Heh... heh... heh..."

[Audio plays voice line]

On branch main
Your branch is up to date with 'origin/main'.
nothing to commit, working tree clean
────────────────────────────────────────────────────────────
```

---

## 2. Architecture & Design Principles

GhostShell is built with a modular, decoupled architecture ensuring clean boundaries between CLI interaction, AI dialogue generation, voice synthesis, audio playback, and shell execution.

```
                   ┌────────────────────────────┐
                   │        User Input          │
                   │    (e.g., `git status`)    │
                   └─────────────┬──────────────┘
                                 │
                 ┌───────────────┴───────────────┐
                 │                               │
                 ▼                               ▼
    ┌─────────────────────────┐     ┌─────────────────────────┐
    │     AI Dialogue Gen     │     │      Raw Command        │
    │  Cloudflare Workers AI  │     │       (Preserved)       │
    │ (Gemma 4 26B A4B IT)    │     └────────────┬────────────┘
    └────────────┬────────────┘                  │
                 │                               │
                 ▼                               │
    ┌─────────────────────────┐                  │
    │     Voice Synthesis     │                  │
    │  ElevenLabs Flash v2.5  │                  │
    │   & FFmpeg Audio Play   │                  │
    └────────────┬────────────┘                  │
                 │                               │
                 ▼                               │
    ┌─────────────────────────┐                  │
    │     UI Presentation     │                  │
    │   Ghost ASCII + Chalk   │                  │
    └────────────┬────────────┘                  │
                 │                               │
                 └───────────────┬───────────────┘
                                 ▼
                    ┌─────────────────────────┐
                    │    Command Executor     │
                    │  (Runs ORIGINAL command │
                    │   via native spawn)     │
                    └─────────────────────────┘
```

### Critical Architectural Safety Boundary

- **The AI NEVER generates, modifies, or executes shell commands.**
- The AI's sole responsibility is generating character dialogue.
- The command executor receives and runs the **exact, unmodified** command entered by the human user.
- AI dialogue text is **never** piped into the shell.

---

## 3. Technology Stack

- **Runtime:** Node.js (>= 18.0.0 with native `fetch` and ES Modules)
- **Language:** JavaScript (ESM, `"type": "module"`)
- **CLI Interaction:** Node.js native `readline/promises`
- **Terminal Styling:** `chalk` (v5)
- **AI Text Generation:** Cloudflare Workers AI with `@cf/google/gemma-4-26b-a4b-it`
- **Text-to-Speech:** ElevenLabs Flash v2.5 (via Cloudflare partner integration or direct API)
- **Audio Playback:** FFmpeg / `ffplay` with Windows and POSIX compatibility
- **Environment Management:** `dotenv`

---

## 4. Directory Structure

```text
ghostshell/
│
├── src/
│   ├── index.js                  # Main CLI entry point and argument dispatcher
│   │
│   ├── cli/
│   │   ├── input.js              # Readline interface and user prompt handling
│   │   └── session.js            # Interactive REPL session lifecycle loop
│   │
│   ├── ai/
│   │   ├── cloudflare.js         # Cloudflare Workers AI client wrapper
│   │   ├── dialogueGenerator.js  # Orchestrates dialogue generation & sanitization
│   │   └── prompts.js            # Ghost persona prompt & offline fallbacks
│   │
│   ├── voice/
│   │   ├── elevenlabs.js         # ElevenLabs Flash v2.5 TTS client wrapper
│   │   └── audioPlayer.js        # Cross-platform audio playback engine (ffplay)
│   │
│   ├── executor/
│   │   └── commandExecutor.js    # Safe, unmodified shell command execution
│   │
│   ├── ui/
│   │   ├── ghost.js              # ASCII ghost art loader and renderer
│   │   ├── dialogue.js           # Ghost dialogue formatting & typewriter effect
│   │   └── terminal.js           # Terminal banners, dividers, and screen clearing
│   │
│   ├── config/
│   │   └── settings.js           # Centralized configuration and env validation
│   │
│   └── utils/
│       └── logger.js             # Chalk-styled terminal logging utilities
│
├── assets/
│   └── ghost.txt                 # ASCII art representation of the ghost
│
├── .env.example                  # Template for required environment variables
├── .gitignore                    # Git exclusions (node_modules, audio, .env)
├── package.json                  # Project manifest, dependencies, and scripts
└── README.md                     # Project documentation
```

### Module Responsibilities

| Directory / File | Responsibility |
|---|---|
| `src/cli/` | Manages terminal input, command-line arguments, built-in commands (`--help`, `--version`, `--mute`, `exit`), and the interactive session loop. |
| `src/ai/` | Handles prompt creation, Cloudflare Workers AI communication, and offline fallback responses. Enforces dialogue-only outputs. |
| `src/voice/` | Converts ghost dialogue to speech via ElevenLabs Flash v2.5 and manages cross-platform audio playback via `ffplay`. |
| `src/ui/` | Manages ASCII rendering, dialogue presentation, typewriter effects, and terminal formatting with Chalk. |
| `src/executor/` | Spawns and monitors the user's raw shell command with `stdio: 'inherit'`, preserving command behavior, colors, and interactive prompts. |
| `src/config/` | Centralizes environment variables, model identifiers, and provides configuration validation. |
| `src/utils/` | Shared utilities like styled logging and error reporting. |
| `assets/` | Static visual assets including ASCII character files. |

---

## 5. Getting Started

### Prerequisites

- **Node.js**: Version 18.0.0 or higher.
- **FFmpeg / ffplay (Optional, for voice playback):**
  - Windows: Install via `winget install Gyan.FFmpeg` or `choco install ffmpeg`.
  - macOS: `brew install ffmpeg`
  - Linux: `sudo apt install ffmpeg`
  *(If FFmpeg is not installed, GhostShell runs normally in text mode without errors).*

### Installation

1. Navigate to the `ghostshell` directory:
   ```bash
   cd ghostshell
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables (optional for initial offline mode):
   ```bash
   cp .env.example .env
   ```
   *(On Windows PowerShell, use `Copy-Item .env.example .env`)*

4. Open `.env` and fill in your Cloudflare and ElevenLabs credentials when ready.

---

## 6. Running GhostShell

### Interactive Mode
Start the interactive ghost terminal session:
```bash
npm start
```
or directly:
```bash
node src/index.js
```

### Single Command Mode
Execute a single command through the ghost pipeline:
```bash
node src/index.js git status
```

### Built-in Options
```bash
node src/index.js --help
node src/index.js --version
node src/index.js --mute
```

During an active session, you can also type:
- `ghost --mute` to toggle audio on/off
- `ghost --help` to show options
- `exit` or `quit` to leave GhostShell

---

## 7. Roadmap & Upcoming Phases

- [x] **Phase 1: Project Setup & Architecture Foundation** (Completed)
- [ ] **Phase 2: Cloudflare Workers AI Integration & Prompt Tuning**
- [ ] **Phase 3: ElevenLabs Voice Integration & Audio Stream Pipeline**
- [ ] **Phase 4: Terminal Animation & Enhanced ASCII Expressions**
- [ ] **Phase 5: Global CLI Linking (`npm link` / `ghost` executable)**

