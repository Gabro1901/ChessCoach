import React, { useState, useEffect } from 'react';
import {
  RotateCcw,
  Volume2,
  VolumeX,
  Flag,
  Award,
  Palette,
  Eye,
  EyeOff,
  Sliders,
  ChevronDown,
  ChevronUp,
  Zap,
  Check,
  Cpu,
} from 'lucide-react';
import { EngineLevel, PlayerColor } from '../../types/chess';
import {
  ENGINE_LEVELS,
  createCustomStockfishLevel,
  skillLevelToElo,
  eloToSkillLevel,
  getLevelMetadata,
} from '../../engine/engineLevels';

interface GameSettingsProps {
  currentLevel: EngineLevel;
  onSelectLevel: (level: EngineLevel) => void;
  playerColor: PlayerColor;
  onChangeColor: (color: PlayerColor) => void;
  onFlipBoard: () => void;
  onNewGame: () => void;
  onResign: () => void;
  theme: 'tournament' | 'classic' | 'slate';
  onChangeTheme: (theme: 'tournament' | 'classic' | 'slate') => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  showEvalBar?: boolean;
  onToggleEvalBar?: () => void;
  showArrows?: boolean;
  onToggleArrows?: () => void;
}

export const GameSettings: React.FC<GameSettingsProps> = ({
  currentLevel,
  onSelectLevel,
  playerColor,
  onChangeColor,
  onFlipBoard,
  onNewGame,
  onResign,
  theme,
  onChangeTheme,
  soundEnabled,
  onToggleSound,
  showEvalBar = true,
  onToggleEvalBar,
  showArrows = true,
  onToggleArrows,
}) => {
  // Mode: Presets or Custom Stockfish Level
  const [levelMode, setLevelMode] = useState<'presets' | 'custom'>(
    currentLevel.id >= 1000 ? 'custom' : 'presets'
  );

  // Custom level state
  const [skillLevel, setSkillLevel] = useState<number>(currentLevel.skillLevel);
  const [elo, setElo] = useState<number>(currentLevel.elo);
  const [depth, setDepth] = useState<number>(currentLevel.depth);
  const [moveTimeMs, setMoveTimeMs] = useState<number>(currentLevel.moveTimeMs);
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);
  const [appliedNotification, setAppliedNotification] = useState<boolean>(false);

  // Sync state if currentLevel changes externally
  useEffect(() => {
    setSkillLevel(currentLevel.skillLevel);
    setElo(currentLevel.elo);
    setDepth(currentLevel.depth);
    setMoveTimeMs(currentLevel.moveTimeMs);
  }, [currentLevel.id, currentLevel.skillLevel, currentLevel.elo, currentLevel.depth, currentLevel.moveTimeMs]);

  // Handle Skill Level slider change
  const handleSkillChange = (newSkill: number) => {
    setSkillLevel(newSkill);
    const newElo = skillLevelToElo(newSkill);
    setElo(newElo);
    const custom = createCustomStockfishLevel(newSkill, newElo);
    setDepth(custom.depth);
    setMoveTimeMs(custom.moveTimeMs);
    onSelectLevel(custom);
    triggerApplied();
  };

  // Handle ELO slider change
  const handleEloChange = (newElo: number) => {
    setElo(newElo);
    const newSkill = eloToSkillLevel(newElo);
    setSkillLevel(newSkill);
    const custom = createCustomStockfishLevel(newSkill, newElo);
    setDepth(custom.depth);
    setMoveTimeMs(custom.moveTimeMs);
    onSelectLevel(custom);
    triggerApplied();
  };

  // Handle manual Advanced settings change
  const handleAdvancedChange = (newDepth: number, newTime: number) => {
    setDepth(newDepth);
    setMoveTimeMs(newTime);
    const custom = createCustomStockfishLevel(skillLevel, elo, newDepth, newTime);
    onSelectLevel(custom);
    triggerApplied();
  };

  const triggerApplied = () => {
    setAppliedNotification(true);
    setTimeout(() => setAppliedNotification(false), 2000);
  };

  const currentMeta = getLevelMetadata(elo, skillLevel);

  const QUICK_SKILL_PILLS = [
    { label: 'Liv. 1', skill: 1, elo: 700 },
    { label: 'Liv. 5', skill: 5, elo: 1300 },
    { label: 'Liv. 10', skill: 10, elo: 1800 },
    { label: 'Liv. 15', skill: 15, elo: 2350 },
    { label: 'Liv. 20 (Max)', skill: 20, elo: 3000 },
  ];

  return (
    <div className="flex flex-col gap-4 text-slate-200">
      {/* Level Selection Header & Mode Switcher */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Award className="w-4 h-4 text-emerald-400" />
            <span>Livello Avversario StockFish</span>
          </label>
          {appliedNotification && (
            <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1 animate-pulse">
              <Check className="w-3.5 h-3.5" /> Applicato!
            </span>
          )}
        </div>

        {/* Mode Selector Tabs (Preset vs Custom) */}
        <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-900/90 rounded-2xl border border-slate-800">
          <button
            onClick={() => setLevelMode('presets')}
            className={`flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl text-xs font-bold transition-all ${
              levelMode === 'presets'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Preset Personaggi</span>
          </button>

          <button
            onClick={() => setLevelMode('custom')}
            className={`flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl text-xs font-bold transition-all ${
              levelMode === 'custom'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Livello Personalizzato</span>
          </button>
        </div>

        {/* 1. Presets View */}
        {levelMode === 'presets' && (
          <div className="grid grid-cols-2 gap-2 animate-fade-in">
            {ENGINE_LEVELS.map((lvl) => {
              const isSelected = lvl.id === currentLevel.id;
              return (
                <button
                  key={lvl.id}
                  onClick={() => onSelectLevel(lvl)}
                  className={`flex items-center gap-2 p-2.5 rounded-xl text-left border transition-all ${
                    isSelected
                      ? 'bg-emerald-600/25 border-emerald-500 text-white ring-1 ring-emerald-500/50 shadow-md'
                      : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800 hover:border-slate-600'
                  }`}
                >
                  <span className="text-2xl select-none shrink-0">{lvl.avatar}</span>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold truncate text-white">{lvl.name}</div>
                    <div className="text-[10px] font-mono font-semibold text-emerald-400">
                      {lvl.elo} ELO
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* 2. Custom Stockfish Level View */}
        {levelMode === 'custom' && (
          <div className="space-y-3.5 p-3.5 bg-[#18202e] border border-slate-700/80 rounded-2xl animate-fade-in">
            {/* Quick Skill Level Buttons */}
            <div>
              <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1.5 font-semibold">
                <span>Scelta Rapida:</span>
                <span className="text-emerald-400 font-mono">Skill 0 - 20</span>
              </div>
              <div className="grid grid-cols-5 gap-1">
                {QUICK_SKILL_PILLS.map((p) => (
                  <button
                    key={p.skill}
                    onClick={() => handleSkillChange(p.skill)}
                    className={`py-1 px-1 rounded-lg text-[10px] font-bold border transition-all truncate ${
                      skillLevel === p.skill
                        ? 'bg-emerald-600 text-white border-emerald-500 shadow'
                        : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 border-slate-700'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Stockfish Skill Level Slider (0 - 20) */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-blue-400" />
                  Livello StockFish (Skill):
                </span>
                <span className="font-mono font-bold text-white bg-blue-500/20 px-2 py-0.5 rounded border border-blue-500/30">
                  {skillLevel} / 20
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={20}
                step={1}
                value={skillLevel}
                onChange={(e) => handleSkillChange(Number(e.target.value))}
                className="w-full accent-blue-500 cursor-pointer h-1.5 bg-slate-700 rounded-lg appearance-none"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>0 (Novizio)</span>
                <span>10 (Intermedio)</span>
                <span>20 (Max GM)</span>
              </div>
            </div>

            {/* Custom ELO Slider (400 - 3000) */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  Punteggio ELO Equivalente:
                </span>
                <span className="font-mono font-bold text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded border border-amber-500/30">
                  {elo} ELO
                </span>
              </div>
              <input
                type="range"
                min={400}
                max={3000}
                step={50}
                value={elo}
                onChange={(e) => handleEloChange(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer h-1.5 bg-slate-700 rounded-lg appearance-none"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>400 ELO</span>
                <span>1700 ELO</span>
                <span>3000+ ELO</span>
              </div>
            </div>

            {/* Advanced Options Accordion (Depth & Movetime) */}
            <div className="pt-2 border-t border-slate-700/60">
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="w-full flex items-center justify-between text-xs text-slate-400 hover:text-slate-200 transition-colors py-1"
              >
                <span className="flex items-center gap-1.5 font-semibold">
                  <Sliders className="w-3.5 h-3.5 text-purple-400" />
                  Parametri di Calcolo Avanzati
                </span>
                {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {showAdvanced && (
                <div className="space-y-3 pt-2 text-xs animate-fade-in">
                  {/* Depth */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] text-slate-300">
                      <span>Profondità di Ricerca (Depth):</span>
                      <span className="font-mono text-purple-300 font-bold">{depth} mosse</span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={20}
                      step={1}
                      value={depth}
                      onChange={(e) => handleAdvancedChange(Number(e.target.value), moveTimeMs)}
                      className="w-full accent-purple-500 cursor-pointer h-1.5 bg-slate-700 rounded-lg appearance-none"
                    />
                  </div>

                  {/* Movetime */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] text-slate-300">
                      <span>Tempo di Riflessione a Mossa:</span>
                      <span className="font-mono text-purple-300 font-bold">{moveTimeMs} ms</span>
                    </div>
                    <input
                      type="range"
                      min={200}
                      max={3000}
                      step={100}
                      value={moveTimeMs}
                      onChange={(e) => handleAdvancedChange(depth, Number(e.target.value))}
                      className="w-full accent-purple-500 cursor-pointer h-1.5 bg-slate-700 rounded-lg appearance-none"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Real-time Configured Bot Preview Card */}
            <div className="p-3 bg-[#111622] border border-slate-700/80 rounded-xl flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-2xl shadow-inner shrink-0">
                {currentMeta.avatar}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-white truncate">{currentMeta.name}</span>
                  <span className="px-2 py-0.2 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    {elo} ELO
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    Depth {depth}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 line-clamp-2 mt-0.5 leading-snug">
                  {currentMeta.description}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Color & Theme */}
      <div className="grid grid-cols-2 gap-3 pt-1">
        <div>
          <label className="text-xs font-semibold text-slate-400 block mb-1.5">
            Colore Giocatore:
          </label>
          <div className="grid grid-cols-2 gap-1.5 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => onChangeColor('w')}
              className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all ${
                playerColor === 'w'
                  ? 'bg-white text-slate-900 shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Bianco ♔
            </button>
            <button
              onClick={() => onChangeColor('b')}
              className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all ${
                playerColor === 'b'
                  ? 'bg-slate-800 text-white border border-slate-700 shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Nero ♚
            </button>
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-400 block mb-1.5">
            Tema Scacchiera:
          </label>
          <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
            {(['tournament', 'classic', 'slate'] as const).map((t) => (
              <button
                key={t}
                onClick={() => onChangeTheme(t)}
                className={`flex-1 py-1.5 px-1 rounded-lg text-[11px] font-semibold capitalize transition-all ${
                  theme === t
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {t === 'tournament' ? 'Verde' : t === 'classic' ? 'Legno' : 'Ardesia'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Toggles (Audio, Eval Bar, Arrows) */}
      <div className="pt-2 border-t border-slate-800/80 space-y-2">
        <label className="text-xs font-semibold text-slate-400 block">
          Preferenze Visive & Audio:
        </label>
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={onToggleSound}
            className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl border text-xs font-medium transition-all ${
              soundEnabled
                ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                : 'bg-slate-800/50 border-slate-700 text-slate-400'
            }`}
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span>Suoni</span>
          </button>

          {onToggleEvalBar && (
            <button
              onClick={onToggleEvalBar}
              className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl border text-xs font-medium transition-all ${
                showEvalBar
                  ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                  : 'bg-slate-800/50 border-slate-700 text-slate-400'
              }`}
            >
              {showEvalBar ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              <span>Eval Bar</span>
            </button>
          )}

          {onToggleArrows && (
            <button
              onClick={onToggleArrows}
              className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl border text-xs font-medium transition-all ${
                showArrows
                  ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                  : 'bg-slate-800/50 border-slate-700 text-slate-400'
              }`}
            >
              <Palette className="w-3.5 h-3.5" />
              <span>Frecce</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Action Buttons: Flip, Resign, Restart */}
      <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-800">
        <button
          onClick={onFlipBoard}
          className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold border border-slate-700 transition-all active:scale-95"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Ruota</span>
        </button>

        <button
          onClick={onResign}
          className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-rose-950/40 hover:bg-rose-900/50 text-rose-300 hover:text-rose-200 text-xs font-semibold border border-rose-800/40 transition-all active:scale-95"
        >
          <Flag className="w-3.5 h-3.5" />
          <span>Abbandona</span>
        </button>

        <button
          onClick={onNewGame}
          className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md active:scale-95"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Nuova</span>
        </button>
      </div>
    </div>
  );
};
