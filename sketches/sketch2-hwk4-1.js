// Instance-mode sketch for tab 2
registerSketch('sk2', function (p) {
  const CANVAS_SIZE = 800;
  const selectorValues = [60, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];
  const steps = [
    { label: 'Wash vegetables', short: 'Wash vegetables', detail: 'Chef rinses the vegetables at the sink.', weight: 13, accent: '#79b8f3' },
    { label: 'Cut vegetables', short: 'Cut vegetables', detail: 'Chef chops the vegetables on the board.', weight: 12, accent: '#7bd389' },
    { label: 'Melt butter in pan', short: 'Melt butter', detail: 'Butter softens and melts in the warm pan.', weight: 8, accent: '#ffd166' },
    { label: 'Fry egg in pan', short: 'Fry egg', detail: 'The egg sizzles while the yolk stays bright.', weight: 14, accent: '#f6bd60' },
    { label: 'Fry bacon in pan', short: 'Fry bacon', detail: 'Bacon crisps up beside the chef.', weight: 13, accent: '#f28482' },
    { label: 'Toast the bread', short: 'Toast bread', detail: 'Bread pops up from the toaster.', weight: 11, accent: '#d4a373' },
    { label: 'Spread butter on bread', short: 'Butter bread', detail: 'Chef smooths butter across the toast.', weight: 8, accent: '#f7d794' },
    { label: 'Pour a cup of coffee', short: 'Pour coffee', detail: 'Coffee streams into the mug.', weight: 9, accent: '#8d6e63' },
    { label: 'Plate the breakfast', short: 'Plate dish', detail: 'Toast, vegetables, egg, and bacon come together.', weight: 12, accent: '#84a59d' },
  ];

  let selectedMinutes = 25;
  let phase = 'select';
  let startedAt = 0;
  let startedWallClock = 0;
  let scheduleSeconds = [];
  let totalDurationSeconds = 0;

  const layout = {
    selector: { x: 245, y: 365, rOuter: 165, rInner: 80 },
    preview: { x: 470, y: 115, w: 290, h: 565 },
    scene: { x: 35, y: 135, w: 470, h: 610, bubbleX: 270, bubbleY: 410, bubbleR: 178 },
    sidebar: { x: 525, y: 135, w: 240, h: 610 },
    startButton: { x: 505, y: 700, w: 220, h: 54 },
    resetButton: { x: 560, y: 705, w: 160, h: 42 },
  };

  p.setup = function () {
    p.createCanvas(CANVAS_SIZE, CANVAS_SIZE);
    p.textFont('Georgia');
    rebuildSchedule();
  };

  p.draw = function () {
    drawBackground();

    if (phase === 'select') {
      drawSelectionScreen();
    } else if (phase === 'cooking') {
      updateCookingState();
      if (phase === 'done') drawDoneScreen();
      else drawCookingScreen();
    } else {
      drawDoneScreen();
    }

    p.noFill();
    p.stroke(26, 37, 56, 90);
    p.strokeWeight(1);
    p.rect(0, 0, p.width - 1, p.height - 1);
  };

  p.mousePressed = function () {
    if (phase === 'select') {
      const dialValue = detectSelectorClick(p.mouseX, p.mouseY);
      if (dialValue !== null) {
        selectedMinutes = dialValue;
        rebuildSchedule();
        return;
      }

      if (pointInRect(p.mouseX, p.mouseY, layout.startButton)) {
        startedAt = p.millis();
        startedWallClock = Date.now();
        phase = 'cooking';
      }
      return;
    }

    if (pointInRect(p.mouseX, p.mouseY, layout.resetButton)) {
      phase = 'select';
      startedAt = 0;
      startedWallClock = 0;
      rebuildSchedule();
    }
  };

  p.windowResized = function () {
    p.resizeCanvas(CANVAS_SIZE, CANVAS_SIZE);
  };

  function rebuildSchedule() {
    totalDurationSeconds = selectedMinutes * 60;
    const totalWeight = steps.reduce((sum, step) => sum + step.weight, 0);
    const raw = steps.map((step) => (step.weight / totalWeight) * totalDurationSeconds);
    scheduleSeconds = raw.map((value) => Math.floor(value));

    let remainder = totalDurationSeconds - scheduleSeconds.reduce((sum, value) => sum + value, 0);
    const order = raw
      .map((value, index) => ({ index: index, fraction: value - Math.floor(value) }))
      .sort((a, b) => b.fraction - a.fraction);

    let cursor = 0;
    while (remainder > 0) {
      scheduleSeconds[order[cursor % order.length].index] += 1;
      remainder -= 1;
      cursor += 1;
    }
  }

  function drawBackground() {
    const top = p.color('#f8f1df');
    const bottom = p.color('#f2d8bf');
    for (let y = 0; y < p.height; y += 2) {
      const t = y / p.height;
      p.stroke(p.lerpColor(top, bottom, t));
      p.line(0, y, p.width, y);
    }

    p.noStroke();
    p.fill(255, 255, 255, 75);
    p.ellipse(120, 90, 180, 90);
    p.ellipse(680, 110, 210, 110);
    p.fill(226, 198, 166, 180);
    p.rect(0, 655, p.width, 145);
    p.fill(211, 168, 125, 225);
    p.rect(0, 690, p.width, 110);
  }

  function drawSelectionScreen() {
    p.fill(44, 57, 76);
    p.textAlign(p.LEFT, p.TOP);
    p.textSize(34);
    p.text('Breakfast Clock', 45, 40);

    p.fill(70, 87, 110);
    p.textSize(16);
    p.text('1. Click the clock to choose the total cooking time.', 45, 88);
    p.text('2. Press Start Cooking to watch the chef move through each breakfast step.', 45, 112);

    drawSelectorClock();
    drawPreviewPanel();
    drawButton(layout.startButton, 'Start Cooking', '#d96c4f', '#f7f3ea');

    p.fill(84, 100, 122);
    p.textAlign(p.CENTER, p.CENTER);
    p.textSize(14);
    p.text('The step list on the right previews how your total time is divided.', 615, 670);
  }

  function drawSelectorClock() {
    const cx = layout.selector.x;
    const cy = layout.selector.y;

    p.noStroke();
    p.fill(255, 248, 238, 235);
    p.circle(cx, cy, layout.selector.rOuter * 2 + 28);
    p.fill(251, 242, 229);
    p.circle(cx, cy, layout.selector.rOuter * 2);

    p.stroke(205, 171, 140);
    p.strokeWeight(2);
    p.noFill();
    p.circle(cx, cy, layout.selector.rOuter * 2);

    for (let i = 0; i < 12; i += 1) {
      const angle = -p.HALF_PI + i * (p.TWO_PI / 12);
      const value = selectorValues[i];
      const outerX = cx + p.cos(angle) * (layout.selector.rOuter - 10);
      const outerY = cy + p.sin(angle) * (layout.selector.rOuter - 10);
      const innerX = cx + p.cos(angle) * (layout.selector.rOuter - 28);
      const innerY = cy + p.sin(angle) * (layout.selector.rOuter - 28);
      const labelX = cx + p.cos(angle) * (layout.selector.rOuter - 50);
      const labelY = cy + p.sin(angle) * (layout.selector.rOuter - 50);
      const isSelected = value === selectedMinutes;

      p.stroke(isSelected ? p.color('#d96c4f') : p.color(150, 122, 95));
      p.strokeWeight(isSelected ? 4 : 2);
      p.line(innerX, innerY, outerX, outerY);

      p.noStroke();
      p.fill(isSelected ? '#d96c4f' : '#8f7258');
      p.textAlign(p.CENTER, p.CENTER);
      p.textSize(isSelected ? 17 : 14);
      p.text(value, labelX, labelY);
    }

    const handAngle = selectorAngleForMinutes(selectedMinutes);
    p.stroke('#d96c4f');
    p.strokeWeight(5);
    p.line(cx, cy, cx + p.cos(handAngle) * (layout.selector.rOuter - 64), cy + p.sin(handAngle) * (layout.selector.rOuter - 64));
    p.noStroke();
    p.fill('#d96c4f');
    p.circle(cx, cy, 14);

    p.fill(255, 251, 246);
    p.circle(cx, cy, layout.selector.rInner * 2);
    p.fill(44, 57, 76);
    p.textAlign(p.CENTER, p.CENTER);
    p.textSize(20);
    p.text('Cook Time', cx, cy - 24);
    p.textSize(36);
    p.text(selectedMinutes + ' min', cx, cy + 12);

    p.fill(101, 117, 139);
    p.textSize(14);
    p.text('Ready by ' + getReadyTimeLabel(), cx, cy + 66);
  }

  function drawPreviewPanel() {
    drawPanel(layout.preview.x, layout.preview.y, layout.preview.w, layout.preview.h, '#fff8ee');

    p.fill(44, 57, 76);
    p.textAlign(p.LEFT, p.TOP);
    p.textSize(24);
    p.text('Cooking Plan', layout.preview.x + 22, layout.preview.y + 18);

    p.fill(94, 108, 126);
    p.textSize(14);
    p.text('Every step keeps its own countdown, so you can always see what is left.', layout.preview.x + 22, layout.preview.y + 54, layout.preview.w - 44, 48);

    for (let i = 0; i < steps.length; i += 1) {
      const rowY = layout.preview.y + 110 + i * 46;
      const accent = p.color(steps[i].accent);
      p.noStroke();
      p.fill(p.red(accent), p.green(accent), p.blue(accent), 38);
      p.rect(layout.preview.x + 18, rowY, layout.preview.w - 36, 36, 12);

      p.fill(46, 58, 77);
      p.textSize(14);
      p.textAlign(p.LEFT, p.CENTER);
      p.text((i + 1) + '. ' + steps[i].short, layout.preview.x + 30, rowY + 18);

      p.textAlign(p.RIGHT, p.CENTER);
      p.fill(103, 118, 138);
      p.text(formatClock(scheduleSeconds[i]), layout.preview.x + layout.preview.w - 30, rowY + 18);
    }
  }

  function updateCookingState() {
    const elapsed = p.max(0, (p.millis() - startedAt) / 1000);
    if (elapsed >= totalDurationSeconds) {
      phase = 'done';
    }
  }

  function drawCookingScreen() {
    const state = getTimelineState();
    const step = steps[state.stepIndex];

    drawTopHeader(state.remainingTotal, step.short);
    drawScenePanel(step, state);
    drawSidebar(state);
    drawButton(layout.resetButton, 'Reset', '#395b72', '#f7f4eb');
  }

  function drawDoneScreen() {
    drawTopHeader(0, 'Breakfast served');

    p.noStroke();
    p.fill(255, 248, 240, 225);
    p.rect(50, 155, 700, 545, 28);

    p.fill(44, 57, 76);
    p.textAlign(p.CENTER, p.TOP);
    p.textSize(34);
    p.text('All done!', p.width / 2, 182);

    p.fill(100, 112, 126);
    p.textSize(17);
    p.text('The plate and coffee mug are on the table, ready to serve.', p.width / 2, 225);

    drawTableScene();
    drawPlateMeal(370, 515, 220, 1);
    drawCoffeeMug(575, 500, 1.1, true);
    drawChef(180, 500, 1.06, 'serve', 1);
    drawSparkles();
    drawSidebar(null, true);
    drawButton(layout.resetButton, 'Reset', '#395b72', '#f7f4eb');
  }

  function drawTopHeader(remainingTotal, currentStepLabel) {
    drawPanel(28, 22, 744, 96, '#fff8ef');

    p.fill(44, 57, 76);
    p.textAlign(p.LEFT, p.TOP);
    p.textSize(28);
    p.text('Breakfast Clock', 50, 42);

    p.fill(94, 108, 126);
    p.textSize(15);
    p.text('Current time: ' + getCurrentTimeLabel(), 50, 78);
    p.text('Ready by: ' + getReadyTimeLabel(), 220, 78);

    p.textAlign(p.RIGHT, p.TOP);
    p.fill(58, 77, 97);
    p.textSize(18);
    p.text(currentStepLabel, 610, 42);

    drawCountdownClock(686, 70, 34, remainingTotal, totalDurationSeconds);
  }

  function drawCountdownClock(cx, cy, radius, remainingSeconds, fullSeconds) {
    const clampedFull = p.max(fullSeconds, 1);
    const progress = p.constrain(1 - remainingSeconds / clampedFull, 0, 1);

    p.noFill();
    p.stroke(222, 207, 190);
    p.strokeWeight(8);
    p.circle(cx, cy, radius * 2);

    p.stroke('#d96c4f');
    p.strokeWeight(8);
    p.arc(cx, cy, radius * 2, radius * 2, -p.HALF_PI, -p.HALF_PI + progress * p.TWO_PI);

    const handAngle = -p.HALF_PI + progress * p.TWO_PI;
    p.stroke(56, 76, 98);
    p.strokeWeight(3);
    p.line(cx, cy, cx + p.cos(handAngle) * (radius - 8), cy + p.sin(handAngle) * (radius - 8));
    p.noStroke();
    p.fill(56, 76, 98);
    p.circle(cx, cy, 8);

    p.fill(44, 57, 76);
    p.textAlign(p.CENTER, p.CENTER);
    p.textSize(14);
    p.text(formatClock(remainingSeconds), cx, cy + radius + 20);
  }

  function drawScenePanel(step, state) {
    drawPanel(layout.scene.x, layout.scene.y, layout.scene.w, layout.scene.h, '#fff8ee');

    p.fill(44, 57, 76);
    p.textAlign(p.LEFT, p.TOP);
    p.textSize(28);
    p.text(step.short, layout.scene.x + 20, layout.scene.y + 18);

    p.fill(97, 112, 130);
    p.textSize(15);
    p.text(step.detail, layout.scene.x + 20, layout.scene.y + 56, layout.scene.w - 40, 42);

    p.fill(245, 237, 223);
    p.noStroke();
    p.circle(layout.scene.bubbleX, layout.scene.bubbleY, layout.scene.bubbleR * 2 + 24);
    p.fill('#fffef9');
    p.circle(layout.scene.bubbleX, layout.scene.bubbleY, layout.scene.bubbleR * 2);

    p.stroke(214, 194, 167);
    p.strokeWeight(2);
    p.noFill();
    p.circle(layout.scene.bubbleX, layout.scene.bubbleY, layout.scene.bubbleR * 2);

    p.noStroke();
    p.fill(233, 214, 193);
    p.rect(layout.scene.x + 26, 540, layout.scene.w - 52, 125, 18);
    p.fill(208, 170, 129);
    p.rect(layout.scene.x + 26, 566, layout.scene.w - 52, 98, 18);

    const progress = state.stepProgress;
    const cx = layout.scene.bubbleX;
    const cy = layout.scene.bubbleY;

    if (state.stepIndex === 0) drawWashScene(cx, cy, progress);
    if (state.stepIndex === 1) drawChopScene(cx, cy, progress);
    if (state.stepIndex === 2) drawButterScene(cx, cy, progress);
    if (state.stepIndex === 3) drawEggScene(cx, cy, progress);
    if (state.stepIndex === 4) drawBaconScene(cx, cy, progress);
    if (state.stepIndex === 5) drawToastScene(cx, cy, progress);
    if (state.stepIndex === 6) drawSpreadScene(cx, cy, progress);
    if (state.stepIndex === 7) drawCoffeeScene(cx, cy, progress);
    if (state.stepIndex === 8) drawPlateScene(cx, cy, progress);

    p.fill(44, 57, 76);
    p.textAlign(p.LEFT, p.TOP);
    p.textSize(18);
    p.text('Current step left: ' + formatClock(state.currentStepRemaining), layout.scene.x + 20, 680);
    p.fill(96, 112, 130);
    p.textSize(14);
    p.text('Total time left: ' + formatClock(state.remainingTotal), layout.scene.x + 20, 710);
  }

  function drawSidebar(state, allDone) {
    drawPanel(layout.sidebar.x, layout.sidebar.y, layout.sidebar.w, layout.sidebar.h, '#fff8ee');

    p.fill(44, 57, 76);
    p.textAlign(p.LEFT, p.TOP);
    p.textSize(25);
    p.text('Step Times', layout.sidebar.x + 18, layout.sidebar.y + 18);

    p.fill(96, 112, 130);
    p.textSize(14);
    p.text(allDone ? 'Everything is finished.' : 'Each step keeps a live countdown.', layout.sidebar.x + 18, layout.sidebar.y + 52);

    for (let i = 0; i < steps.length; i += 1) {
      const rowY = layout.sidebar.y + 92 + i * 55;
      const isDone = allDone || (state && i < state.stepIndex);
      const isCurrent = state && i === state.stepIndex && !allDone;
      const accent = p.color(steps[i].accent);

      p.noStroke();
      p.fill(
        isCurrent ? p.color(245, 233, 220) :
          isDone ? p.color(234, 241, 232) :
            p.color(248, 243, 236)
      );
      p.rect(layout.sidebar.x + 14, rowY, layout.sidebar.w - 28, 43, 14);

      p.fill(p.red(accent), p.green(accent), p.blue(accent), 220);
      p.rect(layout.sidebar.x + 18, rowY + 10, 8, 23, 5);

      p.fill(46, 58, 77);
      p.textAlign(p.LEFT, p.TOP);
      p.textSize(13);
      p.text((i + 1) + '. ' + steps[i].short, layout.sidebar.x + 34, rowY + 7);

      p.fill(isDone ? '#50745f' : isCurrent ? '#c15f46' : '#7f8c99');
      p.textSize(12);
      const label = isDone ? 'done' : formatClock(getStepRemaining(i, state, allDone));
      p.text(label, layout.sidebar.x + 34, rowY + 23);

      const barX = layout.sidebar.x + 124;
      const barY = rowY + 27;
      const barW = 92;
      const progress = getCompletionForStep(i, state, allDone);
      p.noStroke();
      p.fill(226, 220, 212);
      p.rect(barX, barY, barW, 7, 4);
      p.fill(isDone ? '#7bb174' : p.color(steps[i].accent));
      p.rect(barX, barY, barW * progress, 7, 4);
    }
  }

  function drawWashScene(cx, cy, progress) {
    drawCounterBase(cx, cy, 250);
    drawChef(cx - 90, cy + 40, 1, 'wash', progress);

    p.push();
    p.translate(cx + 42, cy + 42);
    p.noStroke();
    p.fill(197, 211, 221);
    p.rect(-82, -40, 165, 22, 8);
    p.fill(152, 169, 182);
    p.rect(-72, -18, 145, 54, 12);
    p.fill(99, 185, 222);
    p.rect(-60, -4, 120, 30, 10);
    p.fill(214, 236, 245, 180);
    p.rect(-56, -2, 112, 24, 9);

    p.stroke(125, 143, 157);
    p.strokeWeight(7);
    p.noFill();
    p.arc(-4, -56, 50, 36, p.PI, 0);
    p.line(21, -56, 33, -56);
    p.noStroke();
    p.fill(99, 185, 222, 170);
    for (let i = 0; i < 6; i += 1) {
      const wave = p.sin(p.frameCount * 0.08 + i) * 4;
      p.ellipse(-25 + i * 18, -14 + wave, 10, 16);
    }
    drawVegetables(-8, 8, 0.78, true);
    p.pop();
  }

  function drawChopScene(cx, cy, progress) {
    drawCounterBase(cx, cy, 255);
    drawChef(cx - 95, cy + 38, 1, 'chop', progress);

    p.push();
    p.translate(cx + 48, cy + 38);
    p.noStroke();
    p.fill(182, 124, 86);
    p.rect(-88, -10, 175, 82, 12);
    p.fill(156, 96, 62);
    p.rect(-80, -4, 160, 70, 10);
    drawVegetables(-18, 22, 0.72, false);

    const lift = p.sin(progress * p.TWO_PI * 6) * 14;
    p.stroke(74, 84, 96);
    p.strokeWeight(5);
    p.line(32, -10 - lift, 64, 14 - lift);
    p.noStroke();
    p.fill(210);
    p.quad(64, 14 - lift, 89, 20 - lift, 56, 44 - lift, 38, 28 - lift);
    p.fill(132, 95, 64);
    p.rect(18, -18 - lift, 18, 12, 4);
    for (let i = 0; i < 6; i += 1) {
      p.fill(88, 170, 84);
      p.rect(-20 + i * 16, 45 + (i % 2) * 4, 10, 8, 3);
    }
    p.pop();
  }

  function drawButterScene(cx, cy, progress) {
    drawCounterBase(cx, cy, 270);
    drawChef(cx - 108, cy + 43, 1, 'pan', progress);
    drawStove(cx + 38, cy + 52);

    const melt = p.constrain(progress * 1.2, 0, 1);
    p.push();
    p.translate(cx + 36, cy + 46);
    drawPan(0, 0, 155, 72);
    p.noStroke();
    p.fill('#ffe08a');
    p.ellipse(0, 8, 24 + melt * 34, 18 + melt * 10);
    p.fill('#fff0a8');
    p.rect(-16 + melt * 4, -12 + melt * 6, 30 - melt * 14, 24 - melt * 12, 5);
    drawSteam(0, -16, 3, 0.7 + melt * 0.5);
    p.pop();
  }

  function drawEggScene(cx, cy, progress) {
    drawCounterBase(cx, cy, 270);
    drawChef(cx - 108, cy + 43, 1, 'pan', progress);
    drawStove(cx + 38, cy + 52);

    p.push();
    p.translate(cx + 36, cy + 46);
    drawPan(0, 0, 155, 72);
    p.noStroke();
    p.fill(255);
    p.beginShape();
    p.vertex(-34, 0);
    p.bezierVertex(-40, -24, 8, -30, 28, -8);
    p.bezierVertex(54, 2, 34, 30, -4, 28);
    p.bezierVertex(-30, 30, -48, 14, -34, 0);
    p.endShape(p.CLOSE);
    p.fill('#f4c542');
    p.circle(6, 3, 28 - progress * 2);
    drawSteam(-8, -18, 4, 0.95);
    p.pop();
  }

  function drawBaconScene(cx, cy, progress) {
    drawCounterBase(cx, cy, 270);
    drawChef(cx - 108, cy + 43, 1, 'pan', progress);
    drawStove(cx + 38, cy + 52);

    p.push();
    p.translate(cx + 36, cy + 46);
    drawPan(0, 0, 155, 72);
    drawBaconStrip(-20, 3, 0.95, progress);
    drawBaconStrip(18, -3, 0.88, progress + 0.2);
    drawSteam(0, -20, 4, 1.1);
    p.pop();
  }

  function drawToastScene(cx, cy, progress) {
    drawCounterBase(cx, cy, 255);
    drawChef(cx - 95, cy + 44, 1, 'toast', progress);

    p.push();
    p.translate(cx + 38, cy + 50);
    p.noStroke();
    p.fill(184, 70, 57);
    p.rect(-62, 0, 122, 76, 24);
    p.fill(255, 230, 200);
    p.rect(-44, -8, 88, 22, 10);
    p.fill(103, 48, 39);
    p.rect(-22, 24, 44, 8, 4);
    p.fill(130);
    p.rect(48, 24, 10, 28, 4);

    const pop = p.sin(progress * p.PI);
    drawBreadSlice(-20, -18 - pop * 36, 0.9, true);
    drawBreadSlice(18, -14 - pop * 28, 0.85, true);
    p.pop();
  }

  function drawSpreadScene(cx, cy, progress) {
    drawCounterBase(cx, cy, 255);
    drawChef(cx - 95, cy + 42, 1, 'spread', progress);

    p.push();
    p.translate(cx + 44, cy + 46);
    p.noStroke();
    p.fill(188, 127, 89);
    p.rect(-90, -10, 178, 82, 12);
    drawBreadSlice(-18, 20, 1.05, true);

    p.fill(255, 233, 162, 220);
    const butterW = 34 + progress * 34;
    p.rect(-36, 8, butterW, 14, 7);

    const knifeX = -6 + progress * 72;
    p.stroke(77, 88, 100);
    p.strokeWeight(5);
    p.line(knifeX - 26, 0, knifeX, 20);
    p.noStroke();
    p.fill(204);
    p.quad(knifeX, 20, knifeX + 26, 27, knifeX + 6, 42, knifeX - 8, 28);
    p.fill(136, 98, 69);
    p.rect(knifeX - 40, -8, 18, 12, 4);
    p.pop();
  }

  function drawCoffeeScene(cx, cy, progress) {
    drawCounterBase(cx, cy, 255);
    drawChef(cx - 98, cy + 42, 1, 'coffee', progress);

    p.push();
    p.translate(cx + 44, cy + 38);
    p.noStroke();
    p.fill(70, 79, 92);
    p.rect(-70, -34, 92, 130, 18);
    p.fill(99, 112, 128);
    p.rect(-50, -16, 52, 58, 12);
    p.fill(220);
    p.circle(-24, 12, 16);

    drawCoffeeMug(52, 58, 0.88, false);

    const streamH = progress * 84;
    p.stroke(96, 56, 32);
    p.strokeWeight(7);
    p.line(6, 16, 6, 16 + streamH);
    p.noStroke();
    drawSteam(52, 30, 3, 0.55 + progress * 0.5);
    p.pop();
  }

  function drawPlateScene(cx, cy, progress) {
    drawCounterBase(cx, cy, 270);
    drawChef(cx - 102, cy + 44, 1, 'serve', progress);

    p.push();
    p.translate(cx + 42, cy + 48);
    p.noStroke();
    p.fill(243);
    p.ellipse(0, 0, 170, 124);
    p.fill(255);
    p.ellipse(0, -2, 130, 92);

    const reveal = p.constrain(progress, 0, 1);
    drawPlateMeal(0, 0, 122, reveal);
    p.pop();
  }

  function drawCounterBase(cx, cy, width) {
    p.noStroke();
    p.fill(224, 180, 134);
    p.rect(cx - width / 2, cy + 86, width, 28, 10);
    p.fill(195, 145, 104);
    p.rect(cx - width / 2, cy + 108, width, 30, 10);
  }

  function drawChef(x, y, scale, pose, progress) {
    p.push();
    p.translate(x, y);
    p.scale(scale);

    p.noStroke();
    p.fill(44, 57, 76, 35);
    p.ellipse(0, 138, 86, 20);

    p.fill('#ffffff');
    p.rect(-28, -92, 56, 26, 8);
    p.circle(-22, -72, 32);
    p.circle(0, -84, 34);
    p.circle(22, -72, 32);
    p.fill('#f1c7a2');
    p.circle(0, -44, 48);
    p.fill(58, 48, 42);
    p.rect(-24, -56, 48, 8, 5);
    p.fill(44, 57, 76);
    p.circle(-8, -44, 4);
    p.circle(8, -44, 4);
    p.noFill();
    p.stroke(108, 70, 54);
    p.strokeWeight(2);
    p.arc(0, -34, 16, 10, 0, p.PI);

    p.noStroke();
    p.fill('#6a8ca3');
    p.rect(-26, -18, 52, 88, 18);
    p.fill('#f7f5ef');
    p.rect(-14, -14, 28, 58, 12);
    p.fill('#6a8ca3');
    p.rect(-10, 70, 16, 44, 8);
    p.rect(2, 70, 16, 44, 8);
    p.fill('#46392f');
    p.rect(-12, 110, 20, 10, 5);
    p.rect(0, 110, 20, 10, 5);

    const sway = p.sin(progress * p.TWO_PI * 2 + p.frameCount * 0.02) * 6;
    let leftHand = { x: -52, y: 10 };
    let rightHand = { x: 52, y: 10 };

    if (pose === 'wash') {
      leftHand = { x: -18, y: 18 + sway };
      rightHand = { x: 36, y: 18 - sway };
    } else if (pose === 'chop') {
      leftHand = { x: -10, y: 26 };
      rightHand = { x: 46, y: -10 - p.abs(sway) * 2 };
    } else if (pose === 'pan') {
      leftHand = { x: -14, y: 30 };
      rightHand = { x: 44, y: 30 + sway * 0.4 };
    } else if (pose === 'toast') {
      leftHand = { x: -18, y: 28 };
      rightHand = { x: 42, y: 8 + sway };
    } else if (pose === 'spread') {
      leftHand = { x: -16, y: 32 };
      rightHand = { x: 42, y: 18 - sway * 0.5 };
    } else if (pose === 'coffee') {
      leftHand = { x: -12, y: 26 };
      rightHand = { x: 36, y: 10 - sway * 0.3 };
    } else if (pose === 'serve') {
      leftHand = { x: -44, y: 18 };
      rightHand = { x: 44, y: 18 };
    }

    p.stroke('#f1c7a2');
    p.strokeWeight(9);
    p.line(-18, -2, leftHand.x, leftHand.y);
    p.line(18, -2, rightHand.x, rightHand.y);
    p.noStroke();
    p.fill('#f1c7a2');
    p.circle(leftHand.x, leftHand.y, 11);
    p.circle(rightHand.x, rightHand.y, 11);
    p.pop();
  }

  function drawStove(x, y) {
    p.push();
    p.translate(x, y);
    p.noStroke();
    p.fill(90, 98, 112);
    p.rect(-86, 18, 172, 28, 12);
    p.fill(44, 52, 66);
    p.rect(-80, -8, 160, 42, 16);
    p.fill(88, 154, 210, 130);
    p.circle(-34, 14, 34);
    p.circle(34, 14, 34);
    p.pop();
  }

  function drawPan(x, y, w, h) {
    p.push();
    p.translate(x, y);
    p.noStroke();
    p.fill(48);
    p.ellipse(0, 0, w, h);
    p.fill(27);
    p.ellipse(0, 0, w * 0.9, h * 0.88);
    p.fill(62);
    p.rotate(-0.18);
    p.rect(w * 0.38, -4, 78, 12, 5);
    p.pop();
  }

  function drawVegetables(x, y, scale, wet) {
    p.push();
    p.translate(x, y);
    p.scale(scale);
    p.noStroke();
    p.fill(93, 179, 97);
    p.ellipse(-20, 4, 24, 20);
    p.ellipse(-8, -6, 20, 18);
    p.ellipse(-2, 8, 21, 16);
    p.fill(241, 136, 66);
    p.triangle(18, -10, 36, 0, 20, 14);
    p.fill(61, 148, 69);
    p.rect(14, -16, 10, 8, 3);
    p.fill(224, 86, 71);
    p.circle(38, 6, 15);
    p.fill(74, 160, 84);
    p.rect(34, -5, 8, 5, 3);

    if (wet) {
      p.fill(180, 227, 245, 180);
      for (let i = 0; i < 5; i += 1) {
        p.circle(-30 + i * 16, 18 + (i % 2) * 6, 7);
      }
    }
    p.pop();
  }

  function drawSteam(x, y, count, strength) {
    for (let i = 0; i < count; i += 1) {
      const offset = i * 14 - ((count - 1) * 14) / 2;
      const wobble = p.sin(p.frameCount * 0.06 + i) * 4;
      p.fill(255, 255, 255, 90 * strength);
      p.noStroke();
      p.ellipse(x + offset + wobble, y - i * 8, 16, 24);
      p.ellipse(x + offset - wobble * 0.4, y - 18 - i * 10, 12, 20);
    }
  }

  function drawBaconStrip(x, y, scale, phaseOffset) {
    p.push();
    p.translate(x, y);
    p.scale(scale);
    p.stroke(162, 72, 58);
    p.strokeWeight(12);
    p.noFill();
    p.beginShape();
    for (let px = -34; px <= 34; px += 8) {
      const py = p.sin(px * 0.18 + phaseOffset * 3.2) * 8;
      p.vertex(px, py);
    }
    p.endShape();

    p.stroke(233, 181, 142);
    p.strokeWeight(5);
    p.beginShape();
    for (let px = -34; px <= 34; px += 8) {
      const py = p.sin(px * 0.18 + phaseOffset * 3.2 + 0.5) * 5;
      p.vertex(px, py);
    }
    p.endShape();
    p.pop();
  }

  function drawBreadSlice(x, y, scale, toasted) {
    p.push();
    p.translate(x, y);
    p.scale(scale);
    p.noStroke();
    p.fill(toasted ? '#d7a56d' : '#f0d5af');
    p.beginShape();
    p.vertex(-24, 26);
    p.vertex(-24, 0);
    p.bezierVertex(-24, -22, 24, -22, 24, 0);
    p.vertex(24, 26);
    p.endShape(p.CLOSE);
    p.fill(255, 240, 214, toasted ? 50 : 115);
    p.rect(-18, 4, 36, 16, 7);
    p.pop();
  }

  function drawCoffeeMug(x, y, scale, steamy) {
    p.push();
    p.translate(x, y);
    p.scale(scale);
    p.noStroke();
    p.fill('#f6f1ea');
    p.rect(-26, -24, 52, 42, 10);
    p.fill('#7b4f2f');
    p.rect(-22, -18, 44, 26, 8);
    p.noFill();
    p.stroke('#f6f1ea');
    p.strokeWeight(5);
    p.arc(28, -4, 20, 20, -p.HALF_PI, p.HALF_PI);
    if (steamy) {
      p.noStroke();
      drawSteam(0, -32, 3, 1);
    }
    p.pop();
  }

  function drawPlateMeal(x, y, size, reveal) {
    const clamped = p.constrain(reveal, 0, 1);
    p.push();
    p.translate(x, y);
    p.scale(size / 220);

    p.noStroke();
    p.fill(244);
    p.ellipse(0, 0, 220, 158);
    p.fill(255);
    p.ellipse(0, -3, 166, 116);

    const vegOffset = p.lerp(-64, -26, clamped);
    const baconOffset = p.lerp(78, 36, clamped);
    const toastOffset = p.lerp(96, 28, clamped);
    const eggOffset = p.lerp(-88, -12, clamped);

    p.push();
    p.translate(vegOffset, -34);
    drawVegetables(0, 0, 1.05, false);
    p.pop();

    p.push();
    p.translate(eggOffset, 18);
    p.noStroke();
    p.fill(255);
    p.beginShape();
    p.vertex(-24, 4);
    p.bezierVertex(-30, -18, 10, -24, 28, -6);
    p.bezierVertex(46, 6, 28, 28, -6, 24);
    p.bezierVertex(-24, 20, -34, 10, -24, 4);
    p.endShape(p.CLOSE);
    p.fill('#f4c542');
    p.circle(4, 2, 24);
    p.pop();

    p.push();
    p.translate(baconOffset, -8);
    drawBaconStrip(0, -10, 0.95, 0.8);
    drawBaconStrip(4, 18, 0.9, 1.3);
    p.pop();

    p.push();
    p.translate(toastOffset, 28);
    drawBreadSlice(0, 0, 1.1, true);
    p.fill(255, 236, 178, 185);
    p.rect(-22, -6, 38, 12, 7);
    p.pop();
    p.pop();
  }

  function drawTableScene() {
    p.noStroke();
    p.fill(224, 182, 136);
    p.rect(90, 590, 620, 42, 18);
    p.fill(198, 151, 108);
    p.rect(90, 625, 620, 92, 18);
  }

  function drawSparkles() {
    const sparks = [
      { x: 286, y: 302, r: 12 },
      { x: 525, y: 288, r: 10 },
      { x: 626, y: 370, r: 9 },
      { x: 170, y: 348, r: 8 },
      { x: 360, y: 258, r: 10 },
    ];
    p.stroke('#f3c65a');
    p.strokeWeight(2);
    for (let i = 0; i < sparks.length; i += 1) {
      const s = sparks[i];
      p.line(s.x - s.r, s.y, s.x + s.r, s.y);
      p.line(s.x, s.y - s.r, s.x, s.y + s.r);
      p.line(s.x - s.r * 0.65, s.y - s.r * 0.65, s.x + s.r * 0.65, s.y + s.r * 0.65);
      p.line(s.x + s.r * 0.65, s.y - s.r * 0.65, s.x - s.r * 0.65, s.y + s.r * 0.65);
    }
  }

  function drawPanel(x, y, w, h, fillColor) {
    p.noStroke();
    p.fill(0, 0, 0, 18);
    p.rect(x + 6, y + 7, w, h, 24);
    p.fill(fillColor);
    p.rect(x, y, w, h, 24);
  }

  function drawButton(rect, label, fillColor, textColor) {
    const hovered = pointInRect(p.mouseX, p.mouseY, rect);
    const base = p.color(fillColor);
    p.noStroke();
    p.fill(0, 0, 0, 24);
    p.rect(rect.x + 4, rect.y + 5, rect.w, rect.h, 18);
    p.fill(hovered ? p.lerpColor(base, p.color(255), 0.12) : base);
    p.rect(rect.x, rect.y, rect.w, rect.h, 18);
    p.fill(textColor);
    p.textAlign(p.CENTER, p.CENTER);
    p.textSize(20);
    p.text(label, rect.x + rect.w / 2, rect.y + rect.h / 2 + 1);
  }

  function detectSelectorClick(mx, my) {
    const dx = mx - layout.selector.x;
    const dy = my - layout.selector.y;
    const distance = p.sqrt(dx * dx + dy * dy);
    if (distance < layout.selector.rInner - 18 || distance > layout.selector.rOuter + 18) {
      return null;
    }

    let angle = p.atan2(dy, dx) + p.HALF_PI;
    if (angle < 0) angle += p.TWO_PI;
    const slot = Math.round(angle / (p.TWO_PI / 12)) % 12;
    return selectorValues[slot];
  }

  function selectorAngleForMinutes(minutes) {
    const slot = selectorValues.indexOf(minutes);
    return -p.HALF_PI + slot * (p.TWO_PI / 12);
  }

  function getTimelineState() {
    const elapsed = phase === 'cooking'
      ? p.constrain((p.millis() - startedAt) / 1000, 0, totalDurationSeconds)
      : totalDurationSeconds;

    let runningTotal = 0;
    for (let i = 0; i < scheduleSeconds.length; i += 1) {
      const stepStart = runningTotal;
      const stepEnd = runningTotal + scheduleSeconds[i];
      if (elapsed < stepEnd) {
        const stepElapsed = elapsed - stepStart;
        const currentStepRemaining = p.max(0, scheduleSeconds[i] - stepElapsed);
        return {
          stepIndex: i,
          stepProgress: scheduleSeconds[i] === 0 ? 1 : p.constrain(stepElapsed / scheduleSeconds[i], 0, 1),
          stepElapsed: stepElapsed,
          currentStepRemaining: currentStepRemaining,
          remainingTotal: p.max(0, totalDurationSeconds - elapsed),
        };
      }
      runningTotal = stepEnd;
    }

    return {
      stepIndex: steps.length - 1,
      stepProgress: 1,
      stepElapsed: scheduleSeconds[scheduleSeconds.length - 1],
      currentStepRemaining: 0,
      remainingTotal: 0,
    };
  }

  function getStepRemaining(index, state, allDone) {
    if (allDone || !state) return 0;
    if (index < state.stepIndex) return 0;
    if (index === state.stepIndex) return state.currentStepRemaining;
    return scheduleSeconds[index];
  }

  function getCompletionForStep(index, state, allDone) {
    if (allDone) return 1;
    if (!state) return 0;
    if (index < state.stepIndex) return 1;
    if (index > state.stepIndex) return 0;
    return p.constrain(state.stepProgress, 0, 1);
  }

  function pointInRect(px, py, rect) {
    return px >= rect.x && px <= rect.x + rect.w && py >= rect.y && py <= rect.y + rect.h;
  }

  function formatClock(seconds) {
    const safe = p.max(0, Math.ceil(seconds));
    const mins = Math.floor(safe / 60);
    const secs = safe % 60;
    return p.nf(mins, 2) + ':' + p.nf(secs, 2);
  }

  function getCurrentTimeLabel() {
    const now = new Date();
    return formatTimeOfDay(now);
  }

  function getReadyTimeLabel() {
    const ready = new Date(getReadyTimestamp());
    return formatTimeOfDay(ready);
  }

  function getReadyTimestamp() {
    if (phase === 'cooking' || phase === 'done') {
      return startedWallClock + totalDurationSeconds * 1000;
    }
    return Date.now() + selectedMinutes * 60 * 1000;
  }

  function formatTimeOfDay(date) {
    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const suffix = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    if (hours === 0) hours = 12;
    return hours + ':' + minutes + ' ' + suffix;
  }
});
