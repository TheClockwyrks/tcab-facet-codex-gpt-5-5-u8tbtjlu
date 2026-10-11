import { ParticleSimulator } from "@clockwyrks/particle-runtime";
import type { ParticleSystem } from "@clockwyrks/particle-runtime";
import type {
  Game,
  InitApi,
  RenderApi,
  UpdateApi,
} from "@clockwyrks/simple-2d";
import type { DeepReadonly } from "ts-essentials";
import {
  ACTIONS,
  BACK_LABEL,
  BASE_SCORE,
  BEST_CHAIN_LABEL,
  BEST_MOVE_LABEL,
  BINDINGS,
  BOARD_CX,
  BOARD_CY,
  CELL_PITCH,
  CUES,
  FALL_SECONDS_PER_ROW,
  FACET_DEBUG_VERSION,
  FLAWED_SCORE,
  GAMEOVER_ITEMS,
  GAMEOVER_TITLE_TEXT,
  GEM_HIT_R,
  GEM_KIND_COUNT,
  GEM_KINDS,
  GRID_COLS,
  GRID_ROWS,
  HUD_CHAIN_LABEL,
  HUD_LEVEL_LABEL,
  HUD_SCORE_LABEL,
  LAND_MIN_ROWS,
  LEVEL_TARGET_STEP,
  LEVELCLEAR_ITEMS,
  LEVELCLEAR_TITLE_TEXT,
  MATCH_MIN,
  MAX_MULTIPLIER,
  MAX_STRAIN,
  PAUSE_LABEL,
  PAUSED_ITEMS,
  PAUSED_TITLE_TEXT,
  REFUSAL_SECONDS,
  STAGE_H,
  STAGE_W,
  STEP_SECONDS,
  SWAP_SECONDS,
  TAGLINE_TEXT,
  TARGET_MIN_H,
  TARGET_MIN_W,
  TITLE_ITEMS,
  TITLE_TEXT,
  WAVE_SECONDS,
} from "./constants";

export type GemKind =
  "ruby" | "amber" | "citrine" | "jade" | "beryl" | "sapphire" | "amethyst";

export type Cut = "plain" | "brilliant" | "star" | "prism";

export type Screen =
  "title" | "howto" | "playing" | "paused" | "levelclear" | "gameover";

export type Phase = "idle" | "swapping" | "resolving";

export type PointerDevice = "mouse" | "pen" | "touch";

export interface CellRef {
  readonly col: number;
  readonly row: number;
}

export interface GemState {
  readonly col: number;
  readonly row: number;
  readonly kind: GemKind | null;
  readonly cut: Cut;
  readonly strain: number;
  readonly fell: number;
}

export interface BoardState {
  readonly cols: number;
  readonly rows: number;
  readonly cells: readonly GemState[];
}

export interface RefusalState {
  readonly a: CellRef;
  readonly b: CellRef;
  readonly timer: number;
}

export interface PointerState {
  readonly x: number;
  readonly y: number;
  readonly down: boolean;
  readonly device: PointerDevice;
}

interface AssetPack {
  readonly gems: Readonly<Record<string, ImageBitmap>>;
  readonly breakFrames: Readonly<Record<GemKind, readonly ImageBitmap[]>>;
  readonly prismTurn: readonly ImageBitmap[];
  readonly boardFrame: ImageBitmap;
  readonly fx: Readonly<Record<FxName, ParticleSystem>>;
}

type FxName = "clear-burst" | "flawed-detonation" | "cut-flash" | "cut-aura";

interface SwapVisual {
  readonly a: CellRef;
  readonly b: CellRef;
}

interface ClearVisual {
  readonly cell: CellRef;
  readonly kind: GemKind | null;
  readonly strain: number;
  readonly wave: number;
}

interface FxEvent {
  readonly name: FxName;
  readonly x: number;
  readonly y: number;
  readonly started: number;
}

interface PrismSwap {
  readonly all: boolean;
  readonly kind: GemKind | null;
}

export interface FacetState {
  readonly screen: Screen;
  readonly menuIndex: number;

  readonly board: BoardState;
  readonly phase: Phase;
  readonly chainStep: number;
  readonly swapTimer: number;
  readonly stepTimer: number;

  readonly score: number;
  readonly level: number;
  readonly levelScore: number;
  readonly lastCleared: number;
  readonly lastPoints: number;
  readonly lastWaves: number;

  readonly moveScore: number;
  readonly bestMove: number;
  readonly bestChain: number;

  readonly selection: CellRef | null;
  readonly offer: CellRef | null;
  readonly refusal: RefusalState | null;
  readonly armedTarget: string | null;

  readonly pointer: PointerState;
  readonly simTime: number;
  readonly muted: boolean;
  readonly refillKinds: readonly string[];

  readonly assets: AssetPack;
  readonly swap: SwapVisual | null;
  readonly prismSwap: PrismSwap | null;
  readonly clearVisuals: readonly ClearVisual[];
  readonly fxEvents: readonly FxEvent[];
}

export interface TargetSnapshot {
  readonly id: string;
  readonly x: number;
  readonly y: number;
  readonly w: number;
  readonly h: number;
}

export interface FacetSnapshot {
  readonly version: number;
  readonly screen: Screen;
  readonly menuIndex: number;
  readonly score: number;
  readonly level: number;
  readonly levelScore: number;
  readonly levelTarget: number;
  readonly phase: Phase;
  readonly chainStep: number;
  readonly multiplier: number;
  readonly swapTimer: number;
  readonly stepTimer: number;
  readonly stepHold: number;
  readonly board: {
    readonly cols: number;
    readonly rows: number;
    readonly cells: readonly (GemState & {
      readonly x: number;
      readonly y: number;
    })[];
  };
  readonly selection: CellRef | null;
  readonly offer: CellRef | null;
  readonly refusal: { readonly a: CellRef; readonly b: CellRef } | null;
  readonly lastCleared: number;
  readonly lastPoints: number;
  readonly lastWaves: number;
  readonly lastFall: number;
  readonly moveScore: number;
  readonly bestMove: number;
  readonly bestChain: number;
  readonly legalSwap: boolean;
  readonly refillKinds: readonly string[];
  readonly pointer: PointerState;
  readonly armedTarget: string | null;
  readonly targets: readonly TargetSnapshot[];
  readonly muted: boolean;
  readonly simTime: number;
}

export interface FacetDebugApi {
  readonly version: number;
  reset(state: DeepReadonly<FacetState>): FacetState;
  reconcile(state: DeepReadonly<FacetState>): FacetState;
  snapshot(state: DeepReadonly<FacetState>): FacetSnapshot;
  setScreen(state: DeepReadonly<FacetState>, screen: Screen): FacetState;
  setMenuIndex(state: DeepReadonly<FacetState>, index: number): FacetState;
  loadBoard(
    state: DeepReadonly<FacetState>,
    rows: readonly string[],
  ): FacetState;
  dealBoard(state: DeepReadonly<FacetState>): FacetState;
  clearBoard(state: DeepReadonly<FacetState>): FacetState;
  setGem(
    state: DeepReadonly<FacetState>,
    col: number,
    row: number,
    token: string,
  ): FacetState;
  setRefillKinds(
    state: DeepReadonly<FacetState>,
    col: number,
    kinds: string,
  ): FacetState;
  clearRefillKinds(state: DeepReadonly<FacetState>): FacetState;
  setScore(state: DeepReadonly<FacetState>, points: number): FacetState;
  setLevel(state: DeepReadonly<FacetState>, level: number): FacetState;
  setLevelScore(state: DeepReadonly<FacetState>, points: number): FacetState;
  setBestChain(state: DeepReadonly<FacetState>, chainStep: number): FacetState;
  setBestMove(state: DeepReadonly<FacetState>, points: number): FacetState;
  setMoveScore(state: DeepReadonly<FacetState>, points: number): FacetState;
  setSelection(
    state: DeepReadonly<FacetState>,
    col: number,
    row: number,
  ): FacetState;
  clearSelection(state: DeepReadonly<FacetState>): FacetState;
  setOffer(
    state: DeepReadonly<FacetState>,
    col: number,
    row: number,
  ): FacetState;
  clearOffer(state: DeepReadonly<FacetState>): FacetState;
  clearRefusal(state: DeepReadonly<FacetState>): FacetState;
  clearChain(state: DeepReadonly<FacetState>): FacetState;
  requestSwap(
    state: DeepReadonly<FacetState>,
    colA: number,
    rowA: number,
    colB: number,
    rowB: number,
  ): FacetState;
  pointerDown(
    state: DeepReadonly<FacetState>,
    x: number,
    y: number,
    device?: PointerDevice,
  ): FacetState;
  pointerMove(
    state: DeepReadonly<FacetState>,
    x: number,
    y: number,
    device?: PointerDevice,
  ): FacetState;
  pointerUp(
    state: DeepReadonly<FacetState>,
    device?: PointerDevice,
  ): FacetState;
}

