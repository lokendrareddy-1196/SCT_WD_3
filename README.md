# Tic-Tac-Toe — Interactive Web Application ⚡🎮

> **SkillCraft Technology Internship**  
> **Track Code:** WD (Web Development)  
> **Task Number:** 03  
> **Repository:** [SCT_WD_3](https://github.com/lokendrareddy-1196/SCT_WD_3)

---

## 📢 SkillCraft Internship Submission & LinkedIn Post Template

### Recommended LinkedIn Post Copy:

```text
🚀 Thrilled to announce that I have completed Task 03 (Tic-Tac-Toe Game Application) for my Web Development Internship at SkillCraft Technology!

📌 Track: Web Development (WD)
📌 Task 03: Interactive Tic-Tac-Toe Game
📌 GitHub Repository: [https://github.com/lokendrareddy-1196/SCT_WD_3]

💡 Key Features & Learnings:
🎮 Built two game modes — Player vs Player and Player vs AI
🤖 Implemented an AI opponent with 3 difficulty levels: Easy, Medium & Hard (Minimax algorithm)
📊 Added real-time score tracking for Wins, Draws & Losses
🕹️ Designed a Move History log with an Undo feature for full game control
✨ Custom player names for a personalized match experience
🎨 Styled with a sleek Neon theme + sound toggle for an immersive UI/UX

This task strengthened my understanding of game logic, AI decision-making, state management, and building interactive, responsive front-end interfaces.

 Special thanks to #SkillCraftTechnology for this amazing learning opportunity!

#WebDevelopment #FrontendDeveloper #HTML5 #CSS3 #JavaScript #TicTacToe #GameDevelopment #AI #SkillCraft #Internship #SkillCraftTechnolog
```

---

## 📌 Overview

A modern, responsive, and feature-packed **Tic-Tac-Toe Web Application** built with vanilla HTML5, CSS3, and modern JavaScript (ES6+). Includes intelligent AI opponents, dynamic visual countdown timers, theme customizations, move history with undo functionality, and synthesized audio cues with zero external dependencies.

---

## ✨ Features

- **🎮 Dual Game Modes**:
  - `🧑 vs 🧑` **Player vs Player (PvP)**: Two human players take turns on the same device.
  - `🎮 Player vs 🤖 AI` **Player vs Computer (PvC)**: Challenge a computer opponent across 3 distinct difficulty tiers.
- **🤖 3 AI Difficulty Levels**:
  - **Easy**: Random available moves.
  - **Medium**: Blocks opponent wins and takes immediate winning opportunities.
  - **Hard**: Unbeatable optimal play using recursive **Minimax algorithm**.
- **⏱️ Visual Radial Turn Timer**:
  - 15-second SVG circular progress ring timer located beside the turn indicator in PvP mode.
  - Dynamic color transitions: **Green** ➔ **Yellow** (≤7s) ➔ **Pulsing Red** (≤3s).
  - Auto-skips turn if time runs out.
- **🎨 Multi-Theme Picker**:
  - **🌌 Dark**: Midnight blue to royal violet radial gradient with frosted glass styling.
  - **⚡ Neon**: High-contrast cyberpunk palette with electric cyan, hot magenta, and neon lime.
  - **☀️ Light**: Crisp, clean slate aesthetic with sharp readability.
  - Theme preference saved to `localStorage`.
- **✍️ Custom Player Names**:
  - Live customizable names for Player X and Player O / AI, dynamically reflected in status banners, scoreboard, and result modals.
- **📜 Move History & Undo**:
  - Live horizontal badges tracking each played position (e.g. `X: Top-Left`, `O: Center`).
  - **Undo button** to step back moves.
- **🎉 Celebratory Win Animations**:
  - Animated SVG glowing strike-through line crossing the 3 winning tiles.
  - HTML5 Canvas multi-color confetti particle explosion.
- **🔊 Web Audio Sound Effects**:
  - Synthesized click, triumphant win chime, draw chords, and timer alert beeps.
  - Mute toggle button with preference stored in `localStorage`.
- **📋 Share Match Result**:
  - Instant **"Copy Result"** button generating dynamic match summary text.
- **⌨️ Keyboard & Mobile Friendly**:
  - Full **Arrow-Key navigation** (↑, ↓, ←, →), `Enter`/`Space` activation, clear focus rings, and tactile mobile scale-down tap feedback.
- **💾 Persistent Scoreboard**:
  - Wins and Draws persist across browser refreshes via `localStorage`.

---

## 📁 Repository Structure

```text
SCT_WD_3/
│
├── index.html          # Semantic HTML structure, SVG radial clock, overlays & modals
├── style.css           # Modern theme styling, animations, responsive grid & strike lines
├── script.js           # Core game engine, Minimax AI, Web Audio SFX & event handlers
├── .gitignore          # Excludes OS cache and IDE configuration files
└── README.md           # Project documentation, feature overview, and submission guide
```

---

## 🛠️ Built With

- **HTML5** — Semantic markup, ARIA accessibility attributes, and vector SVG overlays.
- **CSS3** — Custom properties, CSS Grid & Flexbox, glassmorphism backdrop filters, and keyframe animations.
- **JavaScript (ES6+)** — Minimax algorithm, Web Audio API synthesis, HTML5 Canvas particles, and `localStorage` state management.

---

## 🚀 How to Run Locally

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/lokendrareddy-1196/SCT_WD_3.git
   ```

2. **Navigate to the Project Folder:**
   ```bash
   cd SCT_WD_3
   ```

3. **Launch the Game:**
   - Double-click `index.html` or open it in any web browser.
   - No build tools, Node modules, or external servers required!

---

## 👤 Author & Contributor

- **Author & Contributor:** [Lokendra Reddy](https://github.com/lokendrareddy-1196)
- **GitHub Profile:** [@lokendrareddy-1196](https://github.com/lokendrareddy-1196)
- **Internship:** SkillCraft Technology Web Development Internship
- **Track & Task:** Web Development (`WD`) — Task 03 (Interactive Tic-Tac-Toe Web App)

<a href="https://github.com/lokendrareddy-1196">
  <img src="https://avatars.githubusercontent.com/u/310470744?v=4" width="80" height="80" style="border-radius: 50%;" alt="Lokendra Reddy"/>
</a>

---

## 📄 License

This project is created as part of the **SkillCraft Technology Web Development Internship**.
