"use client";

import { useEffect, useRef, useState } from "react";

/**
 * 1-bit dithered desert wallpaper.
 * Renders a dune field + sun as an ordered (Bayer 8×8) dither into a mask.
 * The mask is painted with `--accent`, so changing doors recolours the
 * wallpaper with a CSS transition instead of re-rendering.
 */

const BAYER8 = [
  0, 32, 8, 40, 2, 34, 10, 42, 48, 16, 56, 24, 50, 18, 58, 26, 12, 44, 4, 36, 14, 46, 6, 38, 60, 28,
  52, 20, 62, 30, 54, 22, 3, 35, 11, 43, 1, 33, 9, 41, 51, 19, 59, 27, 49, 17, 57, 25, 15, 47, 7,
  39, 13, 45, 5, 37, 63, 31, 55, 23, 61, 29, 53, 21,
];

const CELL = 3; // CSS px per dither cell

type Dune = { base: number; amp: number; freq: number; phase: number; light: number };

const DUNES: Dune[] = [
  { base: 0.56, amp: 0.035, freq: 0.9, phase: 0.1, light: 0.1 },
  { base: 0.66, amp: 0.05, freq: 0.7, phase: 0.55, light: 0.16 },
  { base: 0.78, amp: 0.055, freq: 0.55, phase: 0.2, light: 0.23 },
  { base: 0.9, amp: 0.06, freq: 0.45, phase: 0.8, light: 0.3 },
];

function ridge(d: Dune, u: number) {
  const t = Math.PI * 2;
  return (
    d.base +
    d.amp * Math.sin(t * (d.freq * u + d.phase)) +
    d.amp * 0.35 * Math.sin(t * (d.freq * 2.3 * u + d.phase * 1.7))
  );
}

/**
 * Computes the dither at cell resolution (one pixel per cell) with ImageData, then scales it up once
 * with smoothing off. Ridge heights only depend on the column, so they're computed once per column.
 * ~30x less work than painting each cell with fillRect, and PNG encoding runs async via toBlob.
 */
function render(width: number, height: number, dpr: number): Promise<Blob | null> {
  const cols = Math.ceil(width / CELL);
  const rows = Math.ceil(height / CELL);
  const small = document.createElement("canvas");
  small.width = cols;
  small.height = rows;
  const sctx = small.getContext("2d");
  if (!sctx) return Promise.resolve(null);
  const img = sctx.createImageData(cols, rows);
  const data = img.data;

  const minSide = Math.min(width, height);
  const sunX = width * 0.74;
  const sunY = height * 0.3;
  const sunR = minSide * 0.085;
  const halo = minSide * 0.05;
  const edge = 1.6 / rows;

  // per-column ridge height and light, per dune
  const ridgeY = DUNES.map(() => new Float32Array(cols));
  const ridgeLit = DUNES.map(() => new Float32Array(cols));
  for (let c = 0; c < cols; c++) {
    const u = c / cols;
    DUNES.forEach((dune, i) => {
      const yk = ridge(dune, u);
      ridgeY[i][c] = yk;
      ridgeLit[i][c] = ridge(dune, u + 0.002) - yk < 0 ? 0.12 : -0.05; // sun sits to the right
    });
  }

  for (let r = 0; r < rows; r++) {
    const v = r / rows;
    const y = r * CELL;
    const dy = y - sunY;
    for (let c = 0; c < cols; c++) {
      const x = c * CELL;
      // sky: sparse, thickening toward the horizon
      let I = 0.016 + 0.08 * v * v;
      // sun + halo
      const d = Math.sqrt((x - sunX) * (x - sunX) + dy * dy);
      if (d < sunR) I = 0.86;
      else I += 0.28 * Math.exp(-(d - sunR) / halo);
      // dunes, back to front
      for (let i = 0; i < DUNES.length; i++) {
        const yk = ridgeY[i][c];
        if (v >= yk) {
          I = DUNES[i].light + ridgeLit[i][c] + 0.1 * Math.min(1, (v - yk) / 0.12);
          if (v - yk < edge) I = 0.97;
        }
      }
      if (I > (BAYER8[(r & 7) * 8 + (c & 7)] + 0.5) / 64) data[(r * cols + c) * 4 + 3] = 255;
    }
  }
  sctx.putImageData(img, 0, 0);

  const px = CELL * dpr;
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(cols * px);
  canvas.height = Math.round(rows * px);
  const ctx = canvas.getContext("2d");
  if (!ctx) return Promise.resolve(null);
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(small, 0, 0, canvas.width, canvas.height);
  return new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
}

/** Run after the page is interactive, so the wallpaper never competes with hydration. */
function whenIdle(fn: () => void) {
  const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number };
  if (w.requestIdleCallback) w.requestIdleCallback(fn, { timeout: 600 });
  else window.setTimeout(fn, 1);
}

export function Wallpaper() {
  const [mask, setMask] = useState<string>("");
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => {
    let last = { w: 0, h: 0 };
    let url = "";
    let alive = true;
    const draw = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      last = { w: window.innerWidth, h: window.innerHeight };
      render(last.w, last.h, dpr).then((blob) => {
        if (!alive || !blob) return;
        const next = URL.createObjectURL(blob);
        if (url) URL.revokeObjectURL(url);
        url = next;
        setMask(next);
      });
    };
    whenIdle(draw);
    const onResize = () => {
      // ignore mobile URL-bar show/hide jitter
      if (window.innerWidth === last.w && Math.abs(window.innerHeight - last.h) < 160) return;
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(draw, 200);
    };
    window.addEventListener("resize", onResize);
    return () => {
      alive = false;
      window.removeEventListener("resize", onResize);
      window.clearTimeout(timer.current);
      if (url) URL.revokeObjectURL(url);
    };
  }, []);

  return (
    <div className="wallpaper" aria-hidden="true">
      <div
        className="wallpaper-ink"
        data-ready={mask ? "true" : "false"}
        style={
          mask
            ? { WebkitMaskImage: `url(${mask})`, maskImage: `url(${mask})` }
            : undefined
        }
      />
    </div>
  );
}