export const BACKGROUND = "#101522";

const EMPTY_BOARD: BoardState = { cols: 0, rows: 0, cells: [] };
const KIND_BY_LETTER: Readonly<Record<string, GemKind>> = {
  R: "ruby",
  A: "amber",
  C: "citrine",
  J: "jade",
  B: "beryl",
  S: "sapphire",
  M: "amethyst",
};
function cellX(col: number): number {
  return BOARD_CX - ((GRID_COLS - 1) * CELL_PITCH) / 2 + col * CELL_PITCH;
}

function cellY(row: number): number {
  return BOARD_CY - ((GRID_ROWS - 1) * CELL_PITCH) / 2 + row * CELL_PITCH;
}

function key(cell: CellRef): string {
  return `${cell.col},${cell.row}`;
}

function same(a: CellRef | null, b: CellRef | null): boolean {
  return !!a && !!b && a.col === b.col && a.row === b.row;
}

function adjacent(a: CellRef, b: CellRef): boolean {
  return Math.abs(a.col - b.col) + Math.abs(a.row - b.row) === 1;
}

function assertCell(col: number, row: number): void {
  if (
    !Number.isInteger(col) ||
    !Number.isInteger(row) ||
    col < 0 ||
    row < 0 ||
    col >= GRID_COLS ||
    row >= GRID_ROWS
  ) {
    throw new RangeError(`Facet: cell (${col}, ${row}) is outside the board`);
  }
}

function at(
  board: DeepReadonly<BoardState>,
  col: number,
  row: number,
): GemState {
  if (board.cols !== GRID_COLS || board.rows !== GRID_ROWS) {
    throw new Error("Facet: no board is in play");
  }
  return board.cells[row * board.cols + col] as GemState;
}

function replaceGem(
  board: DeepReadonly<BoardState>,
  gem: GemState,
): BoardState {
  return {
    cols: board.cols,
    rows: board.rows,
    cells: board.cells.map((cell) =>
      cell.col === gem.col && cell.row === gem.row ? gem : (cell as GemState),
    ),
  };
}

function parseToken(token: string, col: number, row: number): GemState {
  const match = /^([RACJBSMX])([0-3])([bs])?$/.exec(token);
  if (!match) throw new Error(`Facet: bad gem token "${token}"`);
  const [, letter, strainText, cutText] = match;
  const strain = Number(strainText);
  if (letter === "X")
    return { col, row, kind: null, cut: "prism", strain, fell: 0 };
  const kind = KIND_BY_LETTER[letter];
  const cut =
    cutText === "b" ? "brilliant" : cutText === "s" ? "star" : "plain";
  return { col, row, kind, cut, strain, fell: 0 };
}

function loadBoardRows(rows: readonly string[]): BoardState {
  if (rows.length !== GRID_ROWS)
    throw new Error("Facet: board notation needs 8 rows");
  const cells: GemState[] = [];
  rows.forEach((line, row) => {
    const tokens = line.trim().split(/\s+/);
    if (tokens.length !== GRID_COLS)
      throw new Error("Facet: board notation needs 8 columns");
    tokens.forEach((token, col) => cells.push(parseToken(token, col, row)));
  });
  return { cols: GRID_COLS, rows: GRID_ROWS, cells };
}

interface Run {
  readonly cells: readonly CellRef[];
  readonly kind: GemKind;
  readonly dir: "h" | "v";
}

function findRuns(board: DeepReadonly<BoardState>): readonly Run[] {
  if (board.cols !== GRID_COLS || board.rows !== GRID_ROWS) return [];
  const runs: Run[] = [];
  for (let row = 0; row < GRID_ROWS; row++) {
    let col = 0;
    while (col < GRID_COLS) {
      const start = col;
      const kind = at(board, col, row).kind;
      while (col < GRID_COLS && at(board, col, row).kind === kind && kind)
        col++;
      if (kind && col - start >= MATCH_MIN) {
        runs.push({
          kind,
          dir: "h",
          cells: Array.from({ length: col - start }, (_, i) => ({
            col: start + i,
            row,
          })),
        });
      }
      if (col === start) col++;
    }
  }
  for (let col = 0; col < GRID_COLS; col++) {
    let row = 0;
    while (row < GRID_ROWS) {
      const start = row;
      const kind = at(board, col, row).kind;
      while (row < GRID_ROWS && at(board, col, row).kind === kind && kind)
        row++;
      if (kind && row - start >= MATCH_MIN) {
        runs.push({
          kind,
          dir: "v",
          cells: Array.from({ length: row - start }, (_, i) => ({
            col,
            row: start + i,
          })),
        });
      }
      if (row === start) row++;
    }
  }
  return runs;
}

function swapBoard(
  board: DeepReadonly<BoardState>,
  a: CellRef,
  b: CellRef,
): BoardState {
  const ga = at(board, a.col, a.row);
  const gb = at(board, b.col, b.row);
  return {
    cols: GRID_COLS,
    rows: GRID_ROWS,
    cells: board.cells.map((cell) => {
      if (same(cell, a)) return { ...gb, col: a.col, row: a.row, fell: 0 };
      if (same(cell, b)) return { ...ga, col: b.col, row: b.row, fell: 0 };
      return { ...(cell as GemState), fell: cell.fell };
    }),
  };
}

function hasLegalSwap(board: DeepReadonly<BoardState>): boolean {
  if (board.cols !== GRID_COLS || board.rows !== GRID_ROWS) return false;
  for (let row = 0; row < GRID_ROWS; row++) {
    for (let col = 0; col < GRID_COLS; col++) {
      for (const d of [
        [1, 0],
        [0, 1],
      ] as const) {
        const b = { col: col + d[0], row: row + d[1] };
        if (b.col < GRID_COLS && b.row < GRID_ROWS) {
          const swapped = swapBoard(board, { col, row }, b);
          if (
            at(board, col, row).cut === "prism" ||
            at(board, b.col, b.row).cut === "prism" ||
            findRuns(swapped).length > 0
          ) {
            return true;
          }
        }
      }
    }
  }
  return false;
}

function prng(seed: number): () => number {
  let x = seed | 0;
  return () => {
    x ^= x << 13;
    x ^= x >>> 17;
    x ^= x << 5;
    return ((x >>> 0) % 100000) / 100000;
  };
}

function randomKind(rand: () => number): GemKind {
  return GEM_KINDS[Math.floor(rand() * GEM_KIND_COUNT)] as GemKind;
}

