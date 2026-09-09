import { EngineLevel } from '../types/chess';

export const ENGINE_LEVELS: EngineLevel[] = [
  {
    id: 1,
    name: 'Novizio Luca',
    elo: 800,
    depth: 3,
    skillLevel: 1,
    moveTimeMs: 400,
    description: 'Ideale per chi sta muovendo i primi passi: commette errori naturali ed è ottimo per fare pratica.',
    avatar: '🌱',
  },
  {
    id: 2,
    name: 'Elena Club',
    elo: 1200,
    depth: 6,
    skillLevel: 5,
    moveTimeMs: 600,
    description: 'Giocatrice amatoriale: conosce i principi base dell\'apertura ma è vulnerabile a tattiche a 2 mosse.',
    avatar: '♟️',
  },
  {
    id: 3,
    name: 'Marco Torneo',
    elo: 1500,
    depth: 9,
    skillLevel: 10,
    moveTimeMs: 800,
    description: 'Giocatore intermedio di circolo: sviluppo solido, arrocca presto e punisce le sviste evidenti.',
    avatar: '🛡️',
  },
  {
    id: 4,
    name: 'Maestro Alberto',
    elo: 1800,
    depth: 12,
    skillLevel: 14,
    moveTimeMs: 1000,
    description: 'Forte agonista: calcola combinazioni tattiche profonde e controlla con precisione il centro.',
    avatar: '⚔️',
  },
  {
    id: 5,
    name: 'MI Sofia',
    elo: 2200,
    depth: 15,
    skillLevel: 18,
    moveTimeMs: 1400,
    description: 'Maestro Internazionale: gioco posizionale raffinato, quasi immune a trappole e letale nei finali.',
    avatar: '👑',
  },
  {
    id: 6,
    name: 'GM StockFish Max',
    elo: 2850,
    depth: 18,
    skillLevel: 20,
    moveTimeMs: 1800,
    description: 'Super Gran Maestro alla massima potenza di calcolo: la perfezione silicea di Stockfish.',
    avatar: '⚡',
  },
];

/**
 * Maps a skill level (0 - 20) to an estimated ELO rating (400 - 3000+)
 */
export function skillLevelToElo(skill: number): number {
  const clamped = Math.max(0, Math.min(20, Math.round(skill)));
  if (clamped === 20) return 3000;
  return Math.round(400 + (clamped / 20) * 2550);
}

/**
 * Maps an ELO rating (400 - 3000) to a Stockfish skill level (0 - 20)
 */
export function eloToSkillLevel(elo: number): number {
  const clamped = Math.max(400, Math.min(3000, Math.round(elo)));
  if (clamped >= 2900) return 20;
  return Math.max(0, Math.min(20, Math.round(((clamped - 400) / 2500) * 20)));
}

/**
 * Returns a fitting avatar and description for an ELO rating
 */
export function getLevelMetadata(elo: number, skillLevel: number): { avatar: string; description: string; name: string } {
  let avatar = '🌱';
  let description = '';

  if (elo < 800) {
    avatar = '🐣';
    description = 'Principiante assoluto: non vede minacce immediate e commette frequenti errori elementari.';
  } else if (elo < 1200) {
    avatar = '🌱';
    description = 'Novizio: conosce lo sviluppo dei pezzi ma perde materiale su tattiche a 1-2 mosse.';
  } else if (elo < 1500) {
    avatar = '♟️';
    description = 'Amatoriale di club: sviluppo solido e arrocco rapido, vulnerabile a combinazioni tattiche.';
  } else if (elo < 1800) {
    avatar = '🛡️';
    description = 'Intermedio agonista: calcola a 2-3 mosse, punisce sviste posizionali ed errori nel medio gioco.';
  } else if (elo < 2100) {
    avatar = '⚔️';
    description = 'Candidato Maestro: visione strategica matura, controllo solido del centro e piani di attacco.';
  } else if (elo < 2400) {
    avatar = '🎖️';
    description = 'Maestro: calcolo tattico preciso, finali accurati e quasi immune a trappole.';
  } else if (elo < 2800) {
    avatar = '👑';
    description = 'Gran Maestro: profondità tattica e posizionale d\'élite, precisione clinica.';
  } else {
    avatar = '🤖';
    description = 'Stockfish Max: calcolo silicio sovrumano e assoluta perfezione tattica.';
  }

  const name = `Stockfish Livello ${skillLevel}`;
  return { avatar, description, name };
}

/**
 * Creates a custom EngineLevel based on Skill Level (0-20) or explicit ELO, Depth, and Movetime
 */
export function createCustomStockfishLevel(
  skillLevel: number,
  customElo?: number,
  customDepth?: number,
  customTimeMs?: number
): EngineLevel {
  const clampedSkill = Math.max(0, Math.min(20, Math.round(skillLevel)));
  const elo = customElo !== undefined ? Math.max(400, Math.min(3100, Math.round(customElo))) : skillLevelToElo(clampedSkill);
  
  // Suggested depth based on skill (2 to 20)
  const defaultDepth = Math.max(2, Math.min(20, Math.round(2 + (clampedSkill / 20) * 18)));
  const depth = customDepth !== undefined ? Math.max(1, Math.min(20, customDepth)) : defaultDepth;

  // Suggested movetime based on skill (300ms to 2000ms)
  const defaultTimeMs = Math.max(300, Math.min(2000, Math.round(300 + (clampedSkill / 20) * 1600)));
  const moveTimeMs = customTimeMs !== undefined ? Math.max(150, Math.min(4000, customTimeMs)) : defaultTimeMs;

  const { avatar, description, name } = getLevelMetadata(elo, clampedSkill);

  return {
    id: 1000 + clampedSkill, // distinctive ID for custom levels
    name,
    elo,
    depth,
    skillLevel: clampedSkill,
    moveTimeMs,
    description,
    avatar,
  };
}
