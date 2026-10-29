import * as THREE from 'three';

const TEX_W = 1024;
const TEX_H = 1420;

const FONT_DISPLAY = '"Space Grotesk", "Outfit", system-ui, -apple-system, sans-serif';
const FONT_SANS = '"Outfit", system-ui, -apple-system, sans-serif';
const FONT_MONO = '"JetBrains Mono", ui-monospace, monospace';

function roundRect(ctx, x, y, w, h, r) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = String(text || '').split(/\s+/);
  let line = '';
  let curY = y;
  for (let i = 0; i < words.length; i += 1) {
    const testLine = line ? `${line} ${words[i]}` : words[i];
    if (ctx.measureText(testLine).width > maxWidth && line) {
      ctx.fillText(line, x, curY);
      line = words[i];
      curY += lineHeight;
    } else {
      line = testLine;
    }
  }
  if (line) {
    ctx.fillText(line, x, curY);
    curY += lineHeight;
  }
  return curY;
}

function drawInnerPageBase(ctx, pageNum, sectionTag, side = 'left') {
  // Deep obsidian-indigo futuristic codex substrate
  const bg = ctx.createLinearGradient(0, 0, TEX_W, TEX_H);
  bg.addColorStop(0, '#090e21');
  bg.addColorStop(0.55, '#0c132b');
  bg.addColorStop(1, '#080c1c');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, TEX_W, TEX_H);

  // Subtle architectural grid
  ctx.save();
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.045)';
  ctx.lineWidth = 1;
  for (let gx = 64; gx < TEX_W; gx += 64) {
    ctx.beginPath();
    ctx.moveTo(gx, 0);
    ctx.lineTo(gx, TEX_H);
    ctx.stroke();
  }
  for (let gy = 64; gy < TEX_H; gy += 64) {
    ctx.beginPath();
    ctx.moveTo(0, gy);
    ctx.lineTo(TEX_W, gy);
    ctx.stroke();
  }
  ctx.restore();

  // Ambient neon corner aura
  const glow = ctx.createRadialGradient(
    side === 'left' ? 180 : TEX_W - 180,
    180,
    20,
    side === 'left' ? 180 : TEX_W - 180,
    180,
    540
  );
  glow.addColorStop(0, 'rgba(168, 85, 247, 0.16)');
  glow.addColorStop(0.5, 'rgba(34, 211, 238, 0.07)');
  glow.addColorStop(1, 'rgba(9, 14, 33, 0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, TEX_W, TEX_H);

  // Realistic spine gutter shadow on inner edge
  const gutterX = side === 'left' ? TEX_W - 95 : 0;
  const gutterGrad = ctx.createLinearGradient(
    side === 'left' ? TEX_W - 95 : 0,
    0,
    side === 'left' ? TEX_W : 95,
    0
  );
  if (side === 'left') {
    gutterGrad.addColorStop(0, 'rgba(0,0,0,0)');
    gutterGrad.addColorStop(1, 'rgba(2, 4, 12, 0.72)');
  } else {
    gutterGrad.addColorStop(0, 'rgba(2, 4, 12, 0.72)');
    gutterGrad.addColorStop(1, 'rgba(0,0,0,0)');
  }
  ctx.fillStyle = gutterGrad;
  ctx.fillRect(gutterX, 0, 95, TEX_H);

  // Framed hairline border
  const padX = 58;
  const padY = 54;
  roundRect(ctx, padX, padY, TEX_W - padX * 2, TEX_H - padY * 2, 22);
  const borderGrad = ctx.createLinearGradient(padX, padY, TEX_W - padX, TEX_H - padY);
  borderGrad.addColorStop(0, 'rgba(168, 85, 247, 0.42)');
  borderGrad.addColorStop(0.5, 'rgba(59, 130, 246, 0.25)');
  borderGrad.addColorStop(1, 'rgba(34, 211, 238, 0.42)');
  ctx.strokeStyle = borderGrad;
  ctx.lineWidth = 2;
  ctx.stroke();

  // Top running header
  ctx.fillStyle = '#22d3ee';
  ctx.font = `600 20px ${FONT_MONO}`;
  ctx.textAlign = 'left';
  ctx.fillText(`PAGE ${String(pageNum).padStart(2, '0')} / 10`, 92, 108);

  ctx.fillStyle = 'rgba(203, 213, 225, 0.68)';
  ctx.font = `500 19px ${FONT_MONO}`;
  ctx.textAlign = 'right';
  ctx.fillText(`ERKINOV LOYIHASI // ${sectionTag}`, TEX_W - 92, 108);

  // Header divider line
  const divGrad = ctx.createLinearGradient(92, 128, TEX_W - 92, 128);
  divGrad.addColorStop(0, '#22d3ee');
  divGrad.addColorStop(0.5, 'rgba(168, 85, 247, 0.65)');
  divGrad.addColorStop(1, 'rgba(34, 211, 238, 0.12)');
  ctx.strokeStyle = divGrad;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(92, 128);
  ctx.lineTo(TEX_W - 92, 128);
  ctx.stroke();

  // Bottom footer hint
  ctx.fillStyle = 'rgba(148, 163, 184, 0.6)';
  ctx.font = `500 18px ${FONT_MONO}`;
  ctx.textAlign = 'left';
  ctx.fillText(
    side === 'left' ? 'DRAG PAGE RIGHT TO ADVANCE ➔' : '⬅ DRAG LEFT TO FLIP BACK',
    92,
    TEX_H - 82
  );
  ctx.textAlign = 'right';
  ctx.fillStyle = 'rgba(168, 85, 247, 0.85)';
  ctx.fillText(`0${pageNum}`.slice(-2), TEX_W - 92, TEX_H - 82);
  ctx.textAlign = 'left';
}

function drawCoverCorners(ctx, pad = 50) {
  const len = 48;
  ctx.strokeStyle = '#22d3ee';
  ctx.lineWidth = 3.5;

  // Top-left
  ctx.beginPath();
  ctx.moveTo(pad, pad + len);
  ctx.lineTo(pad, pad);
  ctx.lineTo(pad + len, pad);
  ctx.stroke();

  // Top-right
  ctx.beginPath();
  ctx.moveTo(TEX_W - pad - len, pad);
  ctx.lineTo(TEX_W - pad, pad);
  ctx.lineTo(TEX_W - pad, pad + len);
  ctx.stroke();

  // Bottom-left
  ctx.beginPath();
  ctx.moveTo(pad, TEX_H - pad - len);
  ctx.lineTo(pad, TEX_H - pad);
  ctx.lineTo(pad + len, TEX_H - pad);
  ctx.stroke();

  // Bottom-right
  ctx.beginPath();
  ctx.moveTo(TEX_W - pad - len, TEX_H - pad);
  ctx.lineTo(TEX_W - pad, TEX_H - pad);
  ctx.lineTo(TEX_W - pad, TEX_H - pad - len);
  ctx.stroke();
}

