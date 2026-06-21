import { type GameState } from '@/@types';

const SECRET_KEY = '2048-pedronym';

function xorEncryptDecrypt(input: string, key: string): string {
  let output = '';
  for (let i = 0; i < input.length; i++) {
    output += String.fromCharCode(
      input.charCodeAt(i) ^ key.charCodeAt(i % key.length),
    );
  }
  return output;
}

export function saveBestScore(score: number) {
  const encrypted = xorEncryptDecrypt(score.toString(), SECRET_KEY);
  localStorage.setItem('bestScore', btoa(encrypted));
}

export function loadBestScore(): number {
  try {
    const encryptedBase64 = localStorage.getItem('bestScore');
    if (!encryptedBase64) return 0;

    const encrypted = atob(encryptedBase64);
    const decrypted = xorEncryptDecrypt(encrypted, SECRET_KEY);

    const score = parseInt(decrypted, 10);
    return isNaN(score) ? 0 : score;
  } catch {
    return 0;
  }
}

export function saveGameState(state: GameState) {
  try {
    const stateToSave = {
      tiles: state.tiles,
      isGameOver: state.isGameOver,
      isGameWin: state.isGameWin,
      score: state.score,
      history: state.history,
    };
    localStorage.setItem('gameState', btoa(JSON.stringify(stateToSave)));
  } catch (e) {
    console.error('Failed to save game state', e);
  }
}

export function loadGameState(): Omit<GameState, 'bestScore'> | null {
  try {
    const saved = localStorage.getItem('gameState');
    if (!saved) return null;

    const parsed = JSON.parse(atob(saved)) as Omit<GameState, 'bestScore'>;
    if (parsed && parsed.tiles) {
      return {
        ...parsed,
        isMoving: false, // ensure animations are reset
      };
    }
  } catch {
    // In case of tampering or corruption
    return null;
  }
  return null;
}
