// Instance-mode sketch for tab 3
registerSketch('sk3', function (p) {
  const CANVAS_SIZE = 800;
  const EGG_STAGE_PATHS = [
    'images/egg-stage-1.png',
    'images/egg-stage-2.png',
    'images/egg-stage-3.png',
    'images/egg-stage-4.png',
    'images/egg-stage-5.png',
  ];
  const TIMER_STEP_SECONDS = 30;
  const MIN_TIMER_SECONDS = 30;
  const MAX_TIMER_SECONDS = 10 * 60;
  const eggStages = [
    {
      title: 'Runny White + Yolk',
      short: 'Runny',
      detail: 'White is opaque but still loose. Yolk is fully runny.',
      seconds: 2 * 60,
      whiteSet: 0.22,
      whiteSpread: 1.28,
      whiteOpacity: 218,
      whiteWobble: 1.05,
      yolkOuter: '#f5a51a',
      yolkInner: '#f58e13',
      innerCore: 0.82,
    },
    {
      title: 'Set White, Runny Yolk',
      short: 'Soft Center',
      detail: 'White is set. Yolk is still loose and glossy inside.',
      seconds: 4 * 60,
      whiteSet: 0.56,
      whiteSpread: 1.16,
      whiteOpacity: 238,
      whiteWobble: 0.62,
      yolkOuter: '#f3af21',
      yolkInner: '#f69014',
      innerCore: 0.72,
    },
    {
      title: 'Set White, Yolk Starting To Set',
      short: 'Jammy',
      detail: 'White is set. Yolk is thickening and just starting to set.',
      seconds: 6 * 60,
      whiteSet: 0.74,
      whiteSpread: 1.08,
      whiteOpacity: 246,
      whiteWobble: 0.38,
      yolkOuter: '#f0b928',
      yolkInner: '#eb8615',
      innerCore: 0.5,
    },
    {
      title: 'Set White, Set Yolk With Orange Center',
      short: 'Set Center',
      detail: 'White is set. Yolk is set with a soft orange middle.',
      seconds: 8 * 60,
      whiteSet: 0.88,
      whiteSpread: 1.02,
      whiteOpacity: 252,
      whiteWobble: 0.18,
      yolkOuter: '#ecc33a',
      yolkInner: '#ee8a19',
      innerCore: 0.24,
    },
    {
      title: 'Firm Yellow Yolk',
      short: 'Firm',
      detail: 'White is set. Yolk is fully yellow and firm all the way through.',
      seconds: 10 * 60,
      whiteSet: 0.97,
      whiteSpread: 0.98,
      whiteOpacity: 255,
      whiteWobble: 0.06,
      yolkOuter: '#e8d24d',
      yolkInner: '#e8d24d',
      innerCore: 0.0,
    },
  ];

  let selectedStage = 2;
  let selectedDurationSeconds = eggStages[selectedStage].seconds;
  let phase = 'select';
  let startedAt = 0;
  let lastError = null;
  let eggStageSprites = [];
  let eggStageSpritesReady = false;

  const layout = {
    leftPanel: { x: 30, y: 120, w: 420, h: 620 },
    rightPanel: { x: 470, y: 120, w: 300, h: 620 },
    startButton: { x: 535, y: 690, w: 170, h: 52 },
    resetButton: { x: 555, y: 690, w: 150, h: 46 },
    durationMinus: { x: 506, y: 560, w: 52, h: 42 },
    durationPlus: { x: 682, y: 560, w: 52, h: 42 },
  };

  p.preload = function () {
    eggStageSprites = new Array(EGG_STAGE_PATHS.length);
    let loadedCount = 0;

    EGG_STAGE_PATHS.forEach(function (path, index) {
      p.loadImage(
        path,
        function (img) {
          eggStageSprites[index] = img;
          loadedCount += 1;
          eggStageSpritesReady = loadedCount === EGG_STAGE_PATHS.length;
        },
        function (err) {
          eggStageSpritesReady = false;
          console.warn('Egg stage image failed to load:', path, err);
        }
      );
    });
  };

  p.setup = function () {
    p.createCanvas(CANVAS_SIZE, CANVAS_SIZE);
    p.canvas.style.display = 'block';
    p.textFont('Georgia');
  };

  p.draw = function () {
    try {
      drawBackground();
      if (phase === 'select') {
        drawSelectionScreen();
      } else if (phase === 'cooking') {
        if (getElapsedSeconds() >= selectedDurationSeconds) {
          phase = 'done';
          drawDoneScreen();
        } else {
          drawCookingScreen();
        }
      } else {
        drawDoneScreen();
      }
      lastError = null;
    } catch (err) {
      lastError = err;
      console.error('sk3 draw error:', err);
      drawErrorFallback(err);
    } finally {
      drawFrame();
    }
  };

  p.mousePressed = function () {
    if (lastError) return;

    if (phase === 'select') {
      if (pointInRect(p.mouseX, p.mouseY, layout.durationMinus)) {
        selectedDurationSeconds = p.max(MIN_TIMER_SECONDS, selectedDurationSeconds - TIMER_STEP_SECONDS);
        selectedStage = getStageIndexForDuration(selectedDurationSeconds);
        return;
      }

      if (pointInRect(p.mouseX, p.mouseY, layout.durationPlus)) {
        selectedDurationSeconds = p.min(MAX_TIMER_SECONDS, selectedDurationSeconds + TIMER_STEP_SECONDS);
        selectedStage = getStageIndexForDuration(selectedDurationSeconds);
        return;
      }

      if (pointInRect(p.mouseX, p.mouseY, layout.startButton)) {
        startedAt = p.millis();
        phase = 'cooking';
      }
      return;
    }

    if (pointInRect(p.mouseX, p.mouseY, layout.resetButton)) {
      phase = 'select';
      startedAt = 0;
    }
  };

  p.windowResized = function () {
    p.resizeCanvas(CANVAS_SIZE, CANVAS_SIZE);
  };

  function drawBackground() {
    const top = p.color('#fbf3df');
    const bottom = p.color('#efd4b0');
    for (let y = 0; y < p.height; y += 2) {
      const t = y / p.height;
      p.stroke(p.lerpColor(top, bottom, t));
      p.line(0, y, p.width, y);
    }

    p.noStroke();
    p.fill(255, 255, 255, 70);
    p.ellipse(120, 85, 170, 88);
    p.ellipse(700, 105, 220, 110);
    p.fill(226, 196, 160, 180);
    p.rect(0, 650, p.width, 150);
    p.fill(207, 165, 119, 215);
    p.rect(0, 690, p.width, 110);
  }

  function drawSelectionScreen() {
    drawHeader('Texture-Based Egg Timer', 'Choose the egg result first. The timer sets itself from the texture goal.');
    drawPanel(layout.leftPanel.x, layout.leftPanel.y, layout.leftPanel.w, layout.leftPanel.h, '#fff8ee');
    drawPanel(layout.rightPanel.x, layout.rightPanel.y, layout.rightPanel.w, layout.rightPanel.h, '#fff8ee');

    p.fill(44, 57, 76);
    p.textAlign(p.LEFT, p.TOP);
    p.textSize(30);
    p.text('Choose The Result', 55, 146);

    p.fill(94, 108, 126);
    p.textSize(15);
    p.text('The left column is a visual reference. Adjust the time on the right to choose your egg result.', 55, 188, 355, 54);

    drawStageCards(false, null);
    drawRightPreview(false);
    drawButton(layout.startButton, 'Start Timer', '#d96c4f', '#f8f4ec');
  }

  function drawCookingScreen() {
    const target = getSelectedStage();
    const elapsed = getElapsedSeconds();
    const progress = p.constrain(elapsed / selectedDurationSeconds, 0, 1);
    const texture = getTextureAtProgress(progress);

    drawHeader(target.title, 'The egg changes texture as the timer moves toward your selected result.');
    drawPanel(layout.leftPanel.x, layout.leftPanel.y, layout.leftPanel.w, layout.leftPanel.h, '#fff8ee');
    drawPanel(layout.rightPanel.x, layout.rightPanel.y, layout.rightPanel.w, layout.rightPanel.h, '#fff8ee');

    p.fill(44, 57, 76);
    p.textAlign(p.LEFT, p.TOP);
    p.textSize(28);
    p.text('Cooking Egg', 55, 146);

    p.fill(94, 108, 126);
    p.textSize(15);
    p.text('Current texture shifts from runny to firm based on the chosen finish.', 55, 184, 352, 48);

    drawMainEggScene(texture, progress, false);
    drawTextureTimeline(progress);
    drawRightPreview(true, texture, progress);
    drawButton(layout.resetButton, 'Reset', '#395b72', '#f8f4ec');
  }

  function drawDoneScreen() {
    const texture = eggStages[selectedStage];

    drawHeader('Egg Ready', 'Your selected egg texture is finished.');
    drawPanel(layout.leftPanel.x, layout.leftPanel.y, layout.leftPanel.w, layout.leftPanel.h, '#fff8ee');
    drawPanel(layout.rightPanel.x, layout.rightPanel.y, layout.rightPanel.w, layout.rightPanel.h, '#fff8ee');

    p.fill(44, 57, 76);
    p.textAlign(p.LEFT, p.TOP);
    p.textSize(28);
    p.text('Finished Texture', 55, 146);

    p.fill(94, 108, 126);
    p.textSize(15);
    p.text(texture.detail, 55, 184, 350, 44);

    drawMainEggScene(texture, 1, true);
    drawTextureTimeline(1);
    drawRightPreview(true, texture, 1, true);
    drawButton(layout.resetButton, 'Reset', '#395b72', '#f8f4ec');
  }

  function drawHeader(title, subtitle) {
    drawPanel(20, 20, 760, 82, '#fff8ef');

    p.fill(44, 57, 76);
    p.textAlign(p.LEFT, p.TOP);
    p.textSize(28);
    p.text(title, 42, 34);

    p.fill(97, 112, 130);
    p.textSize(15);
    p.text(subtitle, 42, 68, 560, 34);
  }

  function drawStageCards(showLiveInfo, progress) {
    for (let i = 0; i < eggStages.length; i += 1) {
      const stage = eggStages[i];
      const x = 50;
      const y = 242 + i * 88;
      const w = 380;
      const h = 72;
      const selected = i === selectedStage;
      const reached = showLiveInfo && progress !== null && i <= Math.floor(progress * selectedStage + 0.001);

      p.noStroke();
      if (selected) p.fill('#f5e5c8');
      else if (reached) p.fill('#eef4ea');
      else p.fill('#faf4eb');
      p.rect(x, y, w, h, 18);

      p.fill(selected ? '#d96c4f' : reached ? '#77a266' : '#ccb89b');
      p.rect(x + 14, y + 14, 8, h - 28, 5);

      drawStageImage(i, x + w - 54, y + 36, 50, 50);

      p.fill(46, 58, 77);
      p.textAlign(p.LEFT, p.TOP);
      p.textSize(18);
      p.text((i + 1) + '. ' + stage.short, x + 34, y + 12);

      p.fill(97, 112, 130);
      p.textSize(13);
      p.text(stage.detail, x + 34, y + 36, 205, 32);

      p.fill(82, 97, 120);
      p.textAlign(p.RIGHT, p.TOP);
      p.textSize(14);
      p.text(formatClock(stage.seconds), x + w - 20, y + 15);
    }
  }

  function drawRightPreview(showLiveInfo, texture, progress, allDone) {
    const stage = getSelectedStage();
    const stageIndex = showLiveInfo ? getVisibleStageIndex(progress, allDone) : selectedStage;

    p.fill(44, 57, 76);
    p.textAlign(p.LEFT, p.TOP);
    p.textSize(26);
    p.text(showLiveInfo ? 'Live Texture' : 'Preview', 492, 146);

    p.fill(97, 112, 130);
    p.textSize(15);
    p.text(stage.title, 492, 184, 250, 34);

    p.noStroke();
    p.fill(248, 241, 231);
    p.circle(620, 332, 204);
    p.fill('#fffefb');
    p.circle(620, 332, 186);
    p.stroke(220, 201, 176);
    p.strokeWeight(2);
    p.noFill();
    p.circle(620, 332, 186);

    if (!drawStageImage(stageIndex, 620, 336, 118, 118)) {
      drawEggOnPlate(620, 336, 1.02, showLiveInfo ? texture : stage);
    }

    p.noStroke();
    p.fill('#f6efe3');
    p.rect(488, 450, 264, 150, 20);

    p.fill(44, 57, 76);
    p.textAlign(p.LEFT, p.TOP);
    p.textSize(18);
    p.text(showLiveInfo ? 'Timer' : 'Selected Time', 506, 468);

    p.fill(97, 112, 130);
    p.textSize(14);
    if (showLiveInfo) {
      const remaining = allDone ? 0 : p.max(0, selectedDurationSeconds - getElapsedSeconds());
      const currentIndex = allDone ? selectedStage : Math.min(selectedStage, Math.floor(progress * selectedStage + 0.001));
      p.text('Time left: ' + formatClock(remaining), 506, 498);
      p.text('Current stage: ' + (currentIndex + 1) + ' / ' + (selectedStage + 1), 506, 522);
      p.text('Chosen time: ' + formatClock(selectedDurationSeconds), 506, 546);
    } else {
      p.text('Chosen time: ' + formatClock(selectedDurationSeconds), 506, 498);
      p.text('Goal: ' + stage.short, 506, 522);
      p.text('Change time on the right.\nMinimum: 00:30.', 506, 628, 220, 40);
      drawDurationControls(stage.seconds);
    }
  }

  function drawMainEggScene(texture, progress, plated) {
    const cx = 240;
    const cy = 390;
    const stageIndex = phase === 'done' ? selectedStage : getVisibleStageIndex(progress, false);

    p.noStroke();
    p.fill(245, 237, 223);
    p.circle(cx, cy, 292);
    p.fill('#fffefa');
    p.circle(cx, cy, 272);
    p.stroke(220, 201, 176);
    p.strokeWeight(2);
    p.noFill();
    p.circle(cx, cy, 272);

    if (drawStageImage(stageIndex, cx, cy + 8, 230, 230)) {
      p.noStroke();
      p.fill(233, 223, 204, 90);
      p.ellipse(cx, cy + 84, 170, 28);
    } else if (plated) {
      drawEggOnPlate(cx, cy + 8, 1.35, texture);
    } else {
      drawPan(cx, cy + 10, 1.45);
      drawEgg(texture, cx, cy, 1.34, true);
    }

    p.noStroke();
    p.fill(228, 184, 136);
    p.rect(75, 575, 330, 30, 14);
    p.fill(201, 156, 110);
    p.rect(60, 606, 360, 84, 18);

    p.fill(44, 57, 76);
    p.textAlign(p.LEFT, p.TOP);
    p.textSize(18);
    if (phase === 'cooking') {
      const target = getSelectedStage();
      p.text('Current step left: ' + formatClock(selectedDurationSeconds - getElapsedSeconds()), 55, 695);
      p.fill(96, 112, 130);
      p.textSize(14);
      p.text('Goal: ' + target.title + ' | Timer: ' + formatClock(selectedDurationSeconds), 55, 724, 340, 34);
    } else if (phase === 'done') {
      p.text('Target reached: ' + getSelectedStage().short, 55, 695);
      p.fill(96, 112, 130);
      p.textSize(14);
      p.text('The yolk and white now match the selected final texture.', 55, 724, 320, 34);
    }
  }

  function drawTextureTimeline(progress) {
    const x = 80;
    const y = 520;
    const w = 300;

    p.stroke(213, 193, 168);
    p.strokeWeight(6);
    p.line(x, y, x + w, y);

    p.stroke('#d96c4f');
    p.line(x, y, x + w * progress, y);

    for (let i = 0; i < eggStages.length; i += 1) {
      const px = x + (w * i) / (eggStages.length - 1);
      const active = i <= Math.floor(progress * selectedStage + 0.001);
      p.noStroke();
      p.fill(active ? '#d96c4f' : '#f2e8d8');
      p.circle(px, y, 18);
      p.fill(active ? '#fff7ef' : '#7f8c99');
      p.textAlign(p.CENTER, p.TOP);
      p.textSize(11);
      p.text(i + 1, px, y - 6);
    }
  }

  function drawPan(cx, cy, scale) {
    p.push();
    p.translate(cx, cy);
    p.noStroke();
    p.fill('#3d434b');
    p.circle(0, 0, 214 * scale);
    p.fill('#595f68');
    p.circle(0, 0, 170 * scale);
    p.fill('#22272d');
    p.arc(0, 0, 214 * scale, 214 * scale, p.PI * 0.15, p.PI * 1.85, p.CHORD);

    p.push();
    p.rotate(p.PI * 0.18);
    p.fill('#2d3137');
    p.rect(68 * scale, -16 * scale, 112 * scale, 34 * scale, 16 * scale);
    p.fill('#515863');
    p.rect(82 * scale, -11 * scale, 80 * scale, 24 * scale, 12 * scale);
    p.pop();
    p.pop();
  }

  function drawEgg(texture, cx, cy, scale, animate) {
    const wiggle = animate ? p.sin(p.frameCount * 0.08) * texture.whiteWobble : 0;
    const spread = 88 * texture.whiteSpread * scale;
    const tall = 58 * (1.04 - texture.whiteSet * 0.16) * scale;
    const whiteAlpha = texture.whiteOpacity;

    p.push();
    p.translate(cx, cy);
    p.noStroke();
    p.fill(250, 249, 244, whiteAlpha);
    p.beginShape();
    p.vertex(-spread * 0.98, 8 * scale);
    p.bezierVertex(-spread * 1.05, -28 * scale + wiggle * 6, -spread * 0.28, -tall * 0.98, 0, -tall * 0.88);
    p.bezierVertex(spread * 0.45, -tall, spread * 0.98, -20 * scale - wiggle * 5, spread * 0.92, 4 * scale);
    p.bezierVertex(spread * 1.04, 32 * scale + wiggle * 4, spread * 0.34, tall * 0.88, -10 * scale, tall * 0.76);
    p.bezierVertex(-spread * 0.56, tall * 0.86, -spread * 1.15, 34 * scale - wiggle * 4, -spread * 0.98, 8 * scale);
    p.endShape(p.CLOSE);

    p.fill(255, 255, 255, 120 + texture.whiteSet * 60);
    p.ellipse(-18 * scale, -16 * scale, 54 * scale, 28 * scale);

    const yolkOuter = p.color(texture.yolkOuter);
    const yolkInner = p.color(texture.yolkInner);
    p.fill(yolkOuter);
    p.circle(8 * scale, 2 * scale, 56 * scale);
    p.fill(255, 255, 255, 52);
    p.ellipse(-2 * scale, -10 * scale, 20 * scale, 11 * scale);

    if (texture.innerCore > 0.02) {
      p.fill(yolkInner);
      p.circle(8 * scale, 2 * scale, 56 * scale * texture.innerCore);
    }
    p.pop();
  }

  function drawEggOnPlate(cx, cy, scale, texture) {
    p.noStroke();
    p.fill(241);
    p.ellipse(cx, cy + 16, 240 * scale, 172 * scale);
    p.fill(255);
    p.ellipse(cx, cy + 12, 186 * scale, 132 * scale);
    drawEgg(texture, cx, cy + 8, scale * 0.84, false);
  }

  function getSelectedStage() {
    return eggStages[selectedStage];
  }

  function getElapsedSeconds() {
    return p.max(0, (p.millis() - startedAt) / 1000);
  }

  function getTextureAtProgress(progress) {
    if (selectedStage === 0) return eggStages[0];

    const stageFloat = progress * selectedStage;
    const stageA = Math.floor(stageFloat);
    const stageB = Math.min(selectedStage, Math.ceil(stageFloat));
    const t = stageB === stageA ? 0 : stageFloat - stageA;
    return blendTextures(eggStages[stageA], eggStages[stageB], t);
  }

  function getVisibleStageIndex(progress, allDone) {
    if (allDone) return selectedStage;
    return p.constrain(Math.floor(progress * (selectedStage + 1)), 0, selectedStage);
  }

  function blendTextures(a, b, t) {
    return {
      whiteSet: p.lerp(a.whiteSet, b.whiteSet, t),
      whiteSpread: p.lerp(a.whiteSpread, b.whiteSpread, t),
      whiteOpacity: p.lerp(a.whiteOpacity, b.whiteOpacity, t),
      whiteWobble: p.lerp(a.whiteWobble, b.whiteWobble, t),
      yolkOuter: p.lerpColor(p.color(a.yolkOuter), p.color(b.yolkOuter), t),
      yolkInner: p.lerpColor(p.color(a.yolkInner), p.color(b.yolkInner), t),
      innerCore: p.lerp(a.innerCore, b.innerCore, t),
    };
  }

  function drawButton(rect, label, fillColor, textColor) {
    p.noStroke();
    p.fill(fillColor);
    p.rect(rect.x, rect.y, rect.w, rect.h, 18);
    p.fill(textColor);
    p.textAlign(p.CENTER, p.CENTER);
    p.textSize(18);
    p.text(label, rect.x + rect.w / 2, rect.y + rect.h / 2 + 1);
  }

  function drawPanel(x, y, w, h, fillColor) {
    p.noStroke();
    p.fill(0, 0, 0, 12);
    p.rect(x + 8, y + 10, w, h, 26);
    p.fill(fillColor);
    p.rect(x, y, w, h, 26);
  }

  function pointInRect(px, py, rect) {
    return px >= rect.x && px <= rect.x + rect.w && py >= rect.y && py <= rect.y + rect.h;
  }

  function drawDurationControls(defaultSeconds) {
    p.noStroke();
    p.fill('#f3e7d7');
    p.rect(503, 560, 234, 58, 18);

    drawMiniControl(layout.durationMinus, '-');
    drawMiniControl(layout.durationPlus, '+');

    p.fill(44, 57, 76);
    p.textAlign(p.CENTER, p.TOP);
    p.textSize(22);
    p.text(formatClock(selectedDurationSeconds), 620, 568);

    p.fill(97, 112, 130);
    p.textSize(12);
    p.text('Default: ' + formatClock(defaultSeconds), 620, 594);
  }

  function drawMiniControl(rect, label) {
    p.noStroke();
    p.fill('#d96c4f');
    p.rect(rect.x, rect.y, rect.w, rect.h, 14);
    p.fill('#fff8ef');
    p.textAlign(p.CENTER, p.CENTER);
    p.textSize(28);
    p.text(label, rect.x + rect.w / 2, rect.y + rect.h / 2 - 2);
  }

  function getStageIndexForDuration(durationSeconds) {
    let bestIndex = 0;
    let bestDistance = Math.abs(durationSeconds - eggStages[0].seconds);
    for (let i = 1; i < eggStages.length; i += 1) {
      const distance = Math.abs(durationSeconds - eggStages[i].seconds);
      if (distance < bestDistance) {
        bestDistance = distance;
        bestIndex = i;
      }
    }
    return bestIndex;
  }

  function drawStageImage(index, cx, cy, maxW, maxH) {
    if (!eggStageSpritesReady || !eggStageSprites[index]) return false;
    const sprite = eggStageSprites[index];
    const scale = Math.min(maxW / sprite.width, maxH / sprite.height);
    const w = sprite.width * scale;
    const h = sprite.height * scale;
    p.image(sprite, cx - w / 2, cy - h / 2, w, h);
    return true;
  }

  function formatClock(seconds) {
    const safe = Math.max(0, Math.ceil(seconds));
    const mins = Math.floor(safe / 60);
    const secs = safe % 60;
    return p.nf(mins, 2) + ':' + p.nf(secs, 2);
  }

  function drawErrorFallback(err) {
    p.background(255);
    p.noStroke();
    p.fill(180, 60, 60);
    p.textAlign(p.CENTER, p.CENTER);
    p.textSize(30);
    p.text('HWK #4. B', p.width / 2, p.height / 2 - 46);

    p.fill(60);
    p.textSize(18);
    p.text('Canvas loaded, but the sketch hit an error.', p.width / 2, p.height / 2);
    p.textSize(14);
    p.text('Open the browser console to see the exact message.', p.width / 2, p.height / 2 + 26);

    if (err && err.message) {
      p.fill(110, 40, 40);
      p.text(err.message, p.width / 2, p.height / 2 + 56, 620, 80);
    }
  }

  function drawFrame() {
    p.noFill();
    p.stroke(26, 37, 56, 90);
    p.strokeWeight(1);
    p.rect(0, 0, p.width - 1, p.height - 1);
  }
});
