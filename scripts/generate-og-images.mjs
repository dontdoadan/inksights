import { mkdirSync, writeFileSync } from "node:fs";
import { deflateSync } from "node:zlib";

const WIDTH = 1200;
const HEIGHT = 630;
const font = {
  A:["01110","10001","10001","11111","10001","10001","10001"],
  B:["11110","10001","10001","11110","10001","10001","11110"],
  C:["01111","10000","10000","10000","10000","10000","01111"],
  D:["11110","10001","10001","10001","10001","10001","11110"],
  E:["11111","10000","10000","11110","10000","10000","11111"],
  F:["11111","10000","10000","11110","10000","10000","10000"],
  G:["01111","10000","10000","10111","10001","10001","01111"],
  H:["10001","10001","10001","11111","10001","10001","10001"],
  I:["11111","00100","00100","00100","00100","00100","11111"],
  J:["00111","00010","00010","00010","10010","10010","01100"],
  K:["10001","10010","10100","11000","10100","10010","10001"],
  L:["10000","10000","10000","10000","10000","10000","11111"],
  M:["10001","11011","10101","10101","10001","10001","10001"],
  N:["10001","11001","10101","10011","10001","10001","10001"],
  O:["01110","10001","10001","10001","10001","10001","01110"],
  P:["11110","10001","10001","11110","10000","10000","10000"],
  Q:["01110","10001","10001","10001","10101","10010","01101"],
  R:["11110","10001","10001","11110","10100","10010","10001"],
  S:["01111","10000","10000","01110","00001","00001","11110"],
  T:["11111","00100","00100","00100","00100","00100","00100"],
  U:["10001","10001","10001","10001","10001","10001","01110"],
  V:["10001","10001","10001","10001","10001","01010","00100"],
  W:["10001","10001","10001","10101","10101","10101","01010"],
  X:["10001","10001","01010","00100","01010","10001","10001"],
  Y:["10001","10001","01010","00100","00100","00100","00100"],
  Z:["11111","00001","00010","00100","01000","10000","11111"],
  0:["01110","10001","10011","10101","11001","10001","01110"],
  1:["00100","01100","00100","00100","00100","00100","01110"],
  2:["01110","10001","00001","00010","00100","01000","11111"],
  3:["11110","00001","00001","01110","00001","00001","11110"],
  4:["00010","00110","01010","10010","11111","00010","00010"],
  5:["11111","10000","10000","11110","00001","00001","11110"],
  6:["01110","10000","10000","11110","10001","10001","01110"],
  7:["11111","00001","00010","00100","01000","01000","01000"],
  8:["01110","10001","10001","01110","10001","10001","01110"],
  9:["01110","10001","10001","01111","00001","00001","01110"],
  "-":["00000","00000","00000","11111","00000","00000","00000"],
  " ":["00000","00000","00000","00000","00000","00000","00000"],
};

const palette = {
  deep: [7, 20, 31, 255],
  ink: [12, 35, 48, 255],
  raised: [20, 54, 67, 255],
  mint: [101, 245, 195, 255],
  mintSoft: [166, 255, 224, 255],
  ice: [244, 252, 255, 255],
  muted: [147, 169, 179, 255],
};

function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit += 1) crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const typeBuffer = Buffer.from(type);
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuffer, data])));
  return Buffer.concat([length, typeBuffer, data, crc]);
}

function canvas() {
  return Buffer.alloc(WIDTH * HEIGHT * 4);
}

function pixel(buffer, x, y, colour) {
  if (x < 0 || y < 0 || x >= WIDTH || y >= HEIGHT) return;
  const index = (Math.floor(y) * WIDTH + Math.floor(x)) * 4;
  buffer[index] = colour[0];
  buffer[index + 1] = colour[1];
  buffer[index + 2] = colour[2];
  buffer[index + 3] = colour[3];
}

function rect(buffer, x, y, width, height, colour) {
  const x0 = Math.max(0, Math.floor(x));
  const y0 = Math.max(0, Math.floor(y));
  const x1 = Math.min(WIDTH, Math.ceil(x + width));
  const y1 = Math.min(HEIGHT, Math.ceil(y + height));
  for (let py = y0; py < y1; py += 1) {
    for (let px = x0; px < x1; px += 1) pixel(buffer, px, py, colour);
  }
}

function circle(buffer, cx, cy, radius, colour) {
  const r2 = radius * radius;
  for (let y = Math.max(0, cy - radius); y < Math.min(HEIGHT, cy + radius); y += 1) {
    for (let x = Math.max(0, cx - radius); x < Math.min(WIDTH, cx + radius); x += 1) {
      const dx = x - cx;
      const dy = y - cy;
      if (dx * dx + dy * dy <= r2) pixel(buffer, x, y, colour);
    }
  }
}

function line(buffer, x0, y0, x1, y1, thickness, colour) {
  const steps = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0));
  for (let i = 0; i <= steps; i += 1) {
    const ratio = steps === 0 ? 0 : i / steps;
    circle(buffer, Math.round(x0 + (x1 - x0) * ratio), Math.round(y0 + (y1 - y0) * ratio), thickness, colour);
  }
}

function drawText(buffer, text, x, y, scale, colour, tracking = 2) {
  let cursor = x;
  for (const raw of text.toUpperCase()) {
    const glyph = font[raw] || font[" "];
    glyph.forEach((row, rowIndex) => {
      [...row].forEach((value, columnIndex) => {
        if (value === "1") rect(buffer, cursor + columnIndex * scale, y + rowIndex * scale, scale, scale, colour);
      });
    });
    cursor += 5 * scale + tracking * scale;
  }
  return cursor;
}

