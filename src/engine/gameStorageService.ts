import { SavedGame } from '../types/chess';

const STORAGE_KEY = 'chess_coach_saved_games';

class GameStorageService {
  public getSavedGames(): SavedGame[] {
    if (typeof window === 'undefined') return [];
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) return [];
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.warn('Failed to read saved games from localStorage:', e);
      return [];
    }
  }

  public saveGame(game: SavedGame): void {
    if (typeof window === 'undefined') return;
    try {
      const current = this.getSavedGames();
      // If already exists with same id, replace it; otherwise prepend
      const existingIdx = current.findIndex((g) => g.id === game.id);
      if (existingIdx >= 0) {
        current[existingIdx] = game;
      } else {
        current.unshift(game);
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
    } catch (e) {
      console.warn('Failed to save game to localStorage:', e);
    }
  }

  public deleteGame(id: string): void {
    if (typeof window === 'undefined') return;
    try {
      const current = this.getSavedGames().filter((g) => g.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
    } catch (e) {
      console.warn('Failed to delete game from localStorage:', e);
    }
  }

  public exportPgn(game: SavedGame): void {
    if (typeof window === 'undefined') return;
    try {
      const pgnContent = game.pgn || '';
      const blob = new Blob([pgnContent], { type: 'application/x-chess-pgn;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${game.title.replace(/[^a-zA-Z0-9_-]/g, '_')}.pgn`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.warn('Failed to export PGN file:', e);
    }
  }
}

export const gameStorageService = new GameStorageService();
