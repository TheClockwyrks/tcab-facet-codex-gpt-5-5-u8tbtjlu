# Facet

Facet is a browser puzzle game about matching cut gems under pressure. Swap
neighboring stones to make lines of three or more, then watch the board settle
into cascades. Clears strain nearby stones; a fully flawed gem breaks with any
clear touching it and scores double.

Longer and crossed matches create special cuts. A brilliant bursts around
itself, a star takes its row and column, and a prism swapped with a gem clears
that whole kind. Each chain step raises the multiplier, and each level asks for
a higher score target.

## Install

```sh
npm ci
```

## Run In Development

```sh
npm run dev
```

Vite serves the game locally and reloads while you work.

## Build

```sh
npm run build
```

The production build is written to `dist/` and is self-contained. All shipped
sprites, particle systems, sounds, and music are committed under
`public/assets/`; the build only bundles those files and does not invoke any
asset-generation tools.

## Checks

```sh
npm run typecheck
npm run lint
npm run format
npm test
```

## Controls

Use a mouse, pen, or touch: press a gem, drag or press onto an adjacent gem, and
release to request the swap. Carrying the held gem back to its original cell
cancels the offer.

Menus work with the pointer, `ArrowUp`, `ArrowDown`, `Enter`, and `Space`.
`Escape` or `P` pauses during play, `Escape` backs out of the rules and game
over screens, and `M` toggles mute.
