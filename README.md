# NamelessStory

Want to make a visual novel but don't know how to code? NamelessStory is an open-source visual novel engine that lets you create your own interactive story by writing a single JSON file. No programming required — just write your story, drop in your images and music, and play.

![React.js version](https://img.shields.io/badge/React.js-^19.2.0-61DAFB?style=for-the-badge)
![License](https://img.shields.io/github/license/NamelessProj/NamelessStory?style=for-the-badge)
![Repo size](https://img.shields.io/github/repo-size/NamelessProj/NamelessStory?style=for-the-badge)
[![Codacy Badge](https://img.shields.io/badge/code_quality-B-brightgreen?style=for-the-badge&logo=codacy)](https://app.codacy.com/gh/NamelessProj/NamelessStory/dashboard?utm_source=gh&utm_medium=referral&utm_content=&utm_campaign=Badge_grade)

## Table of Contents

1. [What is NamelessStory?](#what-is-namelessstory)
2. [Getting Started (Running Locally)](#getting-started-running-locally)
3. [Project Structure](#project-structure)
4. [Writing Your Story](#writing-your-story)
   - [The Story File](#the-story-file)
   - [Settings](#settings)
   - [Characters](#characters)
   - [Scenes and Dialogues](#scenes-and-dialogues)
   - [Player Choices (Options)](#player-choices-options)
   - [Player Text Input](#player-text-input)
   - [Character Sprites](#character-sprites)
   - [Background Music](#background-music)
   - [Text Formatting and Variables](#text-formatting-and-variables)
   - [Navigating Between Scenes](#navigating-between-scenes)
5. [Where to Put Your Files](#where-to-put-your-files)
6. [Connecting Your Story to the App](#connecting-your-story-to-the-app)
7. [What You Can Customize](#what-you-can-customize)
8. [Saving and Loading](#saving-and-loading)
9. [Deploying Online for Free (GitHub + Vercel)](#deploying-online-for-free-github--vercel)
10. [Contributing](#contributing)
11. [Disclaimer](#disclaimer)
12. [License](#license)

## What is NamelessStory?

NamelessStory is a web-based visual novel engine built with React and TypeScript. It renders interactive stories from a JSON script file — think of it like a screenplay format for games.

**As a user (story creator)**, you only need to:
- Write a `.json` file describing your story
- Add your images to `public/assets/`
- Add your music to `public/audio/`
- Run one command to play it

**As a player**, they get a classic visual novel experience: background images, character portraits, dialogue, choices, and music.

## Getting Started (Running Locally)

### Prerequisites

You need **Node.js** installed on your machine. Download it at [nodejs.org](https://nodejs.org/). The installer also includes `npm` (the package manager), so you only need to install Node.js.

> **Not sure if you have it?** Open a terminal and run `node -v`. If you see a version number, you're good.

### Steps

**1. Get the project**

If you have Git:
```bash
git clone https://github.com/NamelessProj/NamelessStory.git
cd NamelessStory
```

Or download the ZIP from GitHub and unzip it, then open a terminal in that folder.

**2. Install dependencies**
```bash
npm install
```
This downloads all the libraries the engine needs. It only needs to be done once.

**3. Start the development server**
```bash
npm run dev
```

Open your browser and go to `http://localhost:5173`. You'll see the sample story running.

**Stop the server** with `Ctrl + C` in the terminal.

## Project Structure

Here is what matters to you as a story creator:

```
NamelessStory/
│
├── public/                   ← Your content goes here
│   ├── assets/               ← Background images & character sprites
│   ├── audio/                ← Background music files
│   └── story/                ← Your story JSON files
│       └── story.sample.json ← Start here as a template
│
└── src/
    └── App.tsx               ← Point this to your story file
```

You should not need to touch anything else to create a story. The engine code is in `src/` and handles everything else automatically.

## Writing Your Story

### The Story File

Your story lives in a single JSON file inside `public/story/`. Start by copying `story.sample.json` and renaming it (e.g., `my_story.json`).

> [!IMPORTANT]
> DO NOT put spaces in the name of your file! This could lead to unexpected errors. Here's what you could use instead of spaces: `.`, `-`, `_`.

A story file has three top-level sections:

```json
{
  "settings": { ... },
  "characters": { ... },
  "story": { ... }
}
```

### Settings

The `settings` block controls global options, the title screen, and the credits screen.

```json
"settings": {
  "startingScene": "start",
  "textSpeed": 50,
  "defaultNameDisplay": "short",

  "titlePage": {
    "title": "My Visual Novel",
    "background": "title_bg.png",
    "buttons": {
      "start": "Start Game",
      "continue": "Continue",
      "load": "Load Save File",
      "credits": "Credits"
    }
  },

  "creditsPage": {
    "title": "Credits",
    "background": "title_bg.png",
    "scrollDurationInSeconds": 30,
    "creditGroups": [
      {
        "groupName": "Story & Writing",
        "credits": [
          { "name": "Your Name", "role": "Writer" }
        ]
      }
    ]
  }
}
```

| Field | Required | Description |
|-------|----------|-------------|
| `startingScene` | :heavy_check_mark: (Yes) | The ID of the first scene to play |
| `textSpeed` | :x: (No) | Typing animation speed. Lower = faster. Default: `50` |
| `defaultNameDisplay` | :x: (No) | `"short"` (default) or `"full"` — which character name to show |
| `titlePage.title` | :heavy_check_mark: (Yes) | Your game's title |
| `titlePage.background` | :heavy_check_mark: (Yes) | Background image filename (from `public/assets/`) |
| `titlePage.buttons` | :x: (No) | Custom button labels. You can custom just 1 or 2 if you want also. |
| `creditsPage.scrollDurationInSeconds` | :x: (No) | How long the credits take to scroll (seconds) |

### Characters

Define all your speaking characters in the `characters` block. Each character gets a unique ID (you choose the name), a display name, a color, and optionally sprite images.

```json
"characters": {
  "Alice": {
    "name": "Alice",
    "fullName": "Alice Smith",
    "color": "red",
    "sprite": {
      "idle": "alice_idle.png",
      "happy": "alice_happy.png",
      "wave": "alice_wave.png"
    }
  },
  "Bob": {
    "name": "Bob",
    "color": "#4488ff"
  },
  "playerName": {
    "name": "",
    "color": "green"
  }
}
```

| Field | Required | Description |
|-------|----------|-------------|
| `name` | :heavy_check_mark: (Yes) | Short display name shown in the dialogue box |
| `fullName` | :x: (No) | Long name (used when `nameDisplay` is `"full"`) |
| `color` | :heavy_check_mark: (Yes) | Name text color — any CSS color (`red`, `#FF0000`, `rgb(255, 0, 0)`) |
| `sprite` | :x: (No) | An object mapping variant names to image filenames |

**The `playerName` variable:** To store the player's name, create a character with an empty `name` field (like above). Use a meaningful ID like `"playerName"` or `"hero"`. You can then prompt the player to type their name and use it in dialogue later. The variable system will be explained further down (see [Player Text Input](#player-text-input)).

### Scenes and Dialogues

The `story` block contains your scenes, each with a list of dialogues that play in order.

```json
"story": {
  "intro": {
    "background": "forest.png",
    "bgmFile": "music_01.mp3",
    "dialogues": [
      {
        "name": "",
        "text": "It was a quiet evening in the forest."
      },
      {
        "name": "Alice",
        "text": "Hello? Is anyone there?"
      },
      {
        "name": "Alice",
        "text": "I could have sworn I heard something...",
        "next": "scene02"
      }
    ]
  },
  "scene02": { ... }
}
```

**Scene fields:**

| Field | Required | Description |
|-------|----------|-------------|
| `background` | :heavy_check_mark: (Yes) | Background image filename |
| `bgmFile` | :x: (No) | Music file or music command (see [Background Music](#background-music)) |
| `bgmLoop` | :x: (No) | Whether music loops. Default: `true` |
| `dialogues` | :heavy_check_mark: (Yes) | Array of dialogue objects |

**Dialogue fields:**

| Field | Required | Description |
|-------|----------|-------------|
| `text` | :heavy_check_mark: (Yes) | The dialogue text |
| `name` | :heavy_check_mark: (Yes) | Character ID whose name is shown. Use `""` for narration |
| `next` | :x: (No) | Where to go after this line (only used when reaching the last dialogue of a scene) (see [Navigating Between Scenes](#navigating-between-scenes)) |
| `textSpeed` | :x: (No) | Override typing speed for this line only |
| `nameDisplay` | :x: (No) | `"short"` or `"full"` — override for this line only |
| `background` | :x: (No) | Change the background image mid-scene |
| `options` | :x: (No) | Multiple-choice options (see [Player Choices](#player-choices-options)) |
| `input` | :x: (No) | Prompt the player to type something (see [Player Text Input](#player-text-input)) |
| `sprite` | :x: (No) | Show a character sprite (see [Character Sprites](#character-sprites)) |

### Player Choices (Options)

Add a `options` array to a dialogue to give the player a choice. Each option has a label and a destination.

```json
{
  "name": "Alice",
  "text": "What do you want to do?",
  "options": [
    { "text": "Go left",  "next": "path_left" },
    { "text": "Go right", "next": "path_right" },
    { "text": "Stay here", "next": "2" }
  ]
}
```

**Option `next` values:**

| Value | Effect |
|-------|--------|
| `"scene_id"` | Jump to the start of another scene |
| `"scene_id:3"` | Jump to a specific dialogue index in another scene |
| `"2"` | Jump to dialogue index 2 in the **current** scene |
| `""` | Continue to the next dialogue in the current scene |
| `"__end__"` | End the story and show credits |

> [!NOTE]
> Options and `input` cannot be used in the same dialogue.

### Player Text Input

Use `input` to prompt the player to type something (like their name). The value is stored and can be used later in text.

```json
{
  "name": "Alice",
  "text": "What's your name?",
  "input": {
    "value": "playerName"
  }
}
```

The `value` field is the character ID where the input will be stored. Make sure that ID exists in `characters` with an empty `name`. The player cannot proceed without typing something.

### Character Sprites

Use the `sprite` field in a dialogue to display a character portrait.

```json
{
  "name": "Alice",
  "text": "Look at this!",
  "sprite": {
    "name": "wave",
    "position": "right",
    "mirror": false
  }
}
```

| Field | Required | Description |
|-------|----------|-------------|
| `name` | :heavy_check_mark: (Yes) | Sprite variant name (must exist in the character's `sprite` object) |
| `position` | :x: (No) | `"left"`, `"center"`, or `"right"` (default: center) |
| `mirror` | :x: (No) | Flip the sprite horizontally. Default: `false` |

**Custom position:** Instead of a preset string, `position` can be an object:
```json
"position": { "x": 100, "y": 200 }
```
Where `x` is a pixel offset from center and `y` is the height.

**Sprites persist** within a scene until you specify a different one (or the scene changes). To hide a sprite, advance to a dialogue without a `sprite` field or change scenes.

### Background Music

Control music with the `bgmFile` field on a scene.

```json
"bgmFile": "music_01.mp3"
```

**Special values:**

| Value | Effect |
|-------|--------|
| `"filename.mp3"` | Play this file (stops any current music) |
| `"continue"` | Keep whatever music is currently playing |
| `"continue[filename.mp3]"` | Keep current music if it's already this file, otherwise play it |
| `"reset"` | Restart the current music from the beginning |
| `"none"` | Stop music |
| *(omit the field)* | No music |

The player can adjust or mute the volume from the top overlay bar during the game.

### Text Formatting and Variables

#### Pauses

Use `\.` to insert a 1-second pause and `\,` for a 0.5-second pause while the text types out.

```json
"text": "And then\\.. silence."
```

The `\` acts as the pause marker. Each character after it is a pause type:
- `.` → 1 second
- `,` → 0.5 seconds

#### Variables in Text

Use double curly braces `{{ }}` to insert character names or stored values into text dynamically.

| Syntax | Result |
|--------|--------|
| `{{Alice}}` | Alice's name (respects `defaultNameDisplay`) |
| `{{c!Alice}}` | Forces short name |
| `{{C!Alice}}` | Forces full name |
| `{{v!playerName}}` | The value stored in the `playerName` variable |

**Example:**
```json
{
  "name": "Alice",
  "text": "So, {{v!playerName}}, are you ready to meet {{C!Bob}}?"
}
```
If the player entered "Sam", this renders as: *"So, Sam, are you ready to meet Bob Johnson?"*

You can also use a variable as the speaker name:
```json
{
  "name": "{{v!playerName}}",
  "text": "That's me!"
}
```

### Navigating Between Scenes

Use the `next` field on the **last dialogue** of a scene to jump to another scene. If you don't include `next` on the last dialogue, the story ends and credits roll.

```json
{ "name": "Alice", "text": "See you later!", "next": "scene02" }
```

**`next` values for dialogue:**

| Value | Effect |
|-------|--------|
| `"scene_id"` | Jump to the start of that scene |
| `"scene_id:3"` | Jump to dialogue index 3 in that scene |
| `"__end__"` | End the story and show credits |
| *(omit)* | Go to the next dialogue. If it's the last one, end the story |

## Where to Put Your Files

```
public/
├── assets/        ← Images (backgrounds, character sprites)
│   ├── title_bg.png
│   ├── bg_forest.png
│   ├── alice_idle.png
│   └── ...
│
├── audio/         ← Music files
│   ├── music_01.mp3
│   ├── ambient.mp3
│   └── ...
│
└── story/         ← Story JSON files
    ├── story.sample.json
    └── my_story.json
```

**In your JSON, always reference files by filename only** (no path needed):
- `"background": "bg_forest.png"` — not `"assets/bg_forest.png"`
- `"bgmFile": "music_01.mp3"` — not `"audio/music_01.mp3"`

**Supported formats:**
- Images: PNG, JPG, GIF, WebP, SVG
- Audio: MP3 (recommended), WAV, OGG, M4A

## Connecting Your Story to the App

Once your story JSON is ready, open `src/App.tsx` and update the `scriptFile` prop to point to your file (without the `.json` extension):

```tsx
// src/App.tsx
<VNPlayer scriptFile="my_story" />
```

If your file is `public/story/my_story.json`, then `scriptFile="my_story"`.

## What You Can Customize

### Without touching code (JSON only)

- Story content, dialogue, branching paths
- Character names, colors, sprite variants
- Background images and music per scene
- Title screen title, background, and button labels
- Credits content and scroll speed
- Text typing speed (global, per scene, per dialogue)
- Player name collection and use throughout the story

### By setting CSS variables (easiest)

Every visual property is exposed as a CSS custom property. Create a file at `public/custom.css` — it is loaded automatically — and set any variables you want to override inside `:root`. You do not need to touch any source file.

```css
/* public/custom.css */
:root {
    --vn-dialogue-bg: rgba(20, 5, 40, 0.9);
    --vn-dialogue-border: 2px solid rgba(180, 100, 255, 0.4);
    --vn-text-color: #f0d0ff;
    --vn-option-bg: linear-gradient(135deg, rgba(140, 60, 200, 0.4), rgba(100, 20, 160, 0.2));
}
```

The full list of available variables is documented inside `public/custom.css`.

### By editing the module CSS files (full control)

Each component has its own `style.module.css` file with scoped styles. Editing these files gives you complete control over every visual detail without breaking functionality in other components (scoped styles cannot affect anything outside their own component).

| File | Controls |
|------|----------|
| `src/components/VisualNovelComponents/Dialogue/style.module.css` | Dialogue box, name label, text |
| `src/components/VisualNovelComponents/VNTopOverlay/style.module.css` | Top bar, fade-in/out transition |
| `src/components/VisualNovelComponents/VNBottomOverlay/style.module.css` | Bottom bar, overlay buttons |
| `src/components/VisualNovelComponents/UserOption/style.module.css` | Choice buttons |
| `src/components/VisualNovelComponents/UserInput/style.module.css` | Text input box |
| `src/components/VisualNovelComponents/CharacterFullSprite/style.module.css` | Character sprite positioning |
| `src/components/CreditsComponents/CreditsPage/style.module.css` | Credits scroll animation |
| `src/components/VolumeSlider/style.module.css` | Volume control widget |

### By editing React components (advanced)

The engine is fully open source. Developers can extend or change any behavior by modifying the components in `src/components/` or utilities in `src/utils/`.

**Core components to know:**
- `src/components/VNPlayer/` — loads the story and routes between pages
- `src/components/VisualNovelComponents/VisualNovel/` — the main game loop
- `src/components/VisualNovelComponents/Scene/` — renders the current dialogue
- `src/utils/typewriterUtils.ts` — text animation and variable substitution logic

## Saving and Loading

The engine has a built-in save system accessible during gameplay:

- **Auto-save to browser:** Progress is saved to a browser cookie automatically. When the player reopens the game, they can click "Continue" to pick up where they left off.
- **Save to file:** The bottom bar has a "Save" button that downloads a `.json` save file to the player's computer.
- **Load from file:** On the title screen, the "Load Save File" button lets the player load a previously saved `.json` file.

## Deploying Online for Free (GitHub + Vercel)

You can share your visual novel online for free using **GitHub** (to store your code) and **Vercel** (to host the website). No server needed.

### Step 1 — Put your project on GitHub

1. Create a free account at [github.com](https://github.com) if you don't have one.
2. Create a new repository (click the `+` button → "New repository"). Give it a name, make it **Public**, and click "Create repository".
3. Follow GitHub's instructions to push your local project. If you cloned NamelessStory, you'll want to change the remote origin to your own repo:
   ```bash
   git remote set-url origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
   git add .
   git commit -m "My visual novel"
   git push -u origin main
   ```

> [!NOTE]
> If you're not comfortable with Git, you can also drag and drop your files directly onto GitHub's web interface.

### Step 2 — Deploy with Vercel

1. Go to [vercel.com](https://vercel.com) and sign up (you can use your GitHub account).
2. Click **"Add New Project"** → **"Import Git Repository"**.
3. Select your GitHub repository from the list.
4. Vercel will automatically detect it's a Vite project. The default settings are correct — just click **"Deploy"**.
5. After a minute or two, Vercel gives you a public URL like `https://my-story.vercel.app`.

### Step 3 — Update your story (auto-deploy)

Every time you push a new commit to GitHub, Vercel automatically rebuilds and redeploys your site. No manual steps needed.

### Building manually

If you ever want to build the site yourself (e.g., to deploy elsewhere):
```bash
npm run build
```
This creates a `dist/` folder with all the static files. Upload that folder to any static hosting service (GitHub Pages, Netlify, Cloudflare Pages, etc.).

## Contributing

Contributions are welcome! If you find a bug, have a feature idea, or want to improve the documentation:

1. Fork the repository on GitHub
2. Create a new branch: `git checkout -b my-feature`
3. Make your changes and commit them
4. Open a Pull Request describing what you changed and why

Please keep the spirit of the project in mind: **accessibility first**. Changes should make it easier for non-programmers to create visual novels, not harder.

## Disclaimer

NamelessStory is provided **as is**, without any warranty of any kind, express or implied. By using, modifying, or distributing this software, you agree to the following:

**Third-party content.** NamelessStory is a tool for creating stories. The authors of NamelessStory are not responsible for any content created by users of this engine, including but not limited to story scripts, images, audio, or any other assets. Story creators are solely responsible for ensuring their content complies with applicable laws and does not infringe on third-party rights.

**Modified versions.** Because this project is open source, anyone can fork it, modify it, and distribute their own version. The original authors of NamelessStory have no control over, and accept no liability for, any modified version distributed by third parties. If you download a visual novel built on a fork of this engine, you are doing so at your own risk.

**Save files.** The engine allows players to load `.json` save files from their computer. Save files are plain text data — they cannot contain executable code or traditional viruses. However, a save file from an unknown source could contain unexpected values that interact with a modified or poorly secured fork of the engine. **Only load save files from sources you trust.** The original authors of NamelessStory accept no liability for any issues arising from loading save files created by or obtained from third parties.

**No liability.** To the maximum extent permitted by applicable law, the authors and contributors of NamelessStory shall not be held liable for any direct, indirect, incidental, special, or consequential damages arising from the use or inability to use this software, even if advised of the possibility of such damages.

This disclaimer is in addition to, and does not replace, the warranty and liability exclusions already present in the [MIT License](LICENSE).

> [!NOTE]
> It may look scary, but don't worry, basically, don't do stupid thing and download stuff only from trusted sources.

## License

NamelessStory is licensed under the MIT License. See the [LICENSE](LICENSE) file for more information.