function dealBoard(seed = Date.now()): BoardState {
  const rand = prng(seed);
  for (let tries = 0; tries < 500; tries++) {
    const cells: GemState[] = [];
    for (let row = 0; row < GRID_ROWS; row++) {
      for (let col = 0; col < GRID_COLS; col++) {
        let kind = randomKind(rand);
        for (let guard = 0; guard < 20; guard++) {
          const left2 =
            col >= 2 &&
            cells[row * GRID_COLS + col - 1]?.kind === kind &&
            cells[row * GRID_COLS + col - 2]?.kind === kind;
          const up2 =
            row >= 2 &&
            cells[(row - 1) * GRID_COLS + col]?.kind === kind &&
            cells[(row - 2) * GRID_COLS + col]?.kind === kind;
          if (!left2 && !up2) break;
          kind = randomKind(rand);
        }
        cells.push({
          col,
          row,
          kind,
          cut: "plain",
          strain: 0,
          fell: row + 1 + Math.floor(rand() * 3),
        });
      }
    }
    const board = { cols: GRID_COLS, rows: GRID_ROWS, cells };
    if (findRuns(board).length === 0 && hasLegalSwap(board)) return board;
  }
  return loadBoardRows([
    "R0 A0 C0 J0 B0 S0 M0 R0",
    "C0 J0 B0 S0 M0 R0 A0 C0",
    "B0 S0 M0 R0 A0 C0 J0 B0",
    "M0 R0 A0 C0 J0 B0 S0 M0",
    "A0 C0 J0 B0 S0 M0 R0 A0",
    "J0 B0 S0 M0 R0 A0 C0 J0",
    "S0 M0 R0 A0 C0 J0 B0 S0",
    "R0 A0 C0 J0 B0 S0 M0 R0",
  ]);
}

function targetRows(
  items: readonly string[],
  y: number,
): readonly TargetSnapshot[] {
  return items.map((_, i) => ({
    id: `menu-${i}`,
    x: STAGE_W / 2 - 160,
    y: y + i * 88,
    w: 320,
    h: TARGET_MIN_H,
  }));
}

function targetsFor(screen: Screen): readonly TargetSnapshot[] {
  if (screen === "title") return targetRows(TITLE_ITEMS, 410);
  if (screen === "paused") return targetRows(PAUSED_ITEMS, 362);
  if (screen === "levelclear") return targetRows(LEVELCLEAR_ITEMS, 438);
  if (screen === "gameover") return targetRows(GAMEOVER_ITEMS, 430);
  if (screen === "howto")
    return [{ id: "back", x: 44, y: 36, w: TARGET_MIN_W, h: TARGET_MIN_H }];
  if (screen === "playing")
    return [{ id: "pause", x: 1132, y: 28, w: 108, h: TARGET_MIN_H }];
  return [];
}

function targetAt(screen: Screen, x: number, y: number): TargetSnapshot | null {
  return (
    targetsFor(screen).find(
      (t) => x >= t.x && y >= t.y && x <= t.x + t.w && y <= t.y + t.h,
    ) ?? null
  );
}

function cellAtPoint(x: number, y: number): CellRef | null {
  let best: CellRef | null = null;
  let bestD = Infinity;
  for (let row = GRID_ROWS - 1; row >= 0; row--) {
    for (let col = GRID_COLS - 1; col >= 0; col--) {
      const dx = x - cellX(col);
      const dy = y - cellY(row);
      const d = Math.hypot(dx, dy);
      if (d <= GEM_HIT_R && d <= bestD) {
        bestD = d;
        best = { col, row };
      }
    }
  }
  return best;
}

function initialState(assets: AssetPack, muted = false): FacetState {
  return {
    screen: "title",
    menuIndex: 0,
    board: EMPTY_BOARD,
    phase: "idle",
    chainStep: 0,
    swapTimer: 0,
    stepTimer: 0,
    score: 0,
    level: 1,
    levelScore: 0,
    lastCleared: 0,
    lastPoints: 0,
    lastWaves: 0,
    moveScore: 0,
    bestMove: 0,
    bestChain: 0,
    selection: null,
    offer: null,
    refusal: null,
    armedTarget: null,
    pointer: { x: 0, y: 0, down: false, device: "mouse" },
    simTime: 0,
    muted,
    refillKinds: Array.from({ length: GRID_COLS }, () => ""),
    assets,
    swap: null,
    prismSwap: null,
    clearVisuals: [],
    fxEvents: [],
  };
}

function cleanRound(state: DeepReadonly<FacetState>): FacetState {
  return {
    ...(state as FacetState),
    board: EMPTY_BOARD,
    phase: "idle",
    chainStep: 0,
    swapTimer: 0,
    stepTimer: 0,
    selection: null,
    offer: null,
    refusal: null,
    armedTarget: null,
    swap: null,
    prismSwap: null,
    clearVisuals: [],
    fxEvents: [],
  };
}

function startRound(state: DeepReadonly<FacetState>): FacetState {
  return {
    ...(state as FacetState),
    screen: "playing",
    menuIndex: 0,
    board: dealBoard(Math.floor(state.simTime * 1000) + 17),
    phase: "idle",
    chainStep: 0,
    swapTimer: 0,
    stepTimer: 0,
    score: 0,
    level: 1,
    levelScore: 0,
    lastCleared: 0,
    lastPoints: 0,
    lastWaves: 0,
    moveScore: 0,
    bestMove: 0,
    bestChain: 0,
    selection: null,
    offer: null,
    refusal: null,
    armedTarget: null,
    refillKinds: Array.from({ length: GRID_COLS }, () => ""),
    swap: null,
    prismSwap: null,
    clearVisuals: [],
    fxEvents: [],
  };
}

function takeMenu(state: DeepReadonly<FacetState>, index: number): FacetState {
  if (state.screen === "title")
    return index === 0
      ? startRound(state)
      : { ...(state as FacetState), screen: "howto" };
  if (state.screen === "paused")
    return index === 0
      ? { ...(state as FacetState), screen: "playing", menuIndex: 0 }
      : { ...cleanRound(state), screen: "title", menuIndex: 0 };
  if (state.screen === "levelclear") {
    if (index === 0) {
      return {
        ...(state as FacetState),
        screen: "playing",
        menuIndex: 0,
        level: state.level + 1,
        levelScore: 0,
        bestChain: 0,
        bestMove: 0,
        board: dealBoard(Math.floor(state.simTime * 1000) + state.level * 31),
      };
    }
    return { ...cleanRound(state), screen: "title", menuIndex: 0 };
  }
  if (state.screen === "gameover")
    return index === 0
      ? startRound(state)
      : { ...cleanRound(state), screen: "title", menuIndex: 0 };
  return state as FacetState;
}

function moveMenu(state: DeepReadonly<FacetState>, dir: number): FacetState {
  const counts: Partial<Record<Screen, number>> = {
    title: TITLE_ITEMS.length,
    paused: PAUSED_ITEMS.length,
    levelclear: LEVELCLEAR_ITEMS.length,
    gameover: GAMEOVER_ITEMS.length,
  };
  const count = counts[state.screen];
  if (!count) return state as FacetState;
  return {
    ...(state as FacetState),
    menuIndex: (state.menuIndex + dir + count) % count,
  };
}

function requestSwapState(
  state: DeepReadonly<FacetState>,
  a: CellRef,
  b: CellRef,
): FacetState {
  assertCell(a.col, a.row);
  assertCell(b.col, b.row);
  if (
    !adjacent(a, b) ||
    state.phase !== "idle" ||
    state.board.cols !== GRID_COLS
  ) {
    return { ...(state as FacetState), refusal: { a, b, timer: 0 } };
  }
  const ga = at(state.board, a.col, a.row);
  const gb = at(state.board, b.col, b.row);
  const swapped = swapBoard(state.board, a, b);
  const prism = ga.cut === "prism" || gb.cut === "prism";
  if (!prism && findRuns(swapped).length === 0) {
    return { ...(state as FacetState), refusal: { a, b, timer: 0 } };
  }
  let prismSwap: PrismSwap | null = null;
  if (prism) {
    prismSwap = {
      all: ga.cut === "prism" && gb.cut === "prism",
      kind: ga.cut === "prism" ? gb.kind : ga.kind,
    };
  }
  return {
    ...(state as FacetState),
    board: swapped,
    phase: "swapping",
    swapTimer: 0,
    chainStep: 0,
    stepTimer: 0,
    moveScore: 0,
    refusal: null,
    swap: { a, b },
    prismSwap,
  };
}