function textWidth(text, scale, tracking = 2) {
  return text.length * (5 * scale + tracking * scale) - tracking * scale;
}

function drawWrappedTitle(buffer, lines, yStart, colour = palette.ice) {
  let y = yStart;
  for (const text of lines) {
    let scale = 13;
    while (textWidth(text, scale, 2) > 1010 && scale > 7) scale -= 1;
    drawText(buffer, text, 92, y, scale, colour, 2);
    y += scale * 9;
  }
}

function background(buffer, variant) {
  rect(buffer, 0, 0, WIDTH, HEIGHT, palette.deep);
  for (let x = 0; x < WIDTH; x += 56) rect(buffer, x, 0, 1, HEIGHT, [20, 54, 67, 120]);
  for (let y = 0; y < HEIGHT; y += 56) rect(buffer, 0, y, WIDTH, 1, [20, 54, 67, 120]);
  circle(buffer, 1065, 92, 195, [17, 72, 72, 255]);
  circle(buffer, 1065, 92, 132, [31, 130, 111, 255]);
  circle(buffer, 1065, 92, 72, palette.mint);
  circle(buffer, 1065, 92, 28, palette.deep);
  rect(buffer, 70, 55, 36, 36, palette.mint);
  circle(buffer, 88, 73, 7, palette.deep);
  drawText(buffer, "INKSIGHT", 128, 58, 5, palette.ice, 1);
  drawText(buffer, variant, 92, 510, 4, palette.mint, 1);
  rect(buffer, 92, 565, 1015, 2, palette.raised);
  drawText(buffer, "GETINKSIGHT CO UK", 92, 586, 3, palette.muted, 1);
}

function addPattern(buffer, kind) {
  if (kind === "growth") {
    for (let i = 0; i < 5; i += 1) {
      rect(buffer, 805 + i * 55, 350 - i * 42, 28, 135 + i * 42, i === 4 ? palette.mint : palette.raised);
    }
    line(buffer, 788, 445, 1055, 240, 5, palette.mintSoft);
  } else if (kind === "pain") {
    const points = [[840,425],[900,335],[960,390],[1020,275],[1080,345]];
    points.slice(0,-1).forEach((point,index) => line(buffer, point[0], point[1], points[index+1][0], points[index+1][1], 5, palette.mint));
    points.forEach((point,index) => circle(buffer, point[0], point[1], 14 + index * 2, index % 2 ? palette.mintSoft : palette.mint));
  } else if (kind === "cost") {
    for (let i = 0; i < 4; i += 1) {
      rect(buffer, 825, 245 + i * 68, 250 - i * 38, 38, i === 3 ? palette.mint : palette.raised);
      circle(buffer, 1085, 264 + i * 68, 16, i === 3 ? palette.mintSoft : palette.muted);
    }
  } else if (kind === "healing") {
    for (let i = 0; i < 5; i += 1) {
      circle(buffer, 835 + i * 62, 340, 24, i === 4 ? palette.mint : palette.raised);
      if (i < 4) line(buffer, 859 + i * 62, 340, 873 + i * 62, 340, 4, palette.muted);
    }
    line(buffer, 835, 420, 1083, 420, 5, palette.mint);
    line(buffer, 1083, 420, 1045, 390, 5, palette.mint);
    line(buffer, 1083, 420, 1045, 450, 5, palette.mint);
  }
}

function png(buffer) {
  const scanlines = Buffer.alloc((WIDTH * 4 + 1) * HEIGHT);
  for (let y = 0; y < HEIGHT; y += 1) {
    const offset = y * (WIDTH * 4 + 1);
    scanlines[offset] = 0;
    buffer.copy(scanlines, offset + 1, y * WIDTH * 4, (y + 1) * WIDTH * 4);
  }
  const header = Buffer.alloc(13);
  header.writeUInt32BE(WIDTH, 0);
  header.writeUInt32BE(HEIGHT, 4);
  header[8] = 8;
  header[9] = 6;
  return Buffer.concat([
    Buffer.from([137,80,78,71,13,10,26,10]),
    chunk("IHDR", header),
    chunk("IDAT", deflateSync(scanlines, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

const images = [
  { file: "inksight-growth-systems.png", label: "GROWTH SYSTEMS", lines: ["TURN VISIBILITY INTO", "BOOKED CLIENTS"], pattern: "growth" },
  { file: "tattoo-pain-reality-check.png", label: "CLIENT EDUCATION", lines: ["TATTOO PAIN CHART", "REALITY CHECK"], pattern: "pain" },
  { file: "full-sleeve-cost-uk.png", label: "UK PRICING GUIDE", lines: ["WHAT DOES A FULL", "SLEEVE COST"], pattern: "cost" },
  { file: "grey-line-healing.png", label: "HEALING GUIDE", lines: ["GREY LINE HEALING", "WEEK BY WEEK"], pattern: "healing" },
];

mkdirSync("public/og", { recursive: true });
for (const image of images) {
  const buffer = canvas();
  background(buffer, image.label);
  drawWrappedTitle(buffer, image.lines, 170);
  addPattern(buffer, image.pattern);
  writeFileSync(`public/og/${image.file}`, png(buffer));
}
console.log(`Generated ${images.length} Open Graph images.`);
