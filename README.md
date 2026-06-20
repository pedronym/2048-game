# 2048 Game (React)

## Overview

A 2048 game built as a single-page React application. The game features a 4x4 grid where players slide tiles to combine them, aiming to reach the 2048 tile. This project implements the core 2048 game mechanics and a responsive design.

### Key Architectural Decisions
- **React Hooks for Game State**: The game state is managed using `useReducer` and custom hooks (`useGame`, `useKeys`, `useSwipe`) to separate concerns between input handling and game logic.
- **Immutable State Updates**: Game logic follows immutable updates to avoid side-effects.
- **CSS Variables for Styling**: Styling uses global CSS variables, enabling dynamic styling based on tile values.
- **Hardware-Accelerated Animations**: Tile movements and merges utilize CSS transforms and transitions (`will-change: transform`).
- **Local Storage Persistence**: The best score and current game state are synced with `localStorage` so players can resume across sessions.
- **Bonus Features Implemented**:
  - **Mobile Touch Support**: Custom swipe logic for touchscreens.
  - **Unlimited Undo**: A move history stack allowing players to step backward through previous board states without limit.

## Instructions to Run Locally

To get the project running locally on your machine:

1. **Clone the repository** and navigate to the project root.
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Start the development server**:
   ```bash
   npm run dev
   ```
4. Open your browser and navigate to the local URL provided by Vite (usually `http://localhost:5173`).

## Known Limitations & Future Improvements

- **Animation Interruptions**: Rapid sequential moves are handled well, but the animation queueing could be further refined to allow interruptible transitions.
- **Accessibility (A11y)**: While basic semantic HTML is used, ARIA roles and live regions for screen readers (e.g., announcing merges, score changes, or invalid moves) could be added to provide a better experience for visually impaired users.
- **PWA Support**: Adding a service worker and web app manifest to make the game fully installable as an offline Progressive Web App (PWA).