interface StepResult {
  readonly state: FacetState;
  readonly cleared: boolean;
  readonly cut: boolean;
  readonly flaw: boolean;
  readonly land: boolean;
}

function seedForStep(
  state: DeepReadonly<FacetState>,
  runs: readonly Run[],
): Map<string, number> {
  const seed = new Map<string, number>();
  if (state.chainStep === 1 && state.prismSwap) {
    for (const cell of state.board.cells) {
      if (
        state.prismSwap.all ||
        cell.kind === state.prismSwap.kind ||
        cell.cut === "prism"
      ) {
        seed.set(key(cell), 0);
      }
    }
    return seed;
  }
  for (const run of runs) for (const cell of run.cells) seed.set(key(cell), 0);
  return seed;
}

function expandClear(
  board: DeepReadonly<BoardState>,
  seed: Map<string, number>,
): Map<string, number> {
  const waves = new Map(seed);
  const queue = [...seed.keys()];
  const add = (cell: CellRef, wave: number): void => {
    if (
      cell.col < 0 ||
      cell.row < 0 ||
      cell.col >= GRID_COLS ||
      cell.row >= GRID_ROWS
    )
      return;
    const k = key(cell);
    const old = waves.get(k);
    if (old === undefined || wave < old) {
      waves.set(k, wave);
      queue.push(k);
    }
  };
  while (queue.length) {
    const [col, row] = queue.shift()!.split(",").map(Number);
    const gem = at(board, col, row);
    const wave = (waves.get(`${col},${row}`) ?? 0) + 1;
    if (gem.cut === "brilliant") {
      for (let dr = -1; dr <= 1; dr++)
        for (let dc = -1; dc <= 1; dc++)
          if (dc || dr) add({ col: col + dc, row: row + dr }, wave);
    }
    if (gem.cut === "star") {
      for (let c = 0; c < GRID_COLS; c++) add({ col: c, row }, wave);
      for (let r = 0; r < GRID_ROWS; r++) add({ col, row: r }, wave);
    }
    for (const [dc, dr] of [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ] as const) {
      const n = { col: col + dc, row: row + dr };
      if (
        n.col >= 0 &&
        n.row >= 0 &&
        n.col < GRID_COLS &&
        n.row < GRID_ROWS &&
        at(board, n.col, n.row).strain >= MAX_STRAIN
      )
        add(n, wave);
    }
  }
  return waves;
}

function createdCuts(
  runs: readonly Run[],
  swap: SwapVisual | null,
): Map<string, GemState> {
  const result = new Map<string, GemState>();
  const byCell = new Map<string, readonly Run[]>();
  for (const run of runs) {
    for (const c of run.cells)
      byCell.set(key(c), [...(byCell.get(key(c)) ?? []), run]);
  }
  for (const [cellKey, cellRuns] of byCell) {
    const h = cellRuns.find((r) => r.dir === "h");
    const v = cellRuns.find((r) => r.dir === "v");
    if (h && v) {
      const [col, row] = cellKey.split(",").map(Number);
      result.set(cellKey, {
        col,
        row,
        kind: h.kind,
        cut: "star",
        strain: 0,
        fell: 0,
      });
    }
  }
  for (const run of runs) {
    if (run.cells.length < 4) continue;
    let place = run.cells[Math.floor((run.cells.length - 1) / 2)]!;
    const candidates = [swap?.a, swap?.b].filter(Boolean) as CellRef[];
    const inRun = candidates.filter((c) => run.cells.some((r) => same(r, c)));
    if (inRun.length)
      place = inRun.sort(
        (a, b) =>
          run.cells.findIndex((r) => same(r, a)) -
          run.cells.findIndex((r) => same(r, b)),
      )[0]!;
    const made: GemState = {
      col: place.col,
      row: place.row,
      kind: run.cells.length >= 5 ? null : run.kind,
      cut: run.cells.length >= 5 ? "prism" : "brilliant",
      strain: 0,
      fell: 0,
    };
    const old = result.get(key(place));
    if (
      !old ||
      (made.cut === "prism" && old.cut !== "prism") ||
      (made.cut === "star" && old.cut === "brilliant")
    ) {
      result.set(key(place), made);
    }
  }
  return result;
}

function settle(
  state: DeepReadonly<FacetState>,
  clear: Map<string, number>,
  created: Map<string, GemState>,
): { board: BoardState; fall: number } {
  const rand = prng(
    Math.floor(state.simTime * 10000) + state.score + state.chainStep * 97,
  );
  const cells: (GemState | null)[] = Array.from(
    { length: GRID_COLS * GRID_ROWS },
    () => null,
  );
  let fall = 0;
  for (let col = 0; col < GRID_COLS; col++) {
    const fixedRows = new Set<number>();
    for (const gem of created.values()) {
      if (gem.col === col) {
        cells[gem.row * GRID_COLS + col] = gem;
        fixedRows.add(gem.row);
      }
    }
    const survivors: GemState[] = [];
    for (let row = GRID_ROWS - 1; row >= 0; row--) {
      const gem = at(state.board, col, row);
      if (!clear.has(key(gem)) && !created.has(key(gem))) survivors.push(gem);
    }
    let cursor = GRID_ROWS - 1;
    for (const gem of survivors) {
      while (fixedRows.has(cursor)) cursor--;
      const fell = cursor - gem.row;
      fall = Math.max(fall, fell);
      cells[cursor * GRID_COLS + col] = { ...gem, col, row: cursor, fell };
      cursor--;
    }
    while (cursor >= 0) {
      if (!fixedRows.has(cursor)) {
        const posed = state.refillKinds[col] ?? "";
        const kind = KIND_BY_LETTER[posed[cursor]] ?? randomKind(rand);
        const fell = cursor + 1 + Math.floor(rand() * 3);
        fall = Math.max(fall, fell);
        cells[cursor * GRID_COLS + col] = {
          col,
          row: cursor,
          kind,
          cut: "plain",
          strain: 0,
          fell,
        };
      }
      cursor--;
    }
  }
  return {
    board: { cols: GRID_COLS, rows: GRID_ROWS, cells: cells as GemState[] },
    fall,
  };
}

function resolveStep(state: DeepReadonly<FacetState>): StepResult {
  const runs =
    state.chainStep === 1 && state.prismSwap ? [] : findRuns(state.board);
  const seed = seedForStep(state, runs);
  if (seed.size === 0)
    return {
      state: state as FacetState,
      cleared: false,
      cut: false,
      flaw: false,
      land: false,
    };
  const clear = expandClear(state.board, seed);
  const visuals: ClearVisual[] = [...clear.entries()].map(([cellKey, wave]) => {
    const [col, row] = cellKey.split(",").map(Number);
    const gem = at(state.board, col, row);
    return { cell: { col, row }, kind: gem.kind, strain: gem.strain, wave };
  });
  let points = 0;
  for (const v of visuals)
    points +=
      (v.strain >= MAX_STRAIN ? FLAWED_SCORE : BASE_SCORE) *
      Math.min(state.chainStep, MAX_MULTIPLIER);
  let flaw = false;
  const strained = state.board.cells.map((cell) => {
    if (clear.has(key(cell))) return cell as GemState;
    const near = [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ].some(([dc, dr]) => clear.has(`${cell.col + dc},${cell.row + dr}`));
    if (!near) return cell as GemState;
    const strain = Math.min(MAX_STRAIN, cell.strain + 1);
    if (strain === MAX_STRAIN && cell.strain < MAX_STRAIN) flaw = true;
    return { ...(cell as GemState), strain };
  });
  const boardAfterStrain = {
    cols: GRID_COLS,
    rows: GRID_ROWS,
    cells: strained,
  };
  const created = createdCuts(runs, state.swap);
  const settled = settle({ ...state, board: boardAfterStrain }, clear, created);
  const waves = Math.max(0, ...visuals.map((v) => v.wave));
  const fx: FxEvent[] = visuals.flatMap((v) => {
    const x = cellX(v.cell.col);
    const y = cellY(v.cell.row);
    return [
      { name: "clear-burst" as const, x, y, started: state.simTime },
      ...(v.strain >= MAX_STRAIN
        ? [{ name: "flawed-detonation" as const, x, y, started: state.simTime }]
        : []),
    ];
  });
  for (const gem of created.values())
    fx.push({
      name: "cut-flash",
      x: cellX(gem.col),
      y: cellY(gem.row),
      started: state.simTime,
    });
  return {
    state: {
      ...(state as FacetState),
      board: settled.board,
      stepTimer: 0,
      lastCleared: clear.size,
      lastPoints: points,
      lastWaves: waves,
      score: state.score + points,
      levelScore: state.levelScore + points,
      moveScore: state.moveScore + points,
      bestChain: Math.max(state.bestChain, state.chainStep),
      clearVisuals: visuals,
      fxEvents: [
        ...state.fxEvents.filter((e) => state.simTime - e.started < 1.2),
        ...fx,
      ],
    },
    cleared: true,
    cut: created.size > 0,
    flaw,
    land: settled.fall > LAND_MIN_ROWS,
  };
}

