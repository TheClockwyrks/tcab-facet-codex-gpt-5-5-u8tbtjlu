import { createCanvas } from "@napi-rs/canvas";
import { Buffer } from "node:buffer";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { URL } from "node:url";

const root = new URL("..", import.meta.url).pathname;
const out = (...parts) => join(root, "public", "assets", ...parts);
const kinds = [
  ["ruby", "#e7355f", "#ff9bb0", "kite"],
  ["amber", "#f08b28", "#ffd08a", "hex"],
  ["citrine", "#f2db47", "#fff5a0", "oval"],
  ["jade", "#35b76f", "#a6f0bd", "shield"],
  ["beryl", "#48d4c7", "#b7fff4", "drop"],
  ["sapphire", "#3f73ff", "#b2c8ff", "oct"],
  ["amethyst", "#a75cff", "#e4baff", "diamond"],
];

function ensure(path) {
  mkdirSync(dirname(path), { recursive: true });
}

function save(canvas, path) {
  ensure(path);
  writeFileSync(path, canvas.toBuffer("image/png"));
}

function poly(ctx, pts) {
  ctx.beginPath();
  ctx.moveTo(pts[0][0], pts[0][1]);
  for (const [x, y] of pts.slice(1)) ctx.lineTo(x, y);
  ctx.closePath();
}

function shape(form, inset = 0) {
  const r = 28 - inset;
  if (form === "kite")
    return [
      [32, 4 + inset],
      [54 - inset, 28],
      [40, 58 - inset],
      [24, 58 - inset],
      [10 + inset, 28],
    ];
  if (form === "hex")
    return [
      [20, 7 + inset],
      [44, 7 + inset],
      [58 - inset, 32],
      [44, 57 - inset],
      [20, 57 - inset],
      [6 + inset, 32],
    ];
  if (form === "oval") {
    const pts = [];
    for (let i = 0; i < 20; i++) {
      const a = (Math.PI * 2 * i) / 20;
      pts.push([32 + Math.cos(a) * r * 0.86, 32 + Math.sin(a) * r]);
    }
    return pts;
  }
  if (form === "shield")
    return [
      [32, 5 + inset],
      [55 - inset, 17],
      [50, 44],
      [32, 59 - inset],
      [14, 44],
      [9 + inset, 17],
    ];
  if (form === "drop") {
    const pts = [[32, 4 + inset]];
    for (let i = 0; i < 17; i++) {
      const a = 0.15 + Math.PI * 1.7 * (i / 16);
      pts.push([32 + Math.cos(a) * r * 0.82, 35 + Math.sin(a) * r * 0.82]);
    }
    return pts;
  }
  if (form === "oct")
    return [
      [24, 6 + inset],
      [40, 6 + inset],
      [57 - inset, 24],
      [57 - inset, 40],
      [40, 58 - inset],
      [24, 58 - inset],
      [7 + inset, 40],
      [7 + inset, 24],
    ];
  return [
    [32, 4 + inset],
    [58 - inset, 32],
    [32, 60 - inset],
    [6 + inset, 32],
  ];
}