/**
 * Page 1 — Front Hardcover: ERKINOV BOBURJON / ERKINOV LOYIHASI
 */
function renderPage1Cover(ctx) {
  const bg = ctx.createLinearGradient(0, 0, TEX_W, TEX_H);
  bg.addColorStop(0, '#050814');
  bg.addColorStop(0.5, '#0b1026');
  bg.addColorStop(1, '#060816');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, TEX_W, TEX_H);

  // Subtle woven leather diagonal micro-lines
  ctx.save();
  ctx.strokeStyle = 'rgba(148, 163, 184, 0.028)';
  ctx.lineWidth = 1;
  for (let i = -TEX_H; i < TEX_W + TEX_H; i += 18) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i - TEX_H, TEX_H);
    ctx.stroke();
  }
  ctx.restore();

  // Right-side hardcover spine hinge groove (since spine is on right of closed cover!)
  const spineGrad = ctx.createLinearGradient(TEX_W - 86, 0, TEX_W, 0);
  spineGrad.addColorStop(0, 'rgba(34, 211, 238, 0.18)');
  spineGrad.addColorStop(0.22, 'rgba(2, 4, 12, 0.85)');
  spineGrad.addColorStop(0.55, 'rgba(30, 41, 82, 0.45)');
  spineGrad.addColorStop(1, 'rgba(3, 5, 14, 0.92)');
  ctx.fillStyle = spineGrad;
  ctx.fillRect(TEX_W - 86, 0, 86, TEX_H);

  // Glowing dual nebula behind emblem
  const radial = ctx.createRadialGradient(TEX_W * 0.47, 560, 30, TEX_W * 0.47, 560, 460);
  radial.addColorStop(0, 'rgba(168, 85, 247, 0.34)');
  radial.addColorStop(0.45, 'rgba(59, 130, 246, 0.16)');
  radial.addColorStop(0.75, 'rgba(34, 211, 238, 0.08)');
  radial.addColorStop(1, 'rgba(5, 8, 20, 0)');
  ctx.fillStyle = radial;
  ctx.fillRect(0, 0, TEX_W, TEX_H);

  // Outer foil frame (inset from right spine groove)
  roundRect(ctx, 52, 52, TEX_W - 148, TEX_H - 104, 26);
  const foil = ctx.createLinearGradient(52, 52, TEX_W - 96, TEX_H - 52);
  foil.addColorStop(0, '#a855f7');
  foil.addColorStop(0.5, '#3b82f6');
  foil.addColorStop(1, '#22d3ee');
  ctx.strokeStyle = foil;
  ctx.lineWidth = 3;
  ctx.stroke();

  roundRect(ctx, 70, 70, TEX_W - 184, TEX_H - 140, 18);
  ctx.strokeStyle = 'rgba(34, 211, 238, 0.24)';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  drawCoverCorners(ctx, 40);

  const centerX = (52 + (TEX_W - 96)) / 2;

  // Brand pill at top
  roundRect(ctx, centerX - 205, 138, 410, 54, 27);
  ctx.fillStyle = 'rgba(168, 85, 247, 0.16)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(34, 211, 238, 0.65)';
  ctx.lineWidth = 1.8;
  ctx.stroke();

  ctx.textAlign = 'center';
  ctx.fillStyle = '#22d3ee';
  ctx.font = `700 22px ${FONT_MONO}`;
  ctx.fillText('✦  ERKINOV LOYIHASI  ✦', centerX, 173);

  // Geometric futuristic crest
  ctx.save();
  ctx.translate(centerX, 420);
  for (let ring = 0; ring < 3; ring += 1) {
    ctx.beginPath();
    ctx.arc(0, 0, 118 - ring * 26, 0, Math.PI * 2);
    ctx.strokeStyle =
      ring === 0
        ? 'rgba(34, 211, 238, 0.65)'
        : ring === 1
        ? 'rgba(168, 85, 247, 0.55)'
        : 'rgba(59, 130, 246, 0.45)';
    ctx.lineWidth = ring === 0 ? 2.5 : 1.6;
    ctx.stroke();
  }
  // Diamond core
  ctx.rotate(Math.PI / 4);
  roundRect(ctx, -46, -46, 92, 92, 12);
  ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
  ctx.fill();
  ctx.strokeStyle = '#a855f7';
  ctx.lineWidth = 2.5;
  ctx.stroke();
  ctx.rotate(-Math.PI / 4);

  ctx.fillStyle = '#f8fafc';
  ctx.font = `800 44px ${FONT_DISPLAY}`;
  ctx.fillText('EB', 0, 16);
  ctx.restore();

  // Main Name Typography
  ctx.textAlign = 'center';
  ctx.fillStyle = '#94a3b8';
  ctx.font = `600 22px ${FONT_MONO}`;
  ctx.fillText('INTERACTIVE 3D PORTFOLIO CODEX', centerX, 625);

  ctx.fillStyle = '#f8fafc';
  ctx.font = `800 76px ${FONT_DISPLAY}`;
  ctx.fillText('ERKINOV', centerX, 725);

  const nameGrad = ctx.createLinearGradient(centerX - 260, 750, centerX + 260, 825);
  nameGrad.addColorStop(0, '#c084fc');
  nameGrad.addColorStop(0.5, '#60a5fa');
  nameGrad.addColorStop(1, '#22d3ee');
  ctx.fillStyle = nameGrad;
  ctx.font = `800 78px ${FONT_DISPLAY}`;
  ctx.fillText('BOBURJON', centerX, 818);

  // Subtitle disciplines
  ctx.fillStyle = '#cbd5e1';
  ctx.font = `500 25px ${FONT_SANS}`;
  ctx.fillText('Web Engineering  •  Three.js  •  Python & Telegram Bots', centerX, 895);

  // Interactive Drag-Right Callout Banner
  roundRect(ctx, centerX - 310, 1030, 620, 96, 22);
  const ctaGrad = ctx.createLinearGradient(centerX - 310, 1030, centerX + 310, 1126);
  ctaGrad.addColorStop(0, 'rgba(168, 85, 247, 0.28)');
  ctaGrad.addColorStop(0.5, 'rgba(59, 130, 246, 0.24)');
  ctaGrad.addColorStop(1, 'rgba(34, 211, 238, 0.32)');
  ctx.fillStyle = ctaGrad;
  ctx.fill();
  ctx.strokeStyle = '#22d3ee';
  ctx.lineWidth = 2.2;
  ctx.stroke();

  ctx.fillStyle = '#f8fafc';
  ctx.font = `700 25px ${FONT_DISPLAY}`;
  ctx.fillText('DRAG COVER RIGHT TO OPEN  ➔', centerX, 1074);
  ctx.fillStyle = '#67e8f9';
  ctx.font = `500 18px ${FONT_MONO}`;
  ctx.fillText('10 INTERACTIVE PAGES  •  MOUSE & TOUCH PHYSICS', centerX, 1106);

  // Bottom edition metadata
  ctx.fillStyle = 'rgba(148, 163, 184, 0.72)';
  ctx.font = `500 19px ${FONT_MONO}`;
  ctx.fillText('EDITION 01  //  PAGE 01 OF 10', centerX, 1280);
  ctx.textAlign = 'left';
}