function stepHold(state: DeepReadonly<FacetState>): number {
  return (
    state.lastWaves * WAVE_SECONDS +
    lastFall(state.board) * FALL_SECONDS_PER_ROW +
    STEP_SECONDS
  );
}

function lastFall(board: DeepReadonly<BoardState>): number {
  return Math.max(0, ...board.cells.map((g) => g.fell));
}

function advancePlaying(
  state: DeepReadonly<FacetState>,
  api: UpdateApi,
  dt: number,
): FacetState {
  let next: FacetState = state as FacetState;
  if (next.refusal) {
    const timer = next.refusal.timer + dt;
    next = {
      ...next,
      refusal: timer >= REFUSAL_SECONDS ? null : { ...next.refusal, timer },
    };
  }
  if (next.phase === "swapping") {
    const swapTimer = next.swapTimer + dt;
    if (swapTimer >= SWAP_SECONDS) {
      next = { ...next, phase: "resolving", swapTimer: 0, chainStep: 1 };
      const result = resolveStep(next);
      next = result.state;
      if (result.cleared) playStepCues(api, next, result);
    } else next = { ...next, swapTimer };
  } else if (next.phase === "resolving") {
    const timer = next.stepTimer + dt;
    if (timer >= stepHold(next)) {
      const probe = {
        ...next,
        chainStep: next.chainStep + 1,
        stepTimer: 0,
        prismSwap: null,
        swap: null,
      };
      const result = resolveStep(probe);
      if (result.cleared) {
        next = result.state;
        playStepCues(api, next, result);
      } else {
        next = {
          ...next,
          phase: "idle",
          chainStep: 0,
          stepTimer: 0,
          swap: null,
          prismSwap: null,
          bestMove: Math.max(next.bestMove, next.moveScore),
          clearVisuals: [],
        };
        if (next.levelScore >= next.level * LEVEL_TARGET_STEP) {
          api.audio.play(CUES.levelUp);
          next = { ...next, screen: "levelclear", menuIndex: 0 };
        } else if (!hasLegalSwap(next.board)) {
          api.audio.play(CUES.gameOver);
          next = { ...next, screen: "gameover", menuIndex: 0 };
        }
      }
    } else next = { ...next, stepTimer: timer };
  }
  return next;
}

function playStepCues(
  api: UpdateApi,
  state: DeepReadonly<FacetState>,
  result: StepResult,
): void {
  api.audio.play(CUES.clear);
  api.audio.play(`chain-${Math.min(state.chainStep, MAX_MULTIPLIER)}`);
  if (result.land) api.audio.play(CUES.land);
  if (result.flaw) api.audio.play(CUES.flaw);
  if (result.cut) api.audio.play(CUES.cut);
}

function pointerPress(
  state: DeepReadonly<FacetState>,
  x: number,
  y: number,
  device: PointerDevice,
): FacetState {
  const pointer = { x, y, down: true, device };
  const target = targetAt(state.screen, x, y);
  if (target) {
    const menuIndex = target.id.startsWith("menu-")
      ? Number(target.id.slice(5))
      : state.menuIndex;
    return {
      ...(state as FacetState),
      pointer,
      menuIndex,
      armedTarget: target.id,
    };
  }
  if (state.screen !== "playing")
    return { ...(state as FacetState), pointer, armedTarget: null };
  const cell = cellAtPoint(x, y);
  if (!cell)
    return {
      ...(state as FacetState),
      pointer,
      selection: null,
      offer: null,
      armedTarget: null,
    };
  if (!state.selection)
    return {
      ...(state as FacetState),
      pointer,
      selection: cell,
      offer: null,
      armedTarget: null,
    };
  if (same(cell, state.selection))
    return {
      ...(state as FacetState),
      pointer,
      offer: null,
      armedTarget: null,
    };
  if (adjacent(cell, state.selection))
    return {
      ...(state as FacetState),
      pointer,
      offer: cell,
      armedTarget: null,
    };
  return {
    ...(state as FacetState),
    pointer,
    selection: cell,
    offer: null,
    armedTarget: null,
  };
}

function pointerMove(
  state: DeepReadonly<FacetState>,
  x: number,
  y: number,
  device: PointerDevice,
): FacetState {
  const pointer = { x, y, down: state.pointer.down, device };
  const target = targetAt(state.screen, x, y);
  if (target?.id.startsWith("menu-") && !state.armedTarget)
    return {
      ...(state as FacetState),
      pointer,
      menuIndex: Number(target.id.slice(5)),
    };
  if (state.screen !== "playing" || !state.pointer.down || !state.selection)
    return { ...(state as FacetState), pointer };
  const cell = cellAtPoint(x, y);
  if (same(cell, state.selection))
    return { ...(state as FacetState), pointer, offer: null };
  if (cell && adjacent(cell, state.selection))
    return { ...(state as FacetState), pointer, offer: cell };
  return { ...(state as FacetState), pointer };
}

function pointerRelease(
  state: DeepReadonly<FacetState>,
  device: PointerDevice,
): FacetState {
  const pointer = { ...state.pointer, down: false, device };
  const target = targetAt(state.screen, state.pointer.x, state.pointer.y);
  if (state.armedTarget && target?.id === state.armedTarget) {
    if (target.id === "pause")
      return {
        ...(state as FacetState),
        pointer,
        screen: "paused",
        menuIndex: 0,
        armedTarget: null,
      };
    if (target.id === "back")
      return {
        ...(state as FacetState),
        pointer,
        screen: "title",
        menuIndex: 1,
        armedTarget: null,
      };
    return {
      ...takeMenu(state, Number(target.id.slice(5))),
      pointer,
      armedTarget: null,
    };
  }
  if (state.screen === "playing" && state.selection && state.offer) {
    return {
      ...requestSwapState(state, state.selection, state.offer),
      pointer,
      selection: null,
      offer: null,
      armedTarget: null,
    };
  }
  return { ...(state as FacetState), pointer, armedTarget: null };
}

function snapshot(state: DeepReadonly<FacetState>): FacetSnapshot {
  return {
    version: FACET_DEBUG_VERSION,
    screen: state.screen,
    menuIndex: state.menuIndex,
    score: state.score,
    level: state.level,
    levelScore: state.levelScore,
    levelTarget: state.level * LEVEL_TARGET_STEP,
    phase: state.phase,
    chainStep: state.chainStep,
    multiplier: Math.min(state.chainStep, MAX_MULTIPLIER),
    swapTimer: state.swapTimer,
    stepTimer: state.stepTimer,
    stepHold: stepHold(state),
    board: {
      cols: state.board.cols,
      rows: state.board.rows,
      cells: state.board.cells.map((cell) => ({
        ...(cell as GemState),
        x: cellX(cell.col),
        y: cellY(cell.row),
      })),
    },
    selection: state.selection,
    offer: state.offer,
    refusal: state.refusal ? { a: state.refusal.a, b: state.refusal.b } : null,
    lastCleared: state.lastCleared,
    lastPoints: state.lastPoints,
    lastWaves: state.lastWaves,
    lastFall: lastFall(state.board),
    moveScore: state.moveScore,
    bestMove: state.bestMove,
    bestChain: state.bestChain,
    legalSwap: hasLegalSwap(state.board),
    refillKinds: state.refillKinds,
    pointer: state.pointer,
    armedTarget: state.armedTarget,
    targets: targetsFor(state.screen),
    muted: state.muted,
    simTime: state.simTime,
  };
}