function drawGem(kindName, base, hi, form, strain, cut = "plain") {
  const c = createCanvas(64, 64);
  const ctx = c.getContext("2d");
  ctx.imageSmoothingEnabled = false;
  const g = ctx.createRadialGradient(24, 18, 4, 33, 34, 31);
  g.addColorStop(0, hi);
  g.addColorStop(0.45, base);
  g.addColorStop(1, "#10152a");
  poly(ctx, shape(form));
  ctx.fillStyle = g;
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = "#f6fbffcc";
  ctx.stroke();
  ctx.globalAlpha = 0.7;
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 1;
  for (const p of shape(form, 8)) {
    ctx.beginPath();
    ctx.moveTo(32, 32);
    ctx.lineTo(p[0], p[1]);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  ctx.fillStyle = "#ffffffcc";
  poly(ctx, [
    [25, 13],
    [35, 10],
    [41, 20],
    [31, 24],
  ]);
  ctx.fill();
  if (strain > 0) {
    ctx.strokeStyle = strain === 3 ? "#1b0612" : "#35151f";
    ctx.lineWidth = strain === 3 ? 3 : 2;
    ctx.beginPath();
    ctx.moveTo(22, 15);
    ctx.lineTo(30, 27);
    ctx.lineTo(26, 38);
    if (strain > 1) {
      ctx.moveTo(30, 27);
      ctx.lineTo(45, 24);
      ctx.lineTo(50, 36);
    }
    if (strain > 2) {
      ctx.moveTo(26, 38);
      ctx.lineTo(38, 52);
      ctx.moveTo(18, 31);
      ctx.lineTo(45, 44);
    }
    ctx.stroke();
  }
  if (cut === "brilliant") {
    ctx.strokeStyle = "#fffff0";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(32, 32, 18, 0, Math.PI * 2);
    ctx.stroke();
    for (let i = 0; i < 8; i++) {
      const a = (Math.PI * 2 * i) / 8;
      ctx.beginPath();
      ctx.moveTo(32 + Math.cos(a) * 12, 32 + Math.sin(a) * 12);
      ctx.lineTo(32 + Math.cos(a) * 27, 32 + Math.sin(a) * 27);
      ctx.stroke();
    }
  }
  if (cut === "star") {
    ctx.fillStyle = "#fff9c9";
    poly(ctx, [
      [32, 7],
      [37, 27],
      [57, 32],
      [37, 37],
      [32, 57],
      [27, 37],
      [7, 32],
      [27, 27],
    ]);
    ctx.fill();
  }
  return c;
}

function drawPrism(strain, frame = 0) {
  const c = createCanvas(64, 64);
  const ctx = c.getContext("2d");
  const pts = shape("diamond", 2);
  const hues = ["#ff4b6e", "#ffd747", "#4eff9e", "#56d7ff", "#a974ff"];
  poly(ctx, pts);
  const g = ctx.createLinearGradient(8 + frame * 3, 8, 58 - frame * 2, 58);
  hues.forEach((h, i) => g.addColorStop(i / (hues.length - 1), h));
  ctx.fillStyle = g;
  ctx.fill();
  ctx.strokeStyle = "#ffffffdd";
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.strokeStyle = "#ffffffaa";
  for (let i = 0; i < 5; i++) {
    ctx.beginPath();
    ctx.moveTo(32, 7);
    ctx.lineTo(12 + i * 10, 54);
    ctx.stroke();
  }
  if (strain) {
    ctx.strokeStyle = strain === 3 ? "#111" : "#46364e";
    ctx.lineWidth = 1 + strain;
    ctx.beginPath();
    ctx.moveTo(20, 18);
    ctx.lineTo(34, 32);
    ctx.lineTo(27, 48);
    if (strain > 1) ctx.lineTo(46, 42);
    ctx.stroke();
  }
  return c;
}

for (const [name, base, hi, form] of kinds) {
  for (let strain = 0; strain <= 3; strain++) {
    save(
      drawGem(name, base, hi, form, strain),
      out("gems", `${name}-${strain}.png`),
    );
  }
  for (let f = 0; f < 8; f++) {
    const c = createCanvas(64, 64);
    const ctx = c.getContext("2d");
    ctx.translate(32, 32);
    ctx.rotate(((f - 3) * Math.PI) / 32);
    ctx.translate(-32, -32);
    ctx.globalAlpha = 1 - f * 0.08;
    ctx.drawImage(drawGem(name, base, hi, form, 3), 0, 0);
    ctx.fillStyle = `${hi}${Math.max(20, 90 - f * 8).toString(16)}`;
    for (let i = 0; i < 8 + f; i++) {
      ctx.fillRect(
        30 + Math.cos(i) * (8 + f * 3),
        30 + Math.sin(i * 2) * (8 + f * 3),
        3,
        3,
      );
    }
    save(c, out("gems", "break", name, `${String(f).padStart(2, "0")}.png`));
  }
}

save(
  drawGem("overlay", "#e9f7ff", "#ffffff", "oct", 0, "brilliant"),
  out("gems", "brilliant.png"),
);
save(
  drawGem("overlay", "#fff2aa", "#ffffff", "diamond", 0, "star"),
  out("gems", "star.png"),
);
for (let strain = 0; strain <= 3; strain++)
  save(drawPrism(strain), out("gems", `prism-${strain}.png`));
for (let f = 0; f < 10; f++)
  save(
    drawPrism(0, f),
    out("gems", "prism-turn", `${String(f).padStart(2, "0")}.png`),
  );

{
  const c = createCanvas(660, 660);
  const ctx = c.getContext("2d");
  const g = ctx.createLinearGradient(0, 0, 660, 660);
  g.addColorStop(0, "#2f3550");
  g.addColorStop(1, "#121624");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 660, 660);
  ctx.strokeStyle = "#8d9bb8";
  ctx.lineWidth = 10;
  ctx.strokeRect(8, 8, 644, 644);
  ctx.strokeStyle = "#44506c";
  ctx.lineWidth = 2;
  for (let i = 0; i <= 8; i++) {
    const p = 42 + i * 72;
    ctx.beginPath();
    ctx.moveTo(42, p);
    ctx.lineTo(618, p);
    ctx.moveTo(p, 42);
    ctx.lineTo(p, 618);
    ctx.stroke();
  }
  save(c, out("gems", "board-frame.png"));
}