/**
 * Page 2 — About Me
 */
function renderPage2About(ctx, data) {
  drawInnerPageBase(ctx, 2, 'PROFILE', 'left');

  ctx.fillStyle = '#c084fc';
  ctx.font = `600 21px ${FONT_MONO}`;
  ctx.fillText('01 // DEVELOPER IDENTITY', 92, 195);

  ctx.fillStyle = '#f8fafc';
  ctx.font = `800 58px ${FONT_DISPLAY}`;
  ctx.fillText('About Me', 92, 265);

  ctx.fillStyle = '#22d3ee';
  ctx.font = `600 26px ${FONT_SANS}`;
  ctx.fillText(data.about.headline, 92, 322);

  ctx.fillStyle = '#dbeafe';
  ctx.font = `400 25px ${FONT_SANS}`;
  let curY = 382;
  data.about.paragraphs.forEach((p) => {
    curY = wrapText(ctx, p, 92, curY, TEX_W - 196, 38) + 22;
  });

  // 4 Focus Pillar Cards (2x2 grid)
  const cardW = (TEX_W - 210) / 2;
  const cardH = 225;
  const startY = Math.max(curY + 18, 690);

  data.about.pillars.forEach((pillar, idx) => {
    const col = idx % 2;
    const row = Math.floor(idx / 2);
    const x = 92 + col * (cardW + 26);
    const y = startY + row * (cardH + 24);

    roundRect(ctx, x, y, cardW, cardH, 18);
    ctx.fillStyle = 'rgba(15, 23, 48, 0.85)';
    ctx.fill();
    ctx.strokeStyle = idx % 2 === 0 ? 'rgba(34, 211, 238, 0.42)' : 'rgba(168, 85, 247, 0.45)';
    ctx.lineWidth = 1.6;
    ctx.stroke();

    ctx.fillStyle = idx % 2 === 0 ? '#22d3ee' : '#c084fc';
    ctx.font = `700 20px ${FONT_MONO}`;
    ctx.fillText(`PILLAR ${pillar.code}`, x + 24, y + 42);

    ctx.fillStyle = '#f8fafc';
    ctx.font = `700 26px ${FONT_DISPLAY}`;
    ctx.fillText(pillar.title, x + 24, y + 84);

    ctx.fillStyle = '#cbd5e1';
    ctx.font = `400 21px ${FONT_SANS}`;
    wrapText(ctx, pillar.desc, x + 24, y + 124, cardW - 48, 30);
  });
}

/**
 * Page 3 — Skills: HTML, CSS, JavaScript, React, Python, Three.js, Telegram Bots, Git/GitHub
 */
function renderPage3Skills(ctx, data) {
  drawInnerPageBase(ctx, 3, 'CAPABILITIES', 'right');

  ctx.fillStyle = '#22d3ee';
  ctx.font = `600 21px ${FONT_MONO}`;
  ctx.fillText('02 // CORE DISCIPLINES', 92, 195);

  ctx.fillStyle = '#f8fafc';
  ctx.font = `800 58px ${FONT_DISPLAY}`;
  ctx.fillText('Skills', 92, 265);

  ctx.fillStyle = '#cbd5e1';
  ctx.font = `400 24px ${FONT_SANS}`;
  ctx.fillText('Core frontend, 3D graphics, Python backend & bot engineering toolkit.', 92, 316);

  const listTop = 365;
  const rowH = 104;

  data.skills.forEach((skill, idx) => {
    const y = listTop + idx * (rowH + 12);
    roundRect(ctx, 92, y, TEX_W - 184, rowH, 16);
    ctx.fillStyle = 'rgba(15, 23, 48, 0.86)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(96, 165, 250, 0.32)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Index badge
    roundRect(ctx, 114, y + 22, 60, 60, 12);
    ctx.fillStyle = 'rgba(34, 211, 238, 0.14)';
    ctx.fill();
    ctx.strokeStyle = skill.accent || '#22d3ee';
    ctx.stroke();

    ctx.textAlign = 'center';
    ctx.fillStyle = skill.accent || '#22d3ee';
    ctx.font = `700 22px ${FONT_MONO}`;
    ctx.fillText(`0${idx + 1}`, 144, y + 60);
    ctx.textAlign = 'left';

    // Skill Name & Category
    ctx.fillStyle = '#f8fafc';
    ctx.font = `700 29px ${FONT_DISPLAY}`;
    ctx.fillText(skill.name, 196, y + 46);

    ctx.fillStyle = '#94a3b8';
    ctx.font = `500 19px ${FONT_MONO}`;
    ctx.fillText(skill.category, 196, y + 78);

    // Neon meter bar on right
    const barW = 250;
    const barX = TEX_W - 92 - barW - 26;
    const barY = y + 46;
    roundRect(ctx, barX, barY, barW, 14, 7);
    ctx.fillStyle = 'rgba(30, 41, 59, 0.95)';
    ctx.fill();

    const fillW = Math.round((barW * (skill.level || 88)) / 100);
    roundRect(ctx, barX, barY, fillW, 14, 7);
    const meterGrad = ctx.createLinearGradient(barX, barY, barX + fillW, barY);
    meterGrad.addColorStop(0, '#a855f7');
    meterGrad.addColorStop(1, '#22d3ee');
    ctx.fillStyle = meterGrad;
    ctx.fill();
  });
}

/**
 * Page 4 — My Journey
 */