function debugApi(assets: AssetPack): FacetDebugApi {
  return {
    version: FACET_DEBUG_VERSION,
    reset: (state) => initialState(assets, state.muted),
    reconcile: (state) => state as FacetState,
    snapshot,
    setScreen: (state, screen) => {
      if (
        ![
          "title",
          "howto",
          "playing",
          "paused",
          "levelclear",
          "gameover",
        ].includes(screen)
      )
        throw new Error("Facet: bad screen");
      return { ...(state as FacetState), screen };
    },
    setMenuIndex: (state, index) => {
      if (!Number.isInteger(index) || index < 0)
        throw new RangeError("Facet: menu index must be >= 0");
      return { ...(state as FacetState), menuIndex: index };
    },
    loadBoard: (state, rows) => ({
      ...(state as FacetState),
      board: loadBoardRows(rows),
    }),
    dealBoard: (state) => ({
      ...(state as FacetState),
      board: dealBoard(Math.floor(state.simTime * 1000) + 5),
    }),
    clearBoard: (state) => ({ ...(state as FacetState), board: EMPTY_BOARD }),
    setGem: (state, col, row, token) => {
      assertCell(col, row);
      return {
        ...(state as FacetState),
        board: replaceGem(state.board, parseToken(token, col, row)),
      };
    },
    setRefillKinds: (state, col, kinds) => {
      if (!Number.isInteger(col) || col < 0 || col >= GRID_COLS)
        throw new RangeError("Facet: bad refill column");
      if (![...kinds].every((k) => KIND_BY_LETTER[k]))
        throw new Error("Facet: bad refill kind string");
      return {
        ...(state as FacetState),
        refillKinds: state.refillKinds.map((v, i) => (i === col ? kinds : v)),
      };
    },
    clearRefillKinds: (state) => ({
      ...(state as FacetState),
      refillKinds: Array.from({ length: GRID_COLS }, () => ""),
    }),
    setScore: (state, points) => ({ ...(state as FacetState), score: points }),
    setLevel: (state, level) => {
      if (!Number.isInteger(level) || level < 1)
        throw new RangeError("Facet: level must be >= 1");
      return { ...(state as FacetState), level };
    },
    setLevelScore: (state, points) => ({
      ...(state as FacetState),
      levelScore: points,
    }),
    setBestChain: (state, bestChain) => ({
      ...(state as FacetState),
      bestChain,
    }),
    setBestMove: (state, bestMove) => ({ ...(state as FacetState), bestMove }),
    setMoveScore: (state, moveScore) => ({
      ...(state as FacetState),
      moveScore,
    }),
    setSelection: (state, col, row) => {
      assertCell(col, row);
      return { ...(state as FacetState), selection: { col, row } };
    },
    clearSelection: (state) => ({ ...(state as FacetState), selection: null }),
    setOffer: (state, col, row) => {
      assertCell(col, row);
      return { ...(state as FacetState), offer: { col, row } };
    },
    clearOffer: (state) => ({ ...(state as FacetState), offer: null }),
    clearRefusal: (state) => ({ ...(state as FacetState), refusal: null }),
    clearChain: (state) => ({
      ...(state as FacetState),
      phase: "idle",
      chainStep: 0,
      swapTimer: 0,
      stepTimer: 0,
    }),
    requestSwap: (state, colA, rowA, colB, rowB) =>
      requestSwapState(
        state,
        { col: colA, row: rowA },
        { col: colB, row: rowB },
      ),
    pointerDown: (state, x, y, device = "mouse") =>
      pointerPress(state, x, y, device),
    pointerMove: (state, x, y, device = "mouse") =>
      pointerMove(state, x, y, device),
    pointerUp: (state, device = "mouse") => pointerRelease(state, device),
  };
}

async function loadJson(
  api: InitApi<FacetState>,
  path: string,
): Promise<ParticleSystem> {
  return JSON.parse(
    await (await api.assets.load(path)).text(),
  ) as ParticleSystem;
}

async function loadAssets(api: InitApi<FacetState>): Promise<AssetPack> {
  const gems: Record<string, ImageBitmap> = {};
  const breakFrames = {} as Record<GemKind, ImageBitmap[]>;
  await Promise.all(
    GEM_KINDS.flatMap((kind) => [
      ...[0, 1, 2, 3].map(async (strain) => {
        gems[`${kind}-${strain}`] = await api.assets.loadImage(
          `gems/${kind}-${strain}.png`,
        );
      }),
      (async () => {
        breakFrames[kind] = await Promise.all(
          Array.from({ length: 8 }, (_, i) =>
            api.assets.loadImage(
              `gems/break/${kind}/${String(i).padStart(2, "0")}.png`,
            ),
          ),
        );
      })(),
    ]),
  );
  await Promise.all(
    [0, 1, 2, 3].map(async (strain) => {
      gems[`prism-${strain}`] = await api.assets.loadImage(
        `gems/prism-${strain}.png`,
      );
    }),
  );
  gems.brilliant = await api.assets.loadImage("gems/brilliant.png");
  gems.star = await api.assets.loadImage("gems/star.png");
  const [
    boardFrame,
    prismTurn,
    clearBurst,
    flawedDetonation,
    cutFlash,
    cutAura,
  ] = await Promise.all([
    api.assets.loadImage("gems/board-frame.png"),
    Promise.all(
      Array.from({ length: 10 }, (_, i) =>
        api.assets.loadImage(
          `gems/prism-turn/${String(i).padStart(2, "0")}.png`,
        ),
      ),
    ),
    loadJson(api, "fx/clear-burst.json"),
    loadJson(api, "fx/flawed-detonation.json"),
    loadJson(api, "fx/cut-flash.json"),
    loadJson(api, "fx/cut-aura.json"),
  ]);
  return {
    gems,
    breakFrames,
    prismTurn,
    boardFrame,
    fx: {
      "clear-burst": clearBurst,
      "flawed-detonation": flawedDetonation,
      "cut-flash": cutFlash,
      "cut-aura": cutAura,
    },
  };
}

