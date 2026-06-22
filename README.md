# 2048 Game

## Overview

A 2048 game built in React.

## Architecture

- `index.tsx` is the entry point where the main `Game.tsx` component is rendered.
- Core game logic is managed by the `useGame` hook and exports the necessary state variables consumed by `Game.tsx`.
- All game state manipulation is handled by the `game.ts` reducer to make state changes predictable and easier to test.
- Abstracted keyboard and swipe event handling into a `useKeyboard` and `useSwipe` hook respectively to keep the `useGame` hook code cleaner.
- Separated core game utility methods into `helpers/game.ts` to make them easier to test and reuse.
- Game state changes are saved in a `history` variable inside the `game.ts` reducer state to allow the user to undo moves.
- Game state is saved to the browser's local storage every time the user makes a move (undo's are capped to 25 moves though).
- The user's best score is persisted to the browser's local storage using basic XOR encryption (to make it slightly harder to manipulate by the client).
- Game animations can be disabled by the user through the "prefer reduced motion" operating system preference.
- Used CSS variables for colors, border radius, tile sizes, and animation timing to improve maintainability.
- All components use CSS modules for more reliable style scoping with the exception of `index.css` which is treated as the global style file.

## How to run

Here are the steps to run the project in your machine:

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

## Live demo

This project is deployed using Vercel and configured to deploy automatically when changes are pushed to the `main` branch.

The live version can be played at:

[https://2048-pedronym.vercel.app/](https://2048-pedronym.vercel.app/)

## Tests

I implemented the following core game logic tests as a developer aid:

- `getTileAt`: Tests if the correct tile is returned based on its coordinates.
- `getRandomEmptyCell`: Tests if a random empty cell is returned.
- `canMoveAnywhere`: Tests if a move is possible.
- `moveTiles`: Tests the tile movement logic for all four directions.
- `getGroups`: Tests the coordinate generation logic for sliding tiles across the board.
- `generateInitialTiles`: Tests the generation of the starting two tiles on the board.
- `createTile`: Tests the default state and coordinate assignment for a newly spawned tile.
- `gameReducer`: Tests all game state transitions and move history logging.

**How to run the tests**:

```bash
npm run test
```

## Known limitations & future improvements

- **Undo Logic**: Only the last 25 moves are persisted to `localStorage`.
- **e2e Testing**: No Cypress or Playwright tests have been implemented to test the game logic and user interactions.
- **i18n**: No internationalization support.
- **Analytics**: No analytics or telemetry.
- **Logging**: No logging or error tracking.
- **Theme Toggle**: No theme toggle.
- **Accessibility (A11y)**: While basic semantic HTML is used, accessibility could be improved.
- **PWA Support**: Adding a service worker and web app manifest could make the game fully installable as an offline PWA.