function renderPage4Journey(ctx, data) {
  drawInnerPageBase(ctx, 4, 'PROGRESSION', 'left');

  ctx.fillStyle = '#c084fc';
  ctx.font = `600 21px ${FONT_MONO}`;
  ctx.fillText('03 // ENGINEERING EVOLUTION', 92, 195);

  ctx.fillStyle = '#f8fafc';
  ctx.font = `800 58px ${FONT_DISPLAY}`;
  ctx.fillText('My Journey', 92, 265);

  ctx.fillStyle = '#cbd5e1';
  ctx.font = `400 24px ${FONT_SANS}`;
  ctx.fillText('From web fundamentals to spatial 3D interfaces & production Telegram bots.', 92, 316);

  // Vertical timeline spine
  const lineX = 136;
  const startY = 390;
  const stepGap = 218;

  const lineGrad = ctx.createLinearGradient(lineX, startY, lineX, startY + stepGap * 3 + 80);
  lineGrad.addColorStop(0, '#22d3ee');
  lineGrad.addColorStop(0.5, '#3b82f6');
  lineGrad.addColorStop(1, '#a855f7');
  ctx.strokeStyle = lineGrad;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(lineX, startY);
  ctx.lineTo(lineX, startY + stepGap * 3 + 60);
  ctx.stroke();

  data.journey.forEach((item, idx) => {
    const y = startY + idx * stepGap;

    // Glowing node circle
    ctx.beginPath();
    ctx.arc(lineX, y + 36, 22, 0, Math.PI * 2);
    ctx.fillStyle = '#090e21';
    ctx.fill();
    ctx.strokeStyle = idx % 2 === 0 ? '#22d3ee' : '#c084fc';
    ctx.lineWidth = 3.5;
    ctx.stroke();

    ctx.textAlign = 'center';
    ctx.fillStyle = '#f8fafc';
    ctx.font = `700 17px ${FONT_MONO}`;
    ctx.fillText(item.step, lineX, y + 42);
    ctx.textAlign = 'left';

    // Card
    const cardX = 186;
    const cardW = TEX_W - cardX - 92;
    roundRect(ctx, cardX, y - 4, cardW, 188, 18);
    ctx.fillStyle = 'rgba(15, 23, 48, 0.86)';
    ctx.fill();
    ctx.strokeStyle = idx % 2 === 0 ? 'rgba(34, 211, 238, 0.38)' : 'rgba(168, 85, 247, 0.4)';
    ctx.lineWidth = 1.6;
    ctx.stroke();

    ctx.fillStyle = idx % 2 === 0 ? '#22d3ee' : '#c084fc';
    ctx.font = `600 19px ${FONT_MONO}`;
    ctx.fillText(item.focus, cardX + 26, y + 34);

    ctx.fillStyle = '#f8fafc';
    ctx.font = `700 30px ${FONT_DISPLAY}`;
    ctx.fillText(item.title, cardX + 26, y + 76);

    ctx.fillStyle = '#cbd5e1';
    ctx.font = `400 22px ${FONT_SANS}`;
    wrapText(ctx, item.detail, cardX + 26, y + 114, cardW - 52, 31);
  });
}

/**
 * Page 5 — MoneyFlow (with clickable live website CTA hotspot)
 */
function renderPage5MoneyFlow(ctx, project) {
  drawInnerPageBase(ctx, 5, 'PROJECT 01', 'right');

  // Status badge
  roundRect(ctx, 92, 165, 292, 42, 21);
  ctx.fillStyle = 'rgba(34, 211, 238, 0.16)';
  ctx.fill();
  ctx.strokeStyle = '#22d3ee';
  ctx.lineWidth = 1.6;
  ctx.stroke();
  ctx.fillStyle = '#67e8f9';
  ctx.font = `700 18px ${FONT_MONO}`;
  ctx.fillText('● LIVE TELEGRAM + WEB', 114, 192);

  ctx.fillStyle = '#f8fafc';
  ctx.font = `800 62px ${FONT_DISPLAY}`;
  ctx.fillText(project.title, 92, 278);

  ctx.fillStyle = '#c084fc';
  ctx.font = `600 27px ${FONT_SANS}`;
  ctx.fillText('Personal Finance Telegram Bot', 92, 324);

  // Description panel
  roundRect(ctx, 92, 358, TEX_W - 184, 220, 18);
  ctx.fillStyle = 'rgba(15, 23, 48, 0.85)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(59, 130, 246, 0.35)';
  ctx.lineWidth = 1.6;
  ctx.stroke();

  ctx.fillStyle = '#e2e8f0';
  ctx.font = `400 24px ${FONT_SANS}`;
  wrapText(ctx, project.description, 120, 408, TEX_W - 240, 36);

  // Key features
  ctx.fillStyle = '#22d3ee';
  ctx.font = `700 21px ${FONT_MONO}`;
  ctx.fillText('KEY CAPABILITIES', 92, 628);

  (project.features || []).slice(0, 4).forEach((feat, i) => {
    const fy = 656 + i * 74;
    roundRect(ctx, 92, fy, TEX_W - 184, 60, 14);
    ctx.fillStyle = 'rgba(17, 25, 54, 0.78)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(34, 211, 238, 0.25)';
    ctx.stroke();

    ctx.fillStyle = '#22d3ee';
    ctx.font = `700 22px ${FONT_MONO}`;
    ctx.fillText('▸', 116, fy + 38);

    ctx.fillStyle = '#f1f5f9';
    ctx.font = `500 22px ${FONT_SANS}`;
    ctx.fillText(feat, 148, fy + 38);
  });

  // Tech chips
  let chipX = 92;
  const chipY = 978;
  ctx.font = `600 18px ${FONT_MONO}`;
  (project.technologies || []).forEach((tech) => {
    const tw = ctx.measureText(tech).width + 34;
    if (chipX + tw > TEX_W - 92) return;
    roundRect(ctx, chipX, chipY, tw, 40, 20);
    ctx.fillStyle = 'rgba(168, 85, 247, 0.16)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(168, 85, 247, 0.45)';
    ctx.stroke();
    ctx.fillStyle = '#e9d5ff';
    ctx.fillText(tech, chipX + 17, chipY + 26);
    chipX += tw + 12;
  });

  // Prominent Live Website CTA Button (Hotspot)
  const btnX = 92;
  const btnY = 1068;
  const btnW = TEX_W - 184;
  const btnH = 112;
  roundRect(ctx, btnX, btnY, btnW, btnH, 20);
  const ctaGrad = ctx.createLinearGradient(btnX, btnY, btnX + btnW, btnY + btnH);
  ctaGrad.addColorStop(0, 'rgba(168, 85, 247, 0.4)');
  ctaGrad.addColorStop(0.5, 'rgba(59, 130, 246, 0.38)');
  ctaGrad.addColorStop(1, 'rgba(34, 211, 238, 0.42)');
  ctx.fillStyle = ctaGrad;
  ctx.fill();
  ctx.strokeStyle = '#22d3ee';
  ctx.lineWidth = 2.4;
  ctx.stroke();

  ctx.fillStyle = '#f8fafc';
  ctx.font = `700 26px ${FONT_DISPLAY}`;
  ctx.fillText('LAUNCH LIVE WEBSITE  ↗', btnX + 34, btnY + 48);

  ctx.fillStyle = '#67e8f9';
  ctx.font = `600 21px ${FONT_MONO}`;
  ctx.fillText('https://moneyflow-website.netlify.app', btnX + 34, btnY + 84);
}