export const game: Game<FacetState, FacetDebugApi> = {
  async initialize(
    api: InitApi<FacetState>,
  ): Promise<[FacetState, FacetDebugApi]> {
    for (const action of ACTIONS)
      api.input.register(action, { keys: [...BINDINGS[action]] });
    const cueLoads = [
      ...Object.values(CUES).map((cue) =>
        api.audio.load(cue, `audio/${cue}.wav`),
      ),
      ...Array.from({ length: MAX_MULTIPLIER }, (_, i) =>
        api.audio.load(`chain-${i + 1}`, `audio/chain-${i + 1}.wav`),
      ),
      api.audio.load("music-title", "audio/title-theme.wav"),
      api.audio.load("music-play", "audio/play-bed.wav"),
    ];
    const [assets] = await Promise.all([loadAssets(api), ...cueLoads]);
    api.diagnostics.register("screen", (s) => s.screen);
    api.diagnostics.register("phase", (s) => s.phase);
    api.diagnostics.register("board", (s) => `${s.board.cols}x${s.board.rows}`);
    api.diagnostics.register("score", (s) => s.score);
    api.diagnostics.register(
      "level",
      (s) => `${s.level}:${s.levelScore}/${s.level * LEVEL_TARGET_STEP}`,
    );
    api.diagnostics.register(
      "chain",
      (s) => `${s.chainStep} x${Math.min(s.chainStep, MAX_MULTIPLIER)}`,
    );
    api.diagnostics.register(
      "cleared",
      (s) => `${s.lastCleared}/${s.lastPoints}`,
    );
    api.diagnostics.register(
      "waves/fall",
      (s) => `${s.lastWaves}/${lastFall(s.board)}`,
    );
    api.diagnostics.register("selection", (s) =>
      s.selection ? key(s.selection) : "-",
    );
    api.diagnostics.register("offer", (s) => (s.offer ? key(s.offer) : "-"));
    api.diagnostics.register("best", (s) => `${s.bestMove}/${s.bestChain}`);
    api.diagnostics.register("legal", (s) => hasLegalSwap(s.board));
    api.diagnostics.register(
      "pointer",
      (s) =>
        `${Math.round(s.pointer.x)},${Math.round(s.pointer.y)} ${s.pointer.device}`,
    );
    return [initialState(assets), debugApi(assets)];
  },

  update(
    state: DeepReadonly<FacetState>,
    api: UpdateApi,
    dt: number,
  ): FacetState {
    let next: FacetState = {
      ...(state as FacetState),
      simTime: state.simTime + dt,
      pointer: api.input.pointer(),
      muted: api.audio.muted(),
      fxEvents: state.fxEvents.filter(
        (e) => state.simTime + dt - e.started < 1.4,
      ),
    };
    if (api.input.pressed("mute")) {
      api.audio.setMuted(!api.audio.muted());
      next = { ...next, muted: api.audio.muted() };
    }
    const wantsTitle = next.screen === "title" || next.screen === "howto";
    if (wantsTitle && !api.audio.looping("music-title"))
      api.audio.loop("music-title");
    if (!wantsTitle && api.audio.looping("music-title"))
      api.audio.stop("music-title");
    if (!wantsTitle && !api.audio.looping("music-play"))
      api.audio.loop("music-play");
    if (wantsTitle && api.audio.looping("music-play"))
      api.audio.stop("music-play");

    for (const sample of api.input.pointerSamples().filter((s) => s.primary)) {
      if (sample.type === "down")
        next = pointerPress(next, sample.x, sample.y, sample.device);
      else if (sample.type === "move")
        next = pointerMove(next, sample.x, sample.y, sample.device);
      else
        next = pointerRelease(
          {
            ...next,
            pointer: {
              x: sample.x,
              y: sample.y,
              down: true,
              device: sample.device,
            },
          },
          sample.device,
        );
    }
    if (api.input.pressed("up")) next = moveMenu(next, -1);
    if (api.input.pressed("down")) next = moveMenu(next, 1);
    if (api.input.pressed("confirm")) next = takeMenu(next, next.menuIndex);
    if (api.input.pressed("back") && next.screen === "howto")
      next = { ...next, screen: "title", menuIndex: 1, armedTarget: null };
    else if (api.input.pressed("back") && next.screen === "gameover")
      next = { ...next, screen: "title", menuIndex: 0, armedTarget: null };
    if (api.input.pressed("pause")) {
      if (next.screen === "playing")
        next = { ...next, screen: "paused", menuIndex: 0, armedTarget: null };
      else if (next.screen === "paused")
        next = { ...next, screen: "playing", menuIndex: 0, armedTarget: null };
    }
    if (next.screen === "playing") next = advancePlaying(next, api, dt);
    return next;
  },

  render(state: DeepReadonly<FacetState>, api: RenderApi): void {
    const ctx = api.ctx;
    drawBackground(ctx, state.simTime);
    if (state.board.cols === GRID_COLS) drawBoard(ctx, state);
    if (state.screen === "playing") drawHud(ctx, state);
    if (state.screen === "title") drawTitle(ctx, state);
    if (state.screen === "howto") drawHowto(ctx);
    if (state.screen === "paused")
      drawOverlayMenu(ctx, state, PAUSED_TITLE_TEXT, PAUSED_ITEMS, 250);
    if (state.screen === "levelclear") drawLevelClear(ctx, state);
    if (state.screen === "gameover") drawGameOver(ctx, state);
  },
};

function drawBackground(ctx: CanvasRenderingContext2D, t: number): void {
  const g = ctx.createLinearGradient(0, 0, STAGE_W, STAGE_H);
  g.addColorStop(0, "#101522");
  g.addColorStop(0.55, "#171b2c");
  g.addColorStop(1, "#0b1020");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, STAGE_W, STAGE_H);
  ctx.globalAlpha = 0.22;
  ctx.strokeStyle = "#3e4866";
  for (let x = -100 + ((t * 12) % 80); x < STAGE_W + 100; x += 80) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x + 260, STAGE_H);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
}

function gemImage(
  state: DeepReadonly<FacetState>,
  gem: DeepReadonly<GemState>,
): ImageBitmap {
  if (gem.cut === "prism") return state.assets.gems[`prism-${gem.strain}`]!;
  return state.assets.gems[`${gem.kind}-${gem.strain}`]!;
}

function drawBoard(
  ctx: CanvasRenderingContext2D,
  state: DeepReadonly<FacetState>,
): void {
  const left = cellX(0) - 78;
  const top = cellY(0) - 78;
  ctx.drawImage(state.assets.boardFrame, left, top, 660, 660);
  const swapped = new Map<string, { x: number; y: number }>();
  if (state.phase === "swapping" && state.swap) {
    const p = Math.min(1, state.swapTimer / SWAP_SECONDS);
    const ax = cellX(state.swap.a.col);
    const ay = cellY(state.swap.a.row);
    const bx = cellX(state.swap.b.col);
    const by = cellY(state.swap.b.row);
    swapped.set(key(state.swap.a), {
      x: bx + (ax - bx) * p,
      y: by + (ay - by) * p,
    });
    swapped.set(key(state.swap.b), {
      x: ax + (bx - ax) * p,
      y: ay + (by - ay) * p,
    });
  }
  for (const gem of state.board.cells) {
    let x = cellX(gem.col);
    let y = cellY(gem.row);
    const swapPos = swapped.get(key(gem));
    if (swapPos) {
      x = swapPos.x;
      y = swapPos.y;
    } else if (state.phase === "resolving" && gem.fell > 0) {
      const startY = cellY(gem.row - gem.fell);
      const fallStart = state.lastWaves * WAVE_SECONDS;
      const fallDur = Math.max(0.001, gem.fell * FALL_SECONDS_PER_ROW);
      const p = Math.max(
        0,
        Math.min(1, (state.stepTimer - fallStart) / fallDur),
      );
      y = startY + (cellY(gem.row) - startY) * (1 - (1 - p) * (1 - p));
    }
    drawGem(ctx, state, gem, x, y);
  }
  drawClearVisuals(ctx, state);
  drawFx(ctx, state);
  drawMarks(ctx, state);
}

function drawGem(
  ctx: CanvasRenderingContext2D,
  state: DeepReadonly<FacetState>,
  gem: DeepReadonly<GemState>,
  x: number,
  y: number,
): void {
  if (gem.cut === "prism") {
    const frame =
      Math.floor(state.simTime * 12) % state.assets.prismTurn.length;
    ctx.drawImage(state.assets.prismTurn[frame]!, x - 32, y - 32);
  } else {
    ctx.drawImage(gemImage(state, gem), x - 32, y - 32);
    if (gem.cut === "brilliant")
      ctx.drawImage(state.assets.gems.brilliant!, x - 32, y - 32);
    if (gem.cut === "star")
      ctx.drawImage(state.assets.gems.star!, x - 32, y - 32);
  }
  if (gem.cut !== "plain")
    drawSimParticles(
      ctx,
      state.assets.fx["cut-aura"] as ParticleSystem,
      x,
      y,
      (state.simTime * 1000) % 1100,
      0.36,
    );
}

