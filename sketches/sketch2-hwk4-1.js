// Instance-mode sketch for tab 2
registerSketch('sk2', function (p) {
  const CANVAS_SIZE = 800;
  const CHEF_SPRITE_PATH = 'images/chef-default-idle.png';
  const CHEF_SPATULA_PATH = 'images/steps3to6-chef-spatula.png';
  const CHEF_KNIFE_PATH = 'images/step2-chef-knife.png';
  const CHEF_CUP_PATH = 'images/step8-chef-cup.jpg';
  const VEGETABLE_SPRITE_PATH = 'images/vegetables-transparent.png';
  const PREP_VEGETABLES_PATH = 'images/vegetables-transparent.png';
  const EGG_PAN_PATH = 'images/step4-egg-pan.png';
  const SINK_PATH = 'images/step1-sink.jpg';
  const BUTTER_PAN_PATH = 'images/step3-butter-pan.png';
  const BACON_PAN_PATH = 'images/step5-bacon-pan.png';
  const PLATE_BREAKFAST_PATH = 'images/step9-plate-breakfast.png';
  const BUTTER_TOAST_PATH = 'images/step7-butter-toast.png';
  const TOASTER_PATH = 'images/step6-toaster.png';
  const COFFEE_CUP_PATH = 'images/step8-coffee-cup.png';
  const FULL_BREAKFAST_PATH = 'images/step10-full-breakfast.png';
  const SCENE_ITEM_Y_SHIFT = -28;
  const selectorValues = [60].concat(Array.from({ length: 59 }, function (_, i) { return i + 1; }));
  const steps = [
    { label: 'Wash vegetables', short: 'Wash vegetables', detail: 'Chef is washing vegetables.', weight: 13, accent: '#79b8f3' },
    { label: 'Cut vegetables', short: 'Cut vegetables', detail: 'Chef is cutting vegetables.', weight: 12, accent: '#7bd389' },
    { label: 'Melt butter in pan', short: 'Melt butter', detail: 'Chef is buttering the pan.', weight: 8, accent: '#ffd166' },
    { label: 'Fry egg in pan', short: 'Fry egg', detail: 'Chef is frying an egg.', weight: 14, accent: '#f6bd60' },
    { label: 'Fry bacon in pan', short: 'Fry bacon', detail: 'Chef is frying bacon.', weight: 13, accent: '#f28482' },
    { label: 'Toast the bread', short: 'Toast bread', detail: 'Chef is making toast.', weight: 11, accent: '#d4a373' },
    { label: 'Spread butter on bread', short: 'Butter bread', detail: 'Chef is buttering toast.', weight: 8, accent: '#f7d794' },
    { label: 'Pour a cup of coffee', short: 'Pour coffee', detail: 'Chef is pouring coffee.', weight: 9, accent: '#8d6e63' },
    { label: 'Plate the breakfast', short: 'Plate dish', detail: 'Chef is plating breakfast.', weight: 12, accent: '#84a59d' },
  ];

  let selectedMinutes = 25;
  let phase = 'select';
  let startedAt = 0;
  let startedWallClock = 0;
  let scheduleSeconds = [];
  let totalDurationSeconds = 0;
  let lastDrawError = null;
  let chefSprite = null;
  let chefSpriteReady = false;
  let chefSpatulaSprite = null;
  let chefSpatulaReady = false;
  let chefKnifeSprite = null;
  let chefKnifeReady = false;
  let chefCupSprite = null;
  let chefCupReady = false;
  let vegetableSprite = null;
  let vegetableSpriteReady = false;
  const sceneImages = {};
  const vegetableSprites = {};

  const layout = {
    selector: { x: 245, y: 365, rOuter: 165, rInner: 80 },
    preview: { x: 500, y: 130, w: 265, h: 600 },
    scene: { x: 35, y: 135, w: 470, h: 610, bubbleX: 270, bubbleY: 410, bubbleR: 178 },
    sidebar: { x: 535, y: 135, w: 220, h: 610 },
    startButton: { x: 530, y: 700, w: 200, h: 54 },
    resetButton: { x: 548, y: 705, w: 164, h: 42 },
  };

  p.preload = function () {
    chefSprite = p.loadImage(
      CHEF_SPRITE_PATH,
      function (img) {
        chefSprite = prepareStandaloneImage(img, {});
        chefSpriteReady = true;
      },
      function (err) {
        chefSpriteReady = false;
        console.warn('Chef avatar failed to load:', err);
      }
    );

    chefSpatulaSprite = p.loadImage(
      CHEF_SPATULA_PATH,
      function (img) {
        chefSpatulaSprite = prepareStandaloneImage(img, {});
        chefSpatulaReady = true;
      },
      function (err) {
        chefSpatulaReady = false;
        console.warn('Chef spatula image failed to load:', err);
      }
    );

    chefKnifeSprite = p.loadImage(
      CHEF_KNIFE_PATH,
      function (img) {
        chefKnifeSprite = prepareStandaloneImage(img, {});
        chefKnifeReady = true;
      },
      function (err) {
        chefKnifeReady = false;
        console.warn('Chef knife image failed to load:', err);
      }
    );

    chefCupSprite = p.loadImage(
      CHEF_CUP_PATH,
      function (img) {
        chefCupSprite = prepareStandaloneImage(img, {});
        chefCupReady = true;
      },
      function (err) {
        chefCupReady = false;
        console.warn('Chef cup image failed to load:', err);
      }
    );

    vegetableSprite = p.loadImage(
      VEGETABLE_SPRITE_PATH,
      function (img) {
        prepareVegetableSprites(img);
        vegetableSpriteReady = true;
      },
      function (err) {
        vegetableSpriteReady = false;
        console.warn('Vegetable sprite sheet failed to load:', err);
      }
    );

    loadSceneAsset('eggPan', EGG_PAN_PATH, { tolerance: 46 });
    loadSceneAsset('prepVegetables', PREP_VEGETABLES_PATH, {});
    loadSceneAsset('sink', SINK_PATH, { tolerance: 36 });
    loadSceneAsset('butterPan', BUTTER_PAN_PATH, { tolerance: 42, crop: { x: 0.02, y: 0.0, w: 0.96, h: 0.84 } });
    loadSceneAsset('baconPan', BACON_PAN_PATH, {});
    loadSceneAsset('plateBreakfast', PLATE_BREAKFAST_PATH, { tolerance: 34 });
    loadSceneAsset('toaster', TOASTER_PATH, {});
    loadSceneAsset('butterToast', BUTTER_TOAST_PATH, { tolerance: 46 });
    loadSceneAsset('coffeeCup', COFFEE_CUP_PATH, { tolerance: 20 });
    loadSceneAsset('fullBreakfast', FULL_BREAKFAST_PATH, { tolerance: 36, crop: { x: 0.0, y: 0.0, w: 1.0, h: 0.84 } });
  };

  p.setup = function () {
    p.createCanvas(CANVAS_SIZE, CANVAS_SIZE);
    p.canvas.style.display = 'block';
    p.textFont('Georgia');
    rebuildSchedule();
  };

  p.draw = function () {
    try {
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

      lastDrawError = null;
    } catch (err) {
      lastDrawError = err;
      console.error('sk2 draw error:', err);
      drawErrorFallback(err);
    } finally {
      drawCanvasFrame();
    }
  };

  function drawCanvasFrame() {
    // Keep the familiar homework frame visible even if inner drawing changes.
    p.noFill();
    p.stroke(26, 37, 56, 90);
    p.strokeWeight(1);
    p.rect(0, 0, p.width - 1, p.height - 1);
  }

  function drawErrorFallback(err) {
    p.background(255);
    p.noStroke();
    p.fill(180, 60, 60);
    p.textAlign(p.CENTER, p.CENTER);
    p.textSize(30);
    p.text('HWK #4. A', p.width / 2, p.height / 2 - 50);

    p.fill(60);
    p.textSize(18);
    p.text('Canvas loaded, but the sketch hit an error.', p.width / 2, p.height / 2);
    p.textSize(14);
    p.text('Open the browser console to see the exact message.', p.width / 2, p.height / 2 + 28);

    if (err && err.message) {
      p.fill(110, 40, 40);
      p.text(err.message, p.width / 2, p.height / 2 + 58, 620, 80);
    }
  }

  p.mousePressed = function () {
    if (lastDrawError) {
      return;
    }

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
    p.fill(70, 87, 110);
    p.textSize(16);
    p.text('1. Click the clock to choose the total cooking time.\n2. Press Start Cooking to watch the chef move through each breakfast step.', 45, 48, 390, 54);

    drawSelectorClock();
    drawPreviewPanel();
    drawButton(layout.startButton, 'Start Cooking', '#d96c4f', '#f7f3ea');
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

    for (let i = 0; i < selectorValues.length; i += 1) {
      const angle = -p.HALF_PI + i * (p.TWO_PI / selectorValues.length);
      const value = selectorValues[i];
      const outerX = cx + p.cos(angle) * (layout.selector.rOuter - 10);
      const outerY = cy + p.sin(angle) * (layout.selector.rOuter - 10);
      const isMajor = value === 60 || value % 5 === 0;
      const innerX = cx + p.cos(angle) * (layout.selector.rOuter - (isMajor ? 28 : 20));
      const innerY = cy + p.sin(angle) * (layout.selector.rOuter - (isMajor ? 28 : 20));
      const labelX = cx + p.cos(angle) * (layout.selector.rOuter - 50);
      const labelY = cy + p.sin(angle) * (layout.selector.rOuter - 50);
      const isSelected = value === selectedMinutes;

      p.stroke(isSelected ? p.color('#d96c4f') : p.color(150, 122, 95));
      p.strokeWeight(isSelected ? 4 : isMajor ? 2 : 1);
      p.line(innerX, innerY, outerX, outerY);

      if (isSelected || isMajor || value === 1) {
        p.noStroke();
        p.fill(isSelected ? '#d96c4f' : '#8f7258');
        p.textAlign(p.CENTER, p.CENTER);
        p.textSize(isSelected ? 16 : 11);
        p.text(value, labelX, labelY);
      }
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
    p.text('Each step has its own timer.\nSee the time split here.', layout.preview.x + 22, layout.preview.y + 54, layout.preview.w - 44, 40);

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

    p.fill(84, 100, 122);
    p.textAlign(p.CENTER, p.TOP);
    p.textSize(14);
    p.text('Right panel preview:\nstep times', layout.preview.x + layout.preview.w / 2, layout.preview.y + layout.preview.h - 64);
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
    const doneContentX = 315;

    p.noStroke();
    p.fill(255, 248, 240, 225);
    p.rect(50, 155, 700, 545, 28);
    drawSparkles();

    p.fill(44, 57, 76);
    p.textAlign(p.CENTER, p.TOP);
    p.textSize(34);
    p.text('All done!', doneContentX, 182);

    p.fill(100, 112, 126);
    p.textSize(17);
    p.text('Breakfast is ready.\nCoffee is on the table.', doneContentX, 225);

    drawTableScene();
    if (!drawSceneImage('fullBreakfast', 305, 490 + SCENE_ITEM_Y_SHIFT, 380, 255, 0)) {
      drawPlateMeal(300, 515 + SCENE_ITEM_Y_SHIFT, 220, 1);
      drawCoffeeMug(480, 500 + SCENE_ITEM_Y_SHIFT, 1.1, true);
    }
    drawSidebar(null, true);
    drawButton(layout.resetButton, 'Reset', '#395b72', '#f7f4eb');
  }

  function drawTopHeader(remainingTotal, currentStepLabel) {
    drawPanel(28, 22, 744, 96, '#fff8ef');

    p.fill(94, 108, 126);
    p.textAlign(p.LEFT, p.TOP);
    p.textSize(15);
    p.text('Current time: ' + getCurrentTimeLabel(), 50, 46);
    p.text('Ready by: ' + getReadyTimeLabel(), 50, 68);

    p.textAlign(p.RIGHT, p.TOP);
    p.fill(58, 77, 97);
    p.textSize(18);
    p.text(currentStepLabel, 610, 48);

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
    p.text(formatClock(remainingSeconds, phase === 'cooking'), cx, cy + radius + 20);
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
    p.text('Current step left: ' + formatClock(state.currentStepRemaining, true), layout.scene.x + 20, 680);
    p.fill(96, 112, 130);
    p.textSize(14);
    p.text('Total time left: ' + formatClock(state.remainingTotal, true), layout.scene.x + 20, 710);
  }

  function drawSidebar(state, allDone) {
    drawPanel(layout.sidebar.x, layout.sidebar.y, layout.sidebar.w, layout.sidebar.h, '#fff8ee');

    p.fill(44, 57, 76);
    p.textAlign(p.LEFT, p.TOP);
    p.textSize(25);
    p.text('Step Times', layout.sidebar.x + 18, layout.sidebar.y + 18);

    p.fill(96, 112, 130);
    p.textSize(14);
    p.text(allDone ? 'Everything is finished.\nAll steps are done.' : 'Live countdowns.\nCheck each step here.', layout.sidebar.x + 18, layout.sidebar.y + 52);

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
      const label = isDone ? 'done' : formatClock(getStepRemaining(i, state, allDone), isCurrent && !allDone);
      p.text(label, layout.sidebar.x + 34, rowY + 23);

      const barX = layout.sidebar.x + 114;
      const barY = rowY + 27;
      const barW = 84;
      const progress = getCompletionForStep(i, state, allDone);
      p.noStroke();
      p.fill(226, 220, 212);
      p.rect(barX, barY, barW, 7, 4);
      p.fill(isDone ? '#7bb174' : p.color(steps[i].accent));
      p.rect(barX, barY, barW * progress, 7, 4);
    }
  }

  function drawWashScene(cx, cy, progress) {
    drawCounterBase(cx, cy, 280);
    drawChef(cx - 108, cy + 44, 1, 'wash', progress);

    drawSceneImage('sink', cx + 48, cy + 28 + SCENE_ITEM_Y_SHIFT, 230, 170, 0);
    p.push();
    p.translate(cx + 48, cy + 30 + SCENE_ITEM_Y_SHIFT);
    p.noStroke();
    p.fill(130, 202, 236, 120);
    p.ellipse(0, 24, 122, 34);
    if (!drawSceneImage('prepVegetables', 0, 12, 128, 78, 0)) {
      drawVegetables(-34, 16, 0.75, true);
      drawVegetables(18, 20, 0.58, true);
    }
    p.pop();
  }

  function drawChopScene(cx, cy, progress) {
    drawCounterBase(cx, cy, 255);

    p.push();
    p.translate(cx + 48, cy + 38 + SCENE_ITEM_Y_SHIFT);
    p.noStroke();
    p.fill(182, 124, 86);
    p.rect(-88, -10, 175, 82, 12);
    p.fill(156, 96, 62);
    p.rect(-80, -4, 160, 70, 10);
    if (!drawSceneImage('prepVegetables', 0, 18, 150, 90, 0)) {
      drawVegetables(-16, 22, 0.7, false);
    }
    p.pop();

    drawChef(cx - 102, cy + 42, 1, 'chop', progress);
  }

  function drawButterScene(cx, cy, progress) {
    drawCounterBase(cx, cy, 270);
    drawChef(cx - 108, cy + 43, 1, 'pan', progress);
    if (!drawSceneImage('butterPan', cx + 42, cy + 22 + SCENE_ITEM_Y_SHIFT, 250, 220, 0)) {
      drawStove(cx + 38, cy + 52);
      const melt = p.constrain(progress * 1.2, 0, 1);
      p.push();
      p.translate(cx + 36, cy + 46 + SCENE_ITEM_Y_SHIFT);
      drawPan(0, 0, 155, 72);
      p.noStroke();
      p.fill('#ffe08a');
      p.ellipse(0, 8, 24 + melt * 34, 18 + melt * 10);
      p.fill('#fff0a8');
      p.rect(-16 + melt * 4, -12 + melt * 6, 30 - melt * 14, 24 - melt * 12, 5);
      drawSteam(0, -16, 3, 0.7 + melt * 0.5);
      p.pop();
    }
  }

  function drawEggScene(cx, cy, progress) {
    drawCounterBase(cx, cy, 270);
    drawChef(cx - 108, cy + 43, 1, 'pan', progress);
    if (!drawSceneImage('eggPan', cx + 42, cy + 22 + SCENE_ITEM_Y_SHIFT, 250, 250, 0)) {
      drawStove(cx + 38, cy + 52);
      p.push();
      p.translate(cx + 36, cy + 46 + SCENE_ITEM_Y_SHIFT);
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
  }

  function drawBaconScene(cx, cy, progress) {
    drawCounterBase(cx, cy, 270);
    drawChef(cx - 108, cy + 43, 1, 'pan', progress);
    if (!drawSceneImage('baconPan', cx + 42, cy - 2 + SCENE_ITEM_Y_SHIFT, 250, 210, 0)) {
      drawStove(cx + 38, cy + 52);
      p.push();
      p.translate(cx + 36, cy + 22 + SCENE_ITEM_Y_SHIFT);
      drawPan(0, 0, 155, 72);
      drawBaconStrip(-20, 3, 0.95, progress);
      drawBaconStrip(18, -3, 0.88, progress + 0.2);
      drawSteam(0, -20, 4, 1.1);
      p.pop();
    }
  }

  function drawToastScene(cx, cy, progress) {
    drawCounterBase(cx, cy, 255);
    drawChef(cx - 95, cy + 44, 1, 'toast', progress);
    if (!drawSceneImage('toaster', cx + 42, cy + 26 + SCENE_ITEM_Y_SHIFT, 250, 210, 0)) {
      p.push();
      p.translate(cx + 38, cy + 50 + SCENE_ITEM_Y_SHIFT);
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
  }

  function drawSpreadScene(cx, cy, progress) {
    drawCounterBase(cx, cy, 255);
    drawChef(cx - 95, cy + 42, 1, 'spread', progress);
    if (!drawSceneImage('butterToast', cx + 46, cy + 30 + SCENE_ITEM_Y_SHIFT, 250, 220, 0)) {
      p.push();
      p.translate(cx + 44, cy + 46 + SCENE_ITEM_Y_SHIFT);
      p.noStroke();
      p.fill(188, 127, 89);
      p.rect(-90, -10, 178, 82, 12);
      drawBreadSlice(-18, 20, 1.05, true);

      p.fill(255, 233, 162, 220);
      const butterW = 34 + progress * 34;
      p.rect(-36, 8, butterW, 14, 7);
      p.pop();
    }
  }

  function drawCoffeeScene(cx, cy, progress) {
    drawCounterBase(cx, cy, 255);
    drawChef(cx, cy - 4, 0.84, 'coffee', progress);
  }

  function drawPlateScene(cx, cy, progress) {
    drawCounterBase(cx, cy, 285);
    if (!drawSceneImage('plateBreakfast', cx, cy + 22 + SCENE_ITEM_Y_SHIFT, 250, 250, 0)) {
      p.push();
      p.translate(cx, cy + 48 + SCENE_ITEM_Y_SHIFT);
      p.noStroke();
      p.fill(243);
      p.ellipse(0, 0, 170, 124);
      p.fill(255);
      p.ellipse(0, -2, 130, 92);

      const reveal = p.constrain(progress, 0, 1);
      drawPlateMeal(0, 0, 122, reveal);
      p.pop();
    }
  }

  function drawCounterBase(cx, cy, width) {
    p.noStroke();
    p.fill(224, 180, 134);
    p.rect(cx - width / 2, cy + 86, width, 28, 10);
    p.fill(195, 145, 104);
    p.rect(cx - width / 2, cy + 108, width, 30, 10);
  }

  function drawChef(x, y, scale, pose, progress) {
    const activeChef = getChefAssetForPose(pose);
    if (activeChef) {
      drawChefImage(activeChef, x, y, scale, pose, progress);
      return;
    }
    drawChefFallback(x, y, scale, pose, progress);
  }

  function getChefAssetForPose(pose) {
    if (isCupPose(pose) && chefCupReady && chefCupSprite) {
      return chefCupSprite;
    }
    if (isKnifePose(pose) && chefKnifeReady && chefKnifeSprite) {
      return chefKnifeSprite;
    }
    if (isSpatulaPose(pose) && chefSpatulaReady && chefSpatulaSprite) {
      return chefSpatulaSprite;
    }
    if (chefSpriteReady && chefSprite) {
      return chefSprite;
    }
    return null;
  }

  function isSpatulaPose(pose) {
    return pose === 'pan' || pose === 'toast';
  }

  function isKnifePose(pose) {
    return pose === 'chop';
  }

  function isCupPose(pose) {
    return pose === 'coffee';
  }

  function drawChefImage(sprite, x, y, scale, pose, progress) {
    const motion = getChefMotion(pose, progress);
    const shadowW = motion.shadowW * scale;
    const shadowH = motion.shadowH * scale;

    p.push();
    p.translate(x + motion.x, y + motion.y);
    p.rotate(motion.angle * 0.35);

    p.noStroke();
    p.fill(44, 57, 76, 30);
    p.ellipse(0, 136, shadowW, shadowH);

    drawSpriteCentered(sprite, motion.spriteX, motion.spriteY, motion.spriteScale * scale);
    p.pop();
  }

  function getChefMotion(pose, progress) {
    const pulse = p.sin(p.frameCount * 0.08 + progress * p.TWO_PI * 2);
    const fast = p.sin(p.frameCount * 0.18 + progress * p.TWO_PI * 6);
    const hop = Math.abs(p.sin(p.frameCount * 0.12 + progress * p.TWO_PI * 2));
    const motion = {
      x: pulse * 5,
      y: -hop * 4 - Math.abs(fast) * 1.5,
      angle: pulse * 0.035,
      spriteScale: 0.38,
      spriteX: 0,
      spriteY: 12,
      shadowW: 50,
      shadowH: 13,
    };

    if (isSpatulaPose(pose)) {
      motion.spriteScale = 0.70;
      motion.spriteY = 10;
      motion.shadowW = 78;
      motion.shadowH = 18;
      motion.x = pulse * 4;
      motion.y = -hop * 3;
      motion.angle = pulse * 0.02;
    }

    if (isKnifePose(pose)) {
      motion.spriteScale = 0.30;
      motion.spriteY = 10;
      motion.shadowW = 42;
      motion.shadowH = 12;
      motion.x = pulse * 3;
      motion.y = -hop * 2.5;
      motion.angle = pulse * 0.018;
    }

    if (isCupPose(pose)) {
      motion.spriteScale = 0.40;
      motion.spriteY = 10;
      motion.shadowW = 50;
      motion.shadowH = 13;
      motion.x = pulse * 3;
      motion.y = -hop * 2.5;
      motion.angle = pulse * 0.015;
    }

    return motion;
  }

  function prepareVegetableSprites(img) {
    vegetableSprites.pumpkin = makeSpriteFromSheet(
      img,
      { x: 0.02, y: 0.05, w: 0.23, h: 0.33 },
      28
    );
    vegetableSprites.broccoli = makeSpriteFromSheet(
      img,
      { x: 0.30, y: 0.02, w: 0.27, h: 0.40 },
      28
    );
    vegetableSprites.tomato = makeSpriteFromSheet(
      img,
      { x: 0.68, y: 0.04, w: 0.22, h: 0.33 },
      28
    );
    vegetableSprites.eggplant = makeSpriteFromSheet(
      img,
      { x: 0.23, y: 0.39, w: 0.22, h: 0.54 },
      28
    );
    vegetableSprites.carrot = makeSpriteFromSheet(
      img,
      { x: 0.46, y: 0.39, w: 0.18, h: 0.54 },
      28
    );
    vegetableSprites.cucumber = makeSpriteFromSheet(
      img,
      { x: 0.72, y: 0.37, w: 0.18, h: 0.55 },
      28
    );
  }

  function loadSceneAsset(key, path, options) {
    p.loadImage(
      path,
      function (img) {
        sceneImages[key] = prepareStandaloneImage(img, options || {});
      },
      function (err) {
        console.warn('Scene image failed to load for ' + key + ':', err);
      }
    );
  }

  function prepareStandaloneImage(img, options) {
    const cfg = options || {};
    let prepared = img;
    if (cfg.crop) {
      const c = cfg.crop;
      const sx = Math.floor(prepared.width * c.x);
      const sy = Math.floor(prepared.height * c.y);
      const sw = Math.floor(prepared.width * c.w);
      const sh = Math.floor(prepared.height * c.h);
      prepared = prepared.get(sx, sy, sw, sh);
    } else {
      prepared = prepared.get();
    }
    if (typeof cfg.tolerance === 'number') {
      removeFlatBackground(prepared, cfg.tolerance);
      prepared = trimTransparent(prepared, 3);
    }
    return prepared;
  }

  function makeSpriteFromSheet(source, rect, tolerance) {
    const sx = Math.floor(source.width * rect.x);
    const sy = Math.floor(source.height * rect.y);
    const sw = Math.floor(source.width * rect.w);
    const sh = Math.floor(source.height * rect.h);
    const sprite = source.get(sx, sy, sw, sh);
    removeFlatBackground(sprite, tolerance);
    return trimTransparent(sprite, 4);
  }

  function removeFlatBackground(img, tolerance) {
    img.loadPixels();
    const refs = sampleEdgeReferenceColors(img);
    const width = img.width;
    const height = img.height;
    const visited = new Uint8Array(width * height);
    const queue = [];

    function enqueue(x, y) {
      if (x < 0 || y < 0 || x >= width || y >= height) return;
      const index = y * width + x;
      if (visited[index]) return;
      visited[index] = 1;
      queue.push(index);
    }

    for (let x = 0; x < width; x += 1) {
      enqueue(x, 0);
      enqueue(x, height - 1);
    }
    for (let y = 1; y < height - 1; y += 1) {
      enqueue(0, y);
      enqueue(width - 1, y);
    }

    while (queue.length > 0) {
      const index = queue.pop();
      const x = index % width;
      const y = Math.floor(index / width);
      const pixelIndex = index * 4;
      if (img.pixels[pixelIndex + 3] === 0) continue;
      if (!matchesBackgroundRefs(img, pixelIndex, refs, tolerance)) continue;

      img.pixels[pixelIndex + 3] = 0;
      enqueue(x + 1, y);
      enqueue(x - 1, y);
      enqueue(x, y + 1);
      enqueue(x, y - 1);
    }
    img.updatePixels();
  }

  function sampleEdgeReferenceColors(img) {
    const refs = [];
    const width = img.width;
    const height = img.height;
    const stepX = Math.max(1, Math.floor(width / 6));
    const stepY = Math.max(1, Math.floor(height / 6));

    function addSample(x, y) {
      const idx = (y * width + x) * 4;
      refs.push({
        r: img.pixels[idx],
        g: img.pixels[idx + 1],
        b: img.pixels[idx + 2],
      });
    }

    for (let x = 0; x < width; x += stepX) {
      addSample(x, 0);
      addSample(x, height - 1);
    }
    for (let y = 0; y < height; y += stepY) {
      addSample(0, y);
      addSample(width - 1, y);
    }

    addSample(0, 0);
    addSample(width - 1, 0);
    addSample(0, height - 1);
    addSample(width - 1, height - 1);
    return refs;
  }

  function matchesBackgroundRefs(img, pixelIndex, refs, tolerance) {
    const r = img.pixels[pixelIndex];
    const g = img.pixels[pixelIndex + 1];
    const b = img.pixels[pixelIndex + 2];

    for (let i = 0; i < refs.length; i += 1) {
      const ref = refs[i];
      if (
        Math.abs(r - ref.r) <= tolerance &&
        Math.abs(g - ref.g) <= tolerance &&
        Math.abs(b - ref.b) <= tolerance
      ) {
        return true;
      }
    }
    return false;
  }

  function trimTransparent(img, padding) {
    img.loadPixels();
    let minX = img.width;
    let minY = img.height;
    let maxX = -1;
    let maxY = -1;

    for (let y = 0; y < img.height; y += 1) {
      for (let x = 0; x < img.width; x += 1) {
        const idx = (y * img.width + x) * 4 + 3;
        if (img.pixels[idx] > 0) {
          if (x < minX) minX = x;
          if (y < minY) minY = y;
          if (x > maxX) maxX = x;
          if (y > maxY) maxY = y;
        }
      }
    }

    if (maxX < minX || maxY < minY) {
      return img;
    }

    const left = Math.max(0, minX - padding);
    const top = Math.max(0, minY - padding);
    const right = Math.min(img.width - 1, maxX + padding);
    const bottom = Math.min(img.height - 1, maxY + padding);
    return img.get(left, top, right - left + 1, bottom - top + 1);
  }

  function drawSpriteCentered(sprite, x, y, scale) {
    const w = sprite.width * scale;
    const h = sprite.height * scale;
    p.image(sprite, x - w / 2, y - h / 2, w, h);
  }

  function drawSceneImage(key, x, y, maxW, maxH, angle) {
    const sprite = sceneImages[key];
    if (!sprite) return false;

    const scale = p.min(maxW / sprite.width, maxH / sprite.height);
    const w = sprite.width * scale;
    const h = sprite.height * scale;

    p.push();
    p.translate(x, y);
    p.rotate(angle || 0);
    p.image(sprite, -w / 2, -h / 2, w, h);
    p.pop();
    return true;
  }

  function drawChefFallback(x, y, scale, pose, progress) {
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
    if (vegetableSpriteReady) {
      drawVegetableSprites(x, y, scale, wet);
      return;
    }
    drawVegetablesFallback(x, y, scale, wet);
  }

  function drawVegetableSprites(x, y, scale, wet) {
    const wiggle = p.sin(p.frameCount * 0.06) * 2;
    const sprites = wet
      ? [
        { key: 'broccoli', x: -18, y: -2 + wiggle, s: 0.44 },
        { key: 'tomato', x: 26, y: 4 - wiggle * 0.7, s: 0.36 },
        { key: 'cucumber', x: 56, y: 10 + wiggle * 0.4, s: 0.34 },
      ]
      : [
        { key: 'eggplant', x: -10, y: 14 + wiggle * 0.5, s: 0.38 },
        { key: 'carrot', x: 34, y: 2 - wiggle, s: 0.35 },
        { key: 'tomato', x: 64, y: -2 + wiggle * 0.6, s: 0.3 },
      ];

    p.push();
    p.translate(x, y);
    p.scale(scale);
    for (let i = 0; i < sprites.length; i += 1) {
      const item = sprites[i];
      const sprite = vegetableSprites[item.key];
      if (sprite) {
        drawSpriteCentered(sprite, item.x, item.y, item.s);
      }
    }
    if (wet) {
      p.noStroke();
      p.fill(180, 227, 245, 160);
      for (let i = 0; i < 5; i += 1) {
        p.circle(-30 + i * 16, 28 + (i % 2) * 6, 7);
      }
    }
    p.pop();
  }

  function drawVegetablesFallback(x, y, scale, wet) {
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
    const slot = Math.round(angle / (p.TWO_PI / selectorValues.length)) % selectorValues.length;
    return selectorValues[slot];
  }

  function selectorAngleForMinutes(minutes) {
    const slot = selectorValues.indexOf(minutes);
    return -p.HALF_PI + slot * (p.TWO_PI / selectorValues.length);
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

  function formatClock(seconds, includeMilliseconds) {
    const safe = p.max(0, seconds);
    const wholeSeconds = Math.floor(safe);
    const mins = Math.floor(wholeSeconds / 60);
    const secs = wholeSeconds % 60;

    if (!includeMilliseconds) {
      const rounded = Math.ceil(safe);
      const roundedMins = Math.floor(rounded / 60);
      const roundedSecs = rounded % 60;
      return p.nf(roundedMins, 2) + ':' + p.nf(roundedSecs, 2);
    }

    const milliseconds = Math.floor((safe - wholeSeconds) * 1000);
    return p.nf(mins, 2) + ':' + p.nf(secs, 2) + '.' + p.nf(milliseconds, 3);
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