/**
 * Page 6 — SHERDOOR AKFA
 */
function renderPage6Sherdoor(ctx, project) {
  drawInnerPageBase(ctx, 6, 'PROJECT 02', 'left');

  roundRect(ctx, 92, 165, 260, 42, 21);
  ctx.fillStyle = 'rgba(168, 85, 247, 0.18)';
  ctx.fill();
  ctx.strokeStyle = '#c084fc';
  ctx.lineWidth = 1.6;
  ctx.stroke();
  ctx.fillStyle = '#e9d5ff';
  ctx.font = `700 18px ${FONT_MONO}`;
  ctx.fillText('● PRODUCTION BOT SYSTEM', 114, 192);

  ctx.fillStyle = '#f8fafc';
  ctx.font = `800 58px ${FONT_DISPLAY}`;
  ctx.fillText(project.title, 92, 278);

  ctx.fillStyle = '#22d3ee';
  ctx.font = `600 27px ${FONT_SANS}`;
  ctx.fillText('Employee Attendance Telegram Bot', 92, 324);

  roundRect(ctx, 92, 358, TEX_W - 184, 225, 18);
  ctx.fillStyle = 'rgba(15, 23, 48, 0.85)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(168, 85, 247, 0.38)';
  ctx.lineWidth = 1.6;
  ctx.stroke();

  ctx.fillStyle = '#e2e8f0';
  ctx.font = `400 24px ${FONT_SANS}`;
  wrapText(ctx, project.description, 120, 408, TEX_W - 240, 36);

  ctx.fillStyle = '#c084fc';
  ctx.font = `700 21px ${FONT_MONO}`;
  ctx.fillText('OPERATIONAL WORKFLOWS', 92, 632);

  (project.features || []).slice(0, 4).forEach((feat, i) => {
    const fy = 660 + i * 74;
    roundRect(ctx, 92, fy, TEX_W - 184, 60, 14);
    ctx.fillStyle = 'rgba(17, 25, 54, 0.78)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(168, 85, 247, 0.28)';
    ctx.stroke();

    ctx.fillStyle = '#c084fc';
    ctx.font = `700 22px ${FONT_MONO}`;
    ctx.fillText('▸', 116, fy + 38);

    ctx.fillStyle = '#f1f5f9';
    ctx.font = `500 22px ${FONT_SANS}`;
    ctx.fillText(feat, 148, fy + 38);
  });

  // Architecture workflow strip
  roundRect(ctx, 92, 995, TEX_W - 184, 175, 20);
  ctx.fillStyle = 'rgba(12, 19, 44, 0.92)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(59, 130, 246, 0.42)';
  ctx.lineWidth = 1.8;
  ctx.stroke();

  ctx.fillStyle = '#60a5fa';
  ctx.font = `700 19px ${FONT_MONO}`;
  ctx.fillText('ATTENDANCE PIPELINE ARCHITECTURE', 120, 1036);

  ctx.fillStyle = '#f8fafc';
  ctx.font = `600 24px ${FONT_DISPLAY}`;
  ctx.fillText('Staff Telegram Check-In  ➔  Timestamp Validation  ➔  Supervisor Log', 120, 1084);

  let chipX = 120;
  const chipY = 1110;
  ctx.font = `600 18px ${FONT_MONO}`;
  (project.technologies || []).forEach((tech) => {
    const tw = ctx.measureText(tech).width + 34;
    roundRect(ctx, chipX, chipY, tw, 40, 20);
    ctx.fillStyle = 'rgba(34, 211, 238, 0.14)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(34, 211, 238, 0.45)';
    ctx.stroke();
    ctx.fillStyle = '#67e8f9';
    ctx.fillText(tech, chipX + 17, chipY + 26);
    chipX += tw + 14;
  });
}

/**
 * Page 7 — Technologies
 */
function renderPage7Technologies(ctx, data) {
  drawInnerPageBase(ctx, 7, 'ARCHITECTURE', 'right');

  ctx.fillStyle = '#22d3ee';
  ctx.font = `600 21px ${FONT_MONO}`;
  ctx.fillText('04 // FULL-STACK ECOSYSTEM', 92, 195);

  ctx.fillStyle = '#f8fafc';
  ctx.font = `800 58px ${FONT_DISPLAY}`;
  ctx.fillText('Technologies', 92, 265);

  ctx.fillStyle = '#cbd5e1';
  ctx.font = `400 24px ${FONT_SANS}`;
  ctx.fillText('Decoupled frontend, 3D WebGL engine, Python API & relational database.', 92, 316);

  let blockY = 366;
  data.technologies.forEach((tier) => {
    roundRect(ctx, 92, blockY, TEX_W - 184, 238, 20);
    ctx.fillStyle = 'rgba(15, 23, 48, 0.86)';
    ctx.fill();
    ctx.strokeStyle = tier.accent;
    ctx.lineWidth = 1.7;
    ctx.stroke();

    ctx.fillStyle = tier.accent;
    ctx.font = `700 22px ${FONT_MONO}`;
    ctx.fillText(`◆ ${tier.group.toUpperCase()}`, 122, blockY + 46);

    let cx = 122;
    let cy = blockY + 76;
    ctx.font = `600 22px ${FONT_SANS}`;

    tier.items.forEach((item) => {
      const w = ctx.measureText(item).width + 42;
      if (cx + w > TEX_W - 122) {
        cx = 122;
        cy += 62;
      }
      roundRect(ctx, cx, cy, w, 48, 12);
      ctx.fillStyle = 'rgba(30, 41, 75, 0.85)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.3)';
      ctx.lineWidth = 1.2;
      ctx.stroke();

      ctx.fillStyle = '#f8fafc';
      ctx.fillText(item, cx + 21, cy + 32);
      cx += w + 14;
    });

    blockY += 264;
  });

  // Decoupled deployment callout
  roundRect(ctx, 92, 1168, TEX_W - 184, 88, 16);
  ctx.fillStyle = 'rgba(34, 211, 238, 0.1)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(34, 211, 238, 0.4)';
  ctx.stroke();

  ctx.fillStyle = '#67e8f9';
  ctx.font = `600 20px ${FONT_MONO}`;
  ctx.fillText('NETLIFY STATIC CDN (VITE)  ⇄  FASTAPI REST  ⇄  POSTGRESQL + ALEMBIC', 118, 1220);
}