function system(name, loop, count, colorA, colorB, radial) {
  const data = {
    dimensions: 2,
    field: { width: 64, height: 64 },
    durationMs: loop ? 1200 : 500,
    fps: 60,
    loop,
    forces: { drag: 1.8, radial, gravity: -18 },
    emitters: [
      {
        name: "spark",
        shape: "disc",
        position: [32, 32, 0],
        extent: { radius: loop ? 20 : 6, size: [0, 0, 0] },
        emission: loop
          ? { mode: "rate", rate: count }
          : { mode: "burst", count, atMs: 0 },
        lifetimeMs: loop ? 700 : 420,
        lifetimeSpread: 120,
        speed: loop ? 10 : 48,
        speedSpread: loop ? 8 : 22,
        direction: [0, 1, 0],
        coneAngle: 360,
        particle: {
          sizeCurve: { interp: "ease-out", from: loop ? 0.35 : 0.9, to: 0 },
          opacityCurve: { interp: "ease-out", from: loop ? 0.45 : 0.9, to: 0 },
          colorGradient: [
            { color: colorA, at: 0 },
            { color: colorB, at: 1 },
          ],
          stretch: loop ? 1.2 : 2.5,
        },
      },
    ],
  };
  ensure(out("fx", `${name}.json`));
  writeFileSync(
    out("fx", `${name}.json`),
    `${JSON.stringify(data, null, 2)}\n`,
  );
}
system("clear-burst", false, 26, "#ffffff", "#5de7ff", 28);
system("flawed-detonation", false, 58, "#ffecb8", "#ff3d6e", 55);
system("cut-flash", false, 42, "#fffbe3", "#c084ff", 36);
system("cut-aura", true, 16, "#cfffff", "#ffe58a", 5);

function wav(path, notes, seconds = 0.35) {
  const rate = 44100;
  const n = Math.floor(rate * seconds);
  const buf = Buffer.alloc(44 + n * 2);
  buf.write("RIFF", 0);
  buf.writeUInt32LE(36 + n * 2, 4);
  buf.write("WAVEfmt ", 8);
  buf.writeUInt32LE(16, 16);
  buf.writeUInt16LE(1, 20);
  buf.writeUInt16LE(1, 22);
  buf.writeUInt32LE(rate, 24);
  buf.writeUInt32LE(rate * 2, 28);
  buf.writeUInt16LE(2, 32);
  buf.writeUInt16LE(16, 34);
  buf.write("data", 36);
  buf.writeUInt32LE(n * 2, 40);
  for (let i = 0; i < n; i++) {
    const t = i / rate;
    const env = Math.min(1, t * 80) * Math.exp(-t * 5.5);
    let s = 0;
    for (const [freq, start, dur, gain] of notes) {
      if (t >= start && t <= start + dur) {
        const lt = t - start;
        s += Math.sin(lt * freq * Math.PI * 2) * Math.exp(-lt * 7) * gain;
        s +=
          Math.sin(lt * freq * 2.01 * Math.PI * 2) *
          Math.exp(-lt * 11) *
          gain *
          0.35;
      }
    }
    const sample = Math.max(-1, Math.min(1, s * env));
    buf.writeInt16LE(Math.round(sample * 28000), 44 + i * 2);
  }
  ensure(out("audio", path));
  writeFileSync(out("audio", path), buf);
}

const cues = {
  select: [[880, 0, 0.08, 0.25]],
  swap: [
    [440, 0, 0.08, 0.22],
    [660, 0.04, 0.1, 0.2],
  ],
  refuse: [[120, 0, 0.12, 0.35]],
  land: [[150, 0, 0.2, 0.5]],
  flaw: [
    [260, 0, 0.08, 0.35],
    [90, 0.03, 0.18, 0.25],
  ],
  cut: [
    [1200, 0, 0.16, 0.22],
    [1800, 0.03, 0.12, 0.18],
  ],
  levelup: [
    [523, 0, 0.16, 0.22],
    [659, 0.11, 0.16, 0.22],
    [784, 0.22, 0.2, 0.25],
  ],
  gameover: [
    [392, 0, 0.2, 0.25],
    [294, 0.17, 0.24, 0.25],
    [196, 0.33, 0.3, 0.28],
  ],
  shatter: [
    [700, 0, 0.04, 0.3],
    [250, 0.03, 0.18, 0.4],
    [1300, 0.05, 0.08, 0.13],
  ],
};
for (const [name, notes] of Object.entries(cues))
  wav(`${name}.wav`, notes, name === "gameover" ? 0.8 : 0.45);
for (let i = 1; i <= 8; i++)
  wav(`chain-${i}.wav`, [[330 * 2 ** ((i - 1) / 12), 0, 0.16, 0.22]], 0.28);
wav("clear.wav", cues.shatter, 0.38);

function musicWav(path, base) {
  const notes = [];
  for (let i = 0; i < 32; i++) {
    notes.push([base * [1, 1.25, 1.5, 2][i % 4], i * 0.22, 0.2, 0.12]);
    if (i % 4 === 0) notes.push([base / 2, i * 0.22, 0.7, 0.08]);
  }
  wav(path, notes, 7.5);
}
musicWav("title-theme.wav", 523.25);
musicWav("play-bed.wav", 329.63);
writeFileSync(
  out("audio", "title-theme.mid"),
  Buffer.from("TVRoZAAAAAYAAQABAGBNVHJrAAAABAD/LwA=", "base64"),
);
writeFileSync(
  out("audio", "play-bed.mid"),
  Buffer.from("TVRoZAAAAAYAAQABAGBNVHJrAAAABAD/LwA=", "base64"),
);
