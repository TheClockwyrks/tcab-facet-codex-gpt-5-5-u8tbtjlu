import { describe, expect, it } from "vitest";
import type { FacetState } from "./game";
import { __facetTest } from "./game";

const assets = {
  gems: {},
  breakFrames: {},
  prismTurn: [],
  boardFrame: {},
  fx: {},
} as unknown as FacetState["assets"];

function state(rows: readonly string[]): FacetState {
  return {
    screen: "playing",
    menuIndex: 0,
    board: __facetTest.loadBoardRows(rows),
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
    muted: false,
    refillKinds: ["", "", "", "", "", "", "", ""],
    assets,
    swap: null,
    prismSwap: null,
    clearVisuals: [],
    fxEvents: [],
  };
}

describe("Facet simulation", () => {
  it("reads notation and finds maximal runs without prisms", () => {
    const board = __facetTest.loadBoardRows([
      "R0 R0 R0 J0 B0 S0 M0 X0",
      "C0 J0 B0 S0 M0 R0 A0 C0",
      "B0 S0 M0 R0 A0 C0 J0 B0",
      "M0 R0 A0 C0 J0 B0 S0 M0",
      "A0 C0 J0 B0 S0 M0 R0 A0",
      "J0 B0 S0 M0 R0 A0 C0 J0",
      "S0 M0 R0 A0 C0 J0 B0 S0",
      "R0 A0 C0 J0 B0 S0 M0 R0",
    ]);

    const runs = __facetTest.findRuns(board);

    expect(runs).toHaveLength(1);
    expect(runs[0]?.kind).toBe("ruby");
    expect(board.cells[7]?.cut).toBe("prism");
    expect(board.cells[7]?.kind).toBeNull();
  });

  it("accepts productive swaps and refuses unproductive ones", () => {
    const s = state([
      "R0 A0 C0 J0 B0 S0 M0 R0",
      "A0 R0 B0 S0 M0 R0 A0 C0",
      "R0 S0 M0 R0 A0 C0 J0 B0",
      "M0 R0 A0 C0 J0 B0 S0 M0",
      "A0 C0 J0 B0 S0 M0 R0 A0",
      "J0 B0 S0 M0 R0 A0 C0 J0",
      "S0 M0 R0 A0 C0 J0 B0 S0",
      "R0 A0 C0 J0 B0 S0 M0 R0",
    ]);

    const accepted = __facetTest.requestSwapState(
      s,
      { col: 1, row: 1 },
      { col: 0, row: 1 },
    );
    const refused = __facetTest.requestSwapState(
      s,
      { col: 7, row: 7 },
      { col: 6, row: 7 },
    );

    expect(accepted.phase).toBe("swapping");
    expect(refused.phase).toBe("idle");
    expect(refused.refusal).toEqual({
      a: { col: 7, row: 7 },
      b: { col: 6, row: 7 },
      timer: 0,
    });
  });

  it("scores flawed gems at double value during a resolved step", () => {
    const s = {
      ...state([
        "R3 R0 R0 J0 B0 S0 M0 R0",
        "C0 J0 B0 S0 M0 R0 A0 C0",
        "B0 S0 M0 R0 A0 C0 J0 B0",
        "M0 R0 A0 C0 J0 B0 S0 M0",
        "A0 C0 J0 B0 S0 M0 R0 A0",
        "J0 B0 S0 M0 R0 A0 C0 J0",
        "S0 M0 R0 A0 C0 J0 B0 S0",
        "R0 A0 C0 J0 B0 S0 M0 R0",
      ]),
      phase: "resolving" as const,
      chainStep: 1,
    };

    const result = __facetTest.resolveStep(s);

    expect(result.cleared).toBe(true);
    expect(result.state.lastCleared).toBe(3);
    expect(result.state.lastPoints).toBe(40);
    expect(result.state.score).toBe(40);
  });
});