/**
 * Page 8 — Projects (STRICTLY MoneyFlow & SHERDOOR AKFA ONLY)
 */
function renderPage8Projects(ctx, projects) {
  drawInnerPageBase(ctx, 8, 'SELECTED WORKS', 'left');

  ctx.fillStyle = '#c084fc';
  ctx.font = `600 21px ${FONT_MONO}`;
  ctx.fillText('05 // VERIFIED PRODUCTION INDEX', 92, 195);

  ctx.fillStyle = '#f8fafc';
  ctx.font = `800 58px ${FONT_DISPLAY}`;
  ctx.fillText('Projects', 92, 265);

  ctx.fillStyle = '#cbd5e1';
  ctx.font = `400 24px ${FONT_SANS}`;
  ctx.fillText('Flagship Telegram automation & web platforms built under ERKINOV LOYIHASI.', 92, 316);

  const canonical = (projects || []).slice(0, 2);

  canonical.forEach((proj, idx) => {
    const cardY = 368 + idx * 432;
    const cardH = 398;
    const isMoneyFlow = proj.slug === 'moneyflow' || proj.title === 'MoneyFlow';

    roundRect(ctx, 92, cardY, TEX_W - 184, cardH, 22);
    const cardBg = ctx.createLinearGradient(92, cardY, TEX_W - 92, cardY + cardH);
    cardBg.addColorStop(0, 'rgba(15, 23, 52, 0.94)');
    cardBg.addColorStop(1, 'rgba(10, 16, 38, 0.94)');
    ctx.fillStyle = cardBg;
    ctx.fill();
    ctx.strokeStyle = isMoneyFlow ? '#22d3ee' : '#a855f7';
    ctx.lineWidth = 2.2;
    ctx.stroke();

    // Header row
    ctx.fillStyle = isMoneyFlow ? '#22d3ee' : '#c084fc';
    ctx.font = `700 20px ${FONT_MONO}`;
    ctx.fillText(`0${idx + 1} // ${proj.category.toUpperCase()}`, 126, cardY + 50);

    ctx.fillStyle = '#f8fafc';
    ctx.font = `800 44px ${FONT_DISPLAY}`;
    ctx.fillText(proj.title, 126, cardY + 110);

    ctx.fillStyle = '#93c5fd';
    ctx.font = `600 24px ${FONT_SANS}`;
    ctx.fillText(proj.subtitle, 126, cardY + 148);

    ctx.fillStyle = '#cbd5e1';
    ctx.font = `400 22px ${FONT_SANS}`;
    wrapText(ctx, proj.summary, 126, cardY + 194, TEX_W - 252, 33);

    // Bottom CTA row inside card
    roundRect(ctx, 126, cardY + 312, TEX_W - 252, 60, 14);
    ctx.fillStyle = isMoneyFlow ? 'rgba(34, 211, 238, 0.16)' : 'rgba(168, 85, 247, 0.16)';
    ctx.fill();
    ctx.strokeStyle = isMoneyFlow ? 'rgba(34, 211, 238, 0.55)' : 'rgba(168, 85, 247, 0.55)';
    ctx.stroke();

    ctx.fillStyle = '#f8fafc';
    ctx.font = `600 20px ${FONT_MONO}`;
    ctx.fillText(
      isMoneyFlow
        ? 'OPEN: moneyflow-website.netlify.app  ↗'
        : 'VIEW SYSTEM SPECS ON PAGE 06  ➔',
      152,
      cardY + 350
    );
  });
}

/**
 * Page 9 — Contact (Telegram, Instagram, Email/GitHub Placeholders + Live Contact Form Trigger)
 */
function renderPage9Contact(ctx, data) {
  drawInnerPageBase(ctx, 9, 'COMMUNICATION', 'right');

  ctx.fillStyle = '#22d3ee';
  ctx.font = `600 21px ${FONT_MONO}`;
  ctx.fillText('06 // DIRECT CHANNELS & POSTGRESQL DISPATCH', 92, 195);

  ctx.fillStyle = '#f8fafc';
  ctx.font = `800 58px ${FONT_DISPLAY}`;
  ctx.fillText('Contact', 92, 265);

  ctx.fillStyle = '#cbd5e1';
  ctx.font = `400 24px ${FONT_SANS}`;
  ctx.fillText('Connect on Telegram or Instagram, or send a verified message below.', 92, 316);

  const channels = [
    {
      label: 'TELEGRAM (VERIFIED)',
      value: '@Erkinov_1105  •  t.me/Erkinov_1105  ↗',
      accent: '#22d3ee',
    },
    {
      label: 'INSTAGRAM (VERIFIED)',
      value: '@Erkinov_neww  •  instagram.com/Erkinov_neww  ↗',
      accent: '#c084fc',
    },
    {
      label: 'EMAIL (PLACEHOLDER)',
      value: `${data.socials.emailPlaceholder}  [Placeholder]`,
      accent: '#60a5fa',
    },
    {
      label: 'GITHUB (PLACEHOLDER)',
      value: `${data.socials.githubPlaceholder.replace('https://', '')}  [Placeholder]`,
      accent: '#94a3b8',
    },
  ];

  channels.forEach((ch, idx) => {
    const y = 356 + idx * 108;
    roundRect(ctx, 92, y, TEX_W - 184, 92, 16);
    ctx.fillStyle = 'rgba(15, 23, 48, 0.88)';
    ctx.fill();
    ctx.strokeStyle = ch.accent;
    ctx.lineWidth = 1.6;
    ctx.stroke();

    ctx.fillStyle = ch.accent;
    ctx.font = `700 17px ${FONT_MONO}`;
    ctx.fillText(ch.label, 122, y + 34);

    ctx.fillStyle = '#f8fafc';
    ctx.font = `600 24px ${FONT_SANS}`;
    ctx.fillText(ch.value, 122, y + 70);
  });

  // Interactive Contact Form Card on Page 9
  const formY = 810;
  const formH = 440;
  roundRect(ctx, 92, formY, TEX_W - 184, formH, 22);
  const fGrad = ctx.createLinearGradient(92, formY, TEX_W - 92, formY + formH);
  fGrad.addColorStop(0, 'rgba(168, 85, 247, 0.24)');
  fGrad.addColorStop(0.5, 'rgba(30, 58, 138, 0.3)');
  fGrad.addColorStop(1, 'rgba(34, 211, 238, 0.25)');
  ctx.fillStyle = fGrad;
  ctx.fill();
  ctx.strokeStyle = '#22d3ee';
  ctx.lineWidth = 2.4;
  ctx.stroke();

  ctx.fillStyle = '#67e8f9';
  ctx.font = `700 19px ${FONT_MONO}`;
  ctx.fillText('● WORKING CONTACT FORM (FASTAPI + POSTGRESQL)', 126, formY + 48);

  ctx.fillStyle = '#f8fafc';
  ctx.font = `800 36px ${FONT_DISPLAY}`;
  ctx.fillText('Send a Direct Message', 126, formY + 102);

  ctx.fillStyle = '#dbeafe';
  ctx.font = `400 23px ${FONT_SANS}`;
  wrapText(
    ctx,
    'Every submission is validated by Pydantic and confirmed only after saving to PostgreSQL. Tap here or use the live Contact Form panel to type and send.',
    126,
    formY + 150,
    TEX_W - 252,
    34
  );

  // Simulated input preview bars + Launch CTA
  roundRect(ctx, 126, formY + 268, (TEX_W - 272) / 2, 54, 12);
  ctx.fillStyle = 'rgba(9, 14, 33, 0.85)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(148, 163, 184, 0.4)';
  ctx.stroke();
  ctx.fillStyle = '#94a3b8';
  ctx.font = `500 19px ${FONT_SANS}`;
  ctx.fillText('Your Name & Email...', 148, formY + 302);

  roundRect(ctx, 126 + (TEX_W - 272) / 2 + 20, formY + 268, (TEX_W - 272) / 2, 54, 12);
  ctx.fillStyle = 'rgba(9, 14, 33, 0.85)';
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#94a3b8';
  ctx.fillText('Your Message...', 148 + (TEX_W - 272) / 2 + 20, formY + 302);

  roundRect(ctx, 126, formY + 344, TEX_W - 252, 68, 16);
  const btnG = ctx.createLinearGradient(126, formY + 344, TEX_W - 126, formY + 412);
  btnG.addColorStop(0, '#a855f7');
  btnG.addColorStop(0.5, '#3b82f6');
  btnG.addColorStop(1, '#22d3ee');
  ctx.fillStyle = btnG;
  ctx.fill();

  ctx.textAlign = 'center';
  ctx.fillStyle = '#040712';
  ctx.font = `800 23px ${FONT_DISPLAY}`;
  ctx.fillText('CLICK TO OPEN LIVE CONTACT FORM  ✉', TEX_W / 2, formY + 387);
  ctx.textAlign = 'left';
}