function drawClearVisuals(
  ctx: CanvasRenderingContext2D,
  state: DeepReadonly<FacetState>,
): void {
  if (state.phase !== "resolving") return;
  for (const visual of state.clearVisuals) {
    const local = state.stepTimer - visual.wave * WAVE_SECONDS;
    if (local < 0 || local > 0.55) continue;
    const x = cellX(visual.cell.col);
    const y = cellY(visual.cell.row);
    const alpha = Math.max(0, 1 - local / 0.55);
    ctx.save();
    ctx.globalAlpha = alpha;
    if (visual.kind) {
      const frames = state.assets.breakFrames[visual.kind];
      const frame = Math.min(
        frames.length - 1,
        Math.floor((local / 0.55) * frames.length),
      );
      ctx.drawImage(frames[frame]!, x - 32, y - 32);
    }
    ctx.restore();
  }
}

function drawSimParticles(
  ctx: CanvasRenderingContext2D,
  system: ParticleSystem,
  x: number,
  y: number,
  ageMs: number,
  scale: number,
): void {
  const sim = new ParticleSimulator(system as ParticleSystem, {
    seed: Math.floor(x * 3 + y * 5 + ageMs),
  });
  sim.step(ageMs);
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  for (const p of sim.capture()) {
    const px = x + (p.position[0] - 32) * scale;
    const py = y - (p.position[1] - 32) * scale;
    const r = Math.max(1, p.size * 9 * scale);
    const [cr, cg, cb] = p.color.map((c) =>
      Math.round(Math.max(0, Math.min(1, c)) * 255),
    );
    const g = ctx.createRadialGradient(px, py, 0, px, py, r);
    g.addColorStop(0, `rgba(${cr},${cg},${cb},${p.opacity})`);
    g.addColorStop(1, `rgba(${cr},${cg},${cb},0)`);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(px, py, r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawFx(
  ctx: CanvasRenderingContext2D,
  state: DeepReadonly<FacetState>,
): void {
  for (const fx of state.fxEvents) {
    const age = (state.simTime - fx.started) * 1000;
    if (age >= 0)
      drawSimParticles(
        ctx,
        state.assets.fx[fx.name] as ParticleSystem,
        fx.x,
        fx.y,
        age,
        0.78,
      );
  }
}

function drawMarks(
  ctx: CanvasRenderingContext2D,
  state: DeepReadonly<FacetState>,
): void {
  const mark = (cell: CellRef, color: string, width: number): void => {
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.strokeRect(cellX(cell.col) - 35, cellY(cell.row) - 35, 70, 70);
  };
  if (state.selection) mark(state.selection, "#fff8b8", 4);
  if (state.offer) mark(state.offer, "#8fffe9", 4);
  if (state.refusal) {
    mark(state.refusal.a, "#ff5f7c", 5);
    mark(state.refusal.b, "#ff5f7c", 5);
  }
}

function drawButton(
  ctx: CanvasRenderingContext2D,
  target: TargetSnapshot,
  label: string,
  active: boolean,
): void {
  ctx.fillStyle = active ? "#edf7ff" : "#20283d";
  ctx.strokeStyle = active ? "#ffffff" : "#74809b";
  ctx.lineWidth = 2;
  ctx.fillRect(target.x, target.y, target.w, target.h);
  ctx.strokeRect(target.x, target.y, target.w, target.h);
  ctx.fillStyle = active ? "#11182a" : "#edf7ff";
  ctx.font = "700 24px system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(label, target.x + target.w / 2, target.y + target.h / 2);
}

function drawHud(
  ctx: CanvasRenderingContext2D,
  state: DeepReadonly<FacetState>,
): void {
  ctx.fillStyle = "#edf7ff";
  ctx.font = "700 24px system-ui, sans-serif";
  ctx.textAlign = "left";
  ctx.fillText(`${HUD_SCORE_LABEL} ${state.score}`, 48, 48);
  ctx.fillText(`${HUD_LEVEL_LABEL} ${state.level}`, 48, 84);
  const target = state.level * LEVEL_TARGET_STEP;
  ctx.fillStyle = "#27314a";
  ctx.fillRect(210, 62, 330, 18);
  ctx.fillStyle = "#65e6c6";
  ctx.fillRect(210, 62, Math.min(330, (state.levelScore / target) * 330), 18);
  if (state.phase === "resolving")
    ctx.fillText(
      `${HUD_CHAIN_LABEL} x${Math.min(state.chainStep, MAX_MULTIPLIER)}`,
      760,
      62,
    );
  drawButton(ctx, targetsFor("playing")[0]!, PAUSE_LABEL, false);
}

function drawTitle(
  ctx: CanvasRenderingContext2D,
  state: DeepReadonly<FacetState>,
): void {
  ctx.textAlign = "center";
  ctx.fillStyle = "#ffffff";
  ctx.font = "900 108px system-ui, sans-serif";
  ctx.fillText(TITLE_TEXT, STAGE_W / 2, 210);
  ctx.font = "700 24px system-ui, sans-serif";
  ctx.fillStyle = "#9eeadc";
  ctx.fillText(TAGLINE_TEXT, STAGE_W / 2, 260);
  targetsFor("title").forEach((target, i) =>
    drawButton(ctx, target, TITLE_ITEMS[i]!, i === state.menuIndex),
  );
}

function drawHowto(ctx: CanvasRenderingContext2D): void {
  drawButton(ctx, targetsFor("howto")[0]!, BACK_LABEL, false);
  ctx.fillStyle = "#ffffff";
  ctx.font = "800 42px system-ui, sans-serif";
  ctx.textAlign = "left";
  ctx.fillText("How to play", 220, 84);
  ctx.font = "22px system-ui, sans-serif";
  const lines = [
    "Take hold of a gem and let go over a neighbor to swap.",
    "Three or more of one kind shatter. Empty swaps are refused.",
    "Clears strain adjacent gems; flawed gems break with any clear touching them and score double.",
    "Four in a line leaves a brilliant. Five or more leaves a prism. Crossed lines leave a star.",
    "Brilliants burst around themselves, stars take a row and column, prisms clear a whole kind.",
    "Falling gems can chain again, and each step climbs the multiplier.",
    "Reach the level target to continue. A round ends when no scoring move remains.",
    "Menus: arrows, Enter, Space, Esc, P, M. The board works with mouse, pen, or touch.",
  ];
  lines.forEach((line, i) => ctx.fillText(line, 220, 145 + i * 50));
}

function drawOverlayMenu(
  ctx: CanvasRenderingContext2D,
  state: DeepReadonly<FacetState>,
  title: string,
  items: readonly string[],
  y: number,
): void {
  ctx.fillStyle = "#070b14bb";
  ctx.fillRect(0, 0, STAGE_W, STAGE_H);
  ctx.textAlign = "center";
  ctx.fillStyle = "#ffffff";
  ctx.font = "900 64px system-ui, sans-serif";
  ctx.fillText(title, STAGE_W / 2, y);
  targetsFor(state.screen).forEach((target, i) =>
    drawButton(ctx, target, items[i]!, i === state.menuIndex),
  );
}

function drawLevelClear(
  ctx: CanvasRenderingContext2D,
  state: DeepReadonly<FacetState>,
): void {
  drawOverlayMenu(ctx, state, LEVELCLEAR_TITLE_TEXT, LEVELCLEAR_ITEMS, 206);
  ctx.fillStyle = "#d7fbff";
  ctx.font = "700 26px system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(`${BEST_CHAIN_LABEL}: ${state.bestChain}`, STAGE_W / 2, 300);
  ctx.fillText(`${BEST_MOVE_LABEL}: ${state.bestMove}`, STAGE_W / 2, 338);
}

function drawGameOver(
  ctx: CanvasRenderingContext2D,
  state: DeepReadonly<FacetState>,
): void {
  drawOverlayMenu(ctx, state, GAMEOVER_TITLE_TEXT, GAMEOVER_ITEMS, 216);
  ctx.fillStyle = "#d7fbff";
  ctx.font = "700 26px system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(`SCORE ${state.score}   LEVEL ${state.level}`, STAGE_W / 2, 314);
}

export const __facetTest = {
  expandClear,
  findRuns,
  hasLegalSwap,
  loadBoardRows,
  requestSwapState,
  resolveStep,
  stepHold,
};