/**
 * Page 10 — Back Hardcover: “DREAM BIG. BUILD DIFFERENT.”
 */
function renderPage10BackCover(ctx) {
  const bg = ctx.createLinearGradient(0, 0, TEX_W, TEX_H);
  bg.addColorStop(0, '#050814');
  bg.addColorStop(0.5, '#0b1026');
  bg.addColorStop(1, '#060816');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, TEX_W, TEX_H);

  // Subtle woven leather texture
  ctx.save();
  ctx.strokeStyle = 'rgba(148, 163, 184, 0.028)';
  ctx.lineWidth = 1;
  for (let i = -TEX_H; i < TEX_W + TEX_H; i += 18) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i - TEX_H, TEX_H);
    ctx.stroke();
  }
  ctx.restore();

  // Left-side hardcover spine hinge groove (when flipped 180 deg onto right, spine is on left!)
  const spineGrad = ctx.createLinearGradient(0, 0, 86, 0);
  spineGrad.addColorStop(0, 'rgba(3, 5, 14, 0.92)');
  spineGrad.addColorStop(0.45, 'rgba(30, 41, 82, 0.45)');
  spineGrad.addColorStop(0.78, 'rgba(2, 4, 12, 0.85)');
  spineGrad.addColorStop(1, 'rgba(168, 85, 247, 0.18)');
  ctx.fillStyle = spineGrad;
  ctx.fillRect(0, 0, 86, TEX_H);

  const centerX = (96 + (TEX_W - 52)) / 2;

  // Radial glow
  const glow = ctx.createRadialGradient(centerX, TEX_H * 0.48, 30, centerX, TEX_H * 0.48, 460);
  glow.addColorStop(0, 'rgba(34, 211, 238, 0.28)');
  glow.addColorStop(0.5, 'rgba(168, 85, 247, 0.18)');
  glow.addColorStop(1, 'rgba(5, 8, 20, 0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, TEX_W, TEX_H);

  // Outer foil frame
  roundRect(ctx, 96, 52, TEX_W - 148, TEX_H - 104, 26);
  const foil = ctx.createLinearGradient(96, 52, TEX_W - 52, TEX_H - 52);
  foil.addColorStop(0, '#22d3ee');
  foil.addColorStop(0.5, '#3b82f6');
  foil.addColorStop(1, '#a855f7');
  ctx.strokeStyle = foil;
  ctx.lineWidth = 3;
  ctx.stroke();

  drawCoverCorners(ctx, 40);

  // Orbital rings
  ctx.save();
  ctx.translate(centerX, 410);
  ctx.beginPath();
  ctx.arc(0, 0, 92, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(34, 211, 238, 0.55)';
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(0, 0, 62, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(168, 85, 247, 0.65)';
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.textAlign = 'center';
  ctx.fillStyle = '#22d3ee';
  ctx.font = `700 28px ${FONT_MONO}`;
  ctx.fillText('10/10', 0, 10);
  ctx.restore();

  // Monumental Back Cover Quote
  ctx.textAlign = 'center';
  ctx.fillStyle = '#f8fafc';
  ctx.font = `800 66px ${FONT_DISPLAY}`;
  ctx.fillText('“DREAM BIG.', centerX, 660);

  const qGrad = ctx.createLinearGradient(centerX - 310, 700, centerX + 310, 770);
  qGrad.addColorStop(0, '#22d3ee');
  qGrad.addColorStop(0.5, '#60a5fa');
  qGrad.addColorStop(1, '#c084fc');
  ctx.fillStyle = qGrad;
  ctx.font = `800 62px ${FONT_DISPLAY}`;
  ctx.fillText('BUILD DIFFERENT.”', centerX, 752);

  // Divider bar
  roundRect(ctx, centerX - 110, 815, 220, 5, 2.5);
  ctx.fillStyle = qGrad;
  ctx.fill();

  ctx.fillStyle = '#e2e8f0';
  ctx.font = `700 26px ${FONT_DISPLAY}`;
  ctx.fillText('ERKINOV LOYIHASI', centerX, 888);

  ctx.fillStyle = '#94a3b8';
  ctx.font = `500 22px ${FONT_MONO}`;
  ctx.fillText('ERKINOV BOBURJON', centerX, 928);

  // Reopen cue
  roundRect(ctx, centerX - 270, 1060, 540, 82, 20);
  ctx.fillStyle = 'rgba(34, 211, 238, 0.14)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(34, 211, 238, 0.55)';
  ctx.lineWidth = 1.8;
  ctx.stroke();

  ctx.fillStyle = '#67e8f9';
  ctx.font = `700 21px ${FONT_MONO}`;
  ctx.fillText('⬅  DRAG LEFT TO REOPEN CODEX', centerX, 1109);
  ctx.textAlign = 'left';
}

function finalizeTexture(canvas, maxAnisotropy = 8) {
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = maxAnisotropy;
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.needsUpdate = true;
  return tex;
}

/**
 * Generates all 10 high-DPI page textures + spine texture + paper-edge striation texture.
 */
export function createBookTextures(portfolioData, maxAnisotropy = 8) {
  const projects = portfolioData.projects || [];
  const moneyFlow =
    projects.find((p) => p.slug === 'moneyflow' || p.title === 'MoneyFlow') || projects[0];
  const sherdoor =
    projects.find((p) => p.slug === 'sherdoor-akfa' || p.title === 'SHERDOOR AKFA') ||
    projects[1];

  const renderers = [
    (ctx) => renderPage1Cover(ctx),
    (ctx) => renderPage2About(ctx, portfolioData),
    (ctx) => renderPage3Skills(ctx, portfolioData),
    (ctx) => renderPage4Journey(ctx, portfolioData),
    (ctx) => renderPage5MoneyFlow(ctx, moneyFlow),
    (ctx) => renderPage6Sherdoor(ctx, sherdoor),
    (ctx) => renderPage7Technologies(ctx, portfolioData),
    (ctx) => renderPage8Projects(ctx, projects),
    (ctx) => renderPage9Contact(ctx, portfolioData),
    (ctx) => renderPage10BackCover(ctx),
  ];

  const pageTextures = renderers.map((drawFn) => {
    const canvas = document.createElement('canvas');
    canvas.width = TEX_W;
    canvas.height = TEX_H;
    const ctx = canvas.getContext('2d');
    drawFn(ctx);
    return finalizeTexture(canvas, maxAnisotropy);
  });

  // Spine embossed texture
  const spineCanvas = document.createElement('canvas');
  spineCanvas.width = 256;
  spineCanvas.height = 1420;
  const sctx = spineCanvas.getContext('2d');
  const sGrad = sctx.createLinearGradient(0, 0, 256, 0);
  sGrad.addColorStop(0, '#050814');
  sGrad.addColorStop(0.5, '#121b3a');
  sGrad.addColorStop(1, '#050814');
  sctx.fillStyle = sGrad;
  sctx.fillRect(0, 0, 256, 1420);

  // Gold/Cyan ribs on spine
  [140, 260, 1160, 1280].forEach((ry) => {
    sctx.fillStyle = 'rgba(34, 211, 238, 0.55)';
    sctx.fillRect(24, ry, 208, 6);
  });

  sctx.save();
  sctx.translate(128, 710);
  sctx.rotate(-Math.PI / 2);
  sctx.textAlign = 'center';
  sctx.fillStyle = '#e2e8f0';
  sctx.font = `700 32px ${FONT_DISPLAY}`;
  sctx.fillText('ERKINOV LOYIHASI  •  ERKINOV BOBURJON', 0, 10);
  sctx.restore();
  const spineTexture = finalizeTexture(spineCanvas, maxAnisotropy);

  // Layered paper block edge texture
  const edgeCanvas = document.createElement('canvas');
  edgeCanvas.width = 256;
  edgeCanvas.height = 512;
  const ectx = edgeCanvas.getContext('2d');
  ectx.fillStyle = '#cbd5e1';
  ectx.fillRect(0, 0, 256, 512);
  for (let x = 0; x < 256; x += 4) {
    ectx.fillStyle = x % 8 === 0 ? '#94a3b8' : '#e2e8f0';
    ectx.fillRect(x, 0, 2, 512);
  }
  const paperEdgeTexture = finalizeTexture(edgeCanvas, maxAnisotropy);

  return {
    pageTextures,
    spineTexture,
    paperEdgeTexture,
  };
}

/**
 * Interactive UV hotspots mapped in normalized canvas space (x: 0..1, y: 0..1 from top).
 */
export function resolvePageHotspot(pageNumber, uv) {
  if (!uv) return null;
  const cx = uv.x;
  const cy = 1 - uv.y;

  // Page 5: MoneyFlow live website CTA button
  if (pageNumber === 5) {
    if (cx >= 92 / TEX_W && cx <= (TEX_W - 92) / TEX_W && cy >= 1068 / TEX_H && cy <= 1180 / TEX_H) {
      return { type: 'external', url: 'https://moneyflow-website.netlify.app', label: 'Open MoneyFlow Website' };
    }
  }

  // Page 8: Projects index cards
  if (pageNumber === 8) {
    if (cx >= 92 / TEX_W && cx <= (TEX_W - 92) / TEX_W) {
      if (cy >= 368 / TEX_H && cy <= 766 / TEX_H) {
        return { type: 'external', url: 'https://moneyflow-website.netlify.app', label: 'Open MoneyFlow Website' };
      }
      if (cy >= 800 / TEX_H && cy <= 1198 / TEX_H) {
        return { type: 'gotoPage', page: 6, label: 'Go to SHERDOOR AKFA Page' };
      }
    }
  }

  // Page 9: Contact social channels & live form card
  if (pageNumber === 9 && cx >= 92 / TEX_W && cx <= (TEX_W - 92) / TEX_W) {
    if (cy >= 356 / TEX_H && cy <= 448 / TEX_H) {
      return { type: 'external', url: 'https://t.me/Erkinov_1105', label: 'Open Telegram @Erkinov_1105' };
    }
    if (cy >= 464 / TEX_H && cy <= 556 / TEX_H) {
      return { type: 'external', url: 'https://www.instagram.com/Erkinov_neww/', label: 'Open Instagram @Erkinov_neww' };
    }
    if (cy >= 572 / TEX_H && cy <= 664 / TEX_H) {
      return { type: 'openContact', focus: 'email', label: 'Email Placeholder Info' };
    }
    if (cy >= 680 / TEX_H && cy <= 772 / TEX_H) {
      return { type: 'openContact', focus: 'github', label: 'GitHub Placeholder Info' };
    }
    if (cy >= 810 / TEX_H && cy <= 1250 / TEX_H) {
      return { type: 'openContact', focus: 'form', label: 'Open Live Contact Form' };
    }
  }

  return null;
}
