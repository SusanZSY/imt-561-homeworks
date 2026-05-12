registerSketch('sk15', function (p) {
  const DATA_PATH = 'data/coffee-quality-cqi.csv';
  const MAP_PATH = 'data/world-countries-110m.geojson';
  const MIN_WIDTH = 820;
  const MAX_WIDTH = 1180;
  const CANVAS_HEIGHT = 760;

  const TRAITS = [
    { key: 'Aroma', color: '#123a63' },
    { key: 'Acidity', color: '#29557f' },
    { key: 'Flavor', color: '#4878a2' },
    { key: 'Aftertaste', color: '#73a1c4' },
    { key: 'Balance', color: '#b6d2e7' }
  ];

  const FEATURED_COUNTRIES = ['brazil', 'colombia', 'ethiopia', 'panama'];

  const COUNTRY_NAME_ALIASES = {
    'bolivia, plurinational state of': 'bolivia',
    'costa.rica': 'costa rica',
    'dominican rep.': 'dominican republic',
    'el.salvador': 'el salvador',
    hawaii: 'united states',
    'lao pdr': 'laos',
    'tanzania, united republic of': 'tanzania',
    'united states (hawaii)': 'united states',
    'united states hawaii': 'united states'
  };

  const LABEL_OFFSETS = {
    brazil: { dx: -84, dy: 28 },
    colombia: { dx: -94, dy: -6 },
    ethiopia: { dx: 24, dy: -18 },
    panama: { dx: -76, dy: 28 }
  };

  const FALLBACK_ROWS = [
    { country: 'Brazil', Aroma: 7.9, Acidity: 7.5, Flavor: 7.8, Aftertaste: 7.6, Balance: 7.7 },
    { country: 'Brazil', Aroma: 8.0, Acidity: 7.4, Flavor: 7.9, Aftertaste: 7.7, Balance: 7.8 },
    { country: 'Colombia', Aroma: 8.2, Acidity: 7.8, Flavor: 8.3, Aftertaste: 8.0, Balance: 8.1 },
    { country: 'Colombia', Aroma: 8.1, Acidity: 7.9, Flavor: 8.4, Aftertaste: 8.1, Balance: 8.0 },
    { country: 'Ethiopia', Aroma: 8.5, Acidity: 8.0, Flavor: 8.2, Aftertaste: 8.1, Balance: 7.9 },
    { country: 'Ethiopia', Aroma: 8.4, Acidity: 8.1, Flavor: 8.1, Aftertaste: 8.0, Balance: 7.8 },
    { country: 'Guatemala', Aroma: 8.0, Acidity: 7.7, Flavor: 8.0, Aftertaste: 7.8, Balance: 8.1 },
    { country: 'Guatemala', Aroma: 7.9, Acidity: 7.8, Flavor: 7.9, Aftertaste: 7.7, Balance: 8.0 },
    { country: 'Honduras', Aroma: 7.7, Acidity: 7.8, Flavor: 7.6, Aftertaste: 7.5, Balance: 7.9 },
    { country: 'Indonesia', Aroma: 7.8, Acidity: 7.2, Flavor: 7.9, Aftertaste: 8.0, Balance: 7.8 },
    { country: 'Kenya', Aroma: 8.1, Acidity: 8.5, Flavor: 8.0, Aftertaste: 7.8, Balance: 7.7 },
    { country: 'Mexico', Aroma: 7.8, Acidity: 7.6, Flavor: 7.7, Aftertaste: 7.5, Balance: 7.9 },
    { country: 'Panama', Aroma: 8.3, Acidity: 7.9, Flavor: 8.5, Aftertaste: 8.2, Balance: 8.1 },
    { country: 'Peru', Aroma: 7.8, Acidity: 7.7, Flavor: 7.9, Aftertaste: 7.8, Balance: 8.0 },
    { country: 'Taiwan', Aroma: 8.0, Acidity: 7.6, Flavor: 8.1, Aftertaste: 7.8, Balance: 7.9 },
    { country: 'Tanzania, United Republic Of', Aroma: 7.8, Acidity: 8.1, Flavor: 7.9, Aftertaste: 7.8, Balance: 7.7 },
    { country: 'Uganda', Aroma: 7.6, Acidity: 7.4, Flavor: 7.7, Aftertaste: 7.8, Balance: 7.9 }
  ];

  let csvTable = null;
  let worldGeoJson = null;
  let loadMode = 'loading';
  let countrySummaries = [];
  let worldShapes = [];
  let hoveredCountry = null;
  let selectedCountry = null;
  let layout = null;

  p.preload = function () {
    csvTable = p.loadTable(
      DATA_PATH,
      'csv',
      'header',
      function () {
        loadMode = 'csv';
      },
      function () {
        loadMode = 'fallback';
      }
    );

    worldGeoJson = p.loadJSON(MAP_PATH);
  };

  p.setup = function () {
    p.createCanvas(getCanvasWidth(), CANVAS_HEIGHT);
    p.textFont('Georgia');
    p.noLoop();

    rebuildData();
    buildWorldShapes();
    linkSummariesToShapes();
  };

  p.draw = function () {
    layout = getLayout();
    syncWorldGeometry();
    hoveredCountry = findHoveredCountry();

    drawBackdrop();
    drawHeader();
    drawMapCard();
    drawFooterNote();
  };

  p.mouseMoved = function () {
    p.redraw();
  };

  p.mousePressed = function () {
    selectedCountry = findHoveredCountry();
    p.redraw();
  };

  p.windowResized = function () {
    p.resizeCanvas(getCanvasWidth(), CANVAS_HEIGHT);
    p.redraw();
  };

  function getCanvasWidth() {
    return p.constrain(p.windowWidth - 60, MIN_WIDTH, MAX_WIDTH);
  }

  function rebuildData() {
    if (loadMode === 'csv' && csvTable && csvTable.getRowCount() > 0) {
      countrySummaries = summarizeRows(rowsFromTable(csvTable));
    } else {
      loadMode = 'fallback';
      countrySummaries = summarizeRows(FALLBACK_ROWS);
    }
  }

  function rowsFromTable(table) {
    const columns = table.columns || [];
    const countryColumn = findColumn(columns, [
      'Country.of.Origin',
      'Country of Origin',
      'country_of_origin',
      'Country',
      'country'
    ]);

    const traitColumns = {};
    TRAITS.forEach(function (trait) {
      traitColumns[trait.key] = findColumn(columns, [
        trait.key,
        trait.key.toLowerCase()
      ]);
    });

    return table.getRows().map(function (row) {
      const entry = {
        country: countryColumn ? row.get(countryColumn) : ''
      };

      TRAITS.forEach(function (trait) {
        const column = traitColumns[trait.key];
        entry[trait.key] = column ? parseNumber(row.get(column)) : null;
      });

      return entry;
    });
  }

  function summarizeRows(rows) {
    const grouped = new Map();

    rows.forEach(function (row) {
      const canonical = canonicalCountryName(row.country);
      if (!canonical) return;

      if (!grouped.has(canonical)) {
        grouped.set(canonical, {
          country: displayCountryName(canonical),
          canonical: canonical,
          recordCount: 0,
          totals: buildTraitAccumulator(),
          counts: buildTraitAccumulator()
        });
      }

      const bucket = grouped.get(canonical);
      bucket.recordCount += 1;

      TRAITS.forEach(function (trait) {
        const value = parseNumber(row[trait.key]);
        if (value !== null) {
          bucket.totals[trait.key] += value;
          bucket.counts[trait.key] += 1;
        }
      });
    });

    return Array.from(grouped.values())
      .map(function (bucket) {
        const averages = {};
        let dominantTrait = TRAITS[0].key;
        let highestValue = -Infinity;

        TRAITS.forEach(function (trait) {
          const count = bucket.counts[trait.key];
          const average = count > 0 ? bucket.totals[trait.key] / count : 0;
          averages[trait.key] = average;

          if (average > highestValue) {
            highestValue = average;
            dominantTrait = trait.key;
          }
        });

        return {
          country: bucket.country,
          canonical: bucket.canonical,
          recordCount: bucket.recordCount,
          averages: averages,
          dominantTrait: dominantTrait,
          centroidX: 0,
          centroidY: 0
        };
      })
      .sort(function (a, b) {
        return b.recordCount - a.recordCount || a.country.localeCompare(b.country);
      });
  }

  function buildTraitAccumulator() {
    const accumulator = {};
    TRAITS.forEach(function (trait) {
      accumulator[trait.key] = 0;
    });
    return accumulator;
  }

  function buildWorldShapes() {
    if (!worldGeoJson || !worldGeoJson.features) {
      worldShapes = [];
      return;
    }

    worldShapes = worldGeoJson.features.map(function (feature) {
      const name = feature.properties && feature.properties.name ? feature.properties.name : '';
      return {
        name: name,
        canonical: canonicalCountryName(name),
        polygons: extractPolygons(feature.geometry),
        summary: null,
        screenPolygons: [],
        bbox: null,
        centroidX: 0,
        centroidY: 0
      };
    });
  }

  function linkSummariesToShapes() {
    const summaryByCanonical = new Map();
    countrySummaries.forEach(function (summary) {
      summaryByCanonical.set(summary.canonical, summary);
    });

    worldShapes.forEach(function (shape) {
      shape.summary = summaryByCanonical.get(shape.canonical) || null;
    });
  }

  function extractPolygons(geometry) {
    if (!geometry) return [];

    if (geometry.type === 'Polygon') {
      return [geometry.coordinates];
    }

    if (geometry.type === 'MultiPolygon') {
      return geometry.coordinates;
    }

    return [];
  }

  function drawBackdrop() {
    p.background('#eef2f6');
    p.noStroke();
    p.fill('#dde6ef');
    p.circle(110, 120, 180);
    p.circle(p.width - 80, p.height - 90, 210);
  }

  function drawHeader() {
    const card = layout.card;

    p.noStroke();
    p.fill('#f8fbff');
    p.rect(card.x, card.y, card.w, card.h, 26);

    p.fill('#1e2a38');
    p.textAlign(p.CENTER, p.TOP);
    p.textSize(24);
    p.text('Global Coffee Flavor Dominance', p.width / 2, card.y + 22);

    p.fill('#55677b');
    p.textSize(13);
    p.text(
      'Each country is filled by the highest average sensory score among Aroma, Acidity, Flavor, Aftertaste, and Balance, using different shades of one blue color family.',
      card.x + 42,
      card.y + 62,
      card.w - 84,
      36
    );
  }

  function drawMapCard() {
    const map = layout.map;

    p.noStroke();
    p.fill('#dfe8f2');
    p.rect(map.x, map.y, map.w, map.h, 24);

    drawGraticule(map);
    drawCountries();
    drawFeaturedLabels();
    drawLegendOverlay();
    drawHoverPanel(layout.info.x, layout.info.y, layout.info.w, layout.info.h);

    p.noFill();
    p.stroke('#c3d0dc');
    p.strokeWeight(1.2);
    p.rect(map.x, map.y, map.w, map.h, 24);

    p.noStroke();
    p.fill('#607284');
    p.textAlign(p.LEFT, p.TOP);
    p.textSize(11);
    p.text('World map layer', map.x + 22, map.y + 16);
    p.text('Countries in the dataset are shaded by their dominant average flavor element.', map.x + 22, map.y + map.h - 22);
  }

  function drawGraticule(map) {
    p.stroke('#cbd7e2');
    p.strokeWeight(1);

    for (let lon = -150; lon <= 150; lon += 30) {
      const x = longitudeToX(lon, map);
      p.line(x, map.y + 18, x, map.y + map.h - 18);
    }

    for (let lat = -60; lat <= 60; lat += 30) {
      const y = latitudeToY(lat, map);
      p.line(map.x + 18, y, map.x + map.w - 18, y);
    }
  }

  function drawCountries() {
    worldShapes.forEach(function (shape) {
      if (!shape.screenPolygons.length) return;

      const isHovered = hoveredCountry && shape.summary && hoveredCountry.canonical === shape.summary.canonical;
      const fillColor = shape.summary ? colorForTrait(shape.summary.dominantTrait) : '#afc1d1';

      p.fill(fillColor);
      p.stroke(isHovered ? '#18283a' : '#eef4f9');
      p.strokeWeight(isHovered ? 2 : 0.7);

      shape.screenPolygons.forEach(function (polygon) {
        p.beginShape();
        polygon[0].forEach(function (point) {
          p.vertex(point.x, point.y);
        });

        for (let ringIndex = 1; ringIndex < polygon.length; ringIndex += 1) {
          p.beginContour();
          polygon[ringIndex].forEach(function (point) {
            p.vertex(point.x, point.y);
          });
          p.endContour();
        }

        p.endShape(p.CLOSE);
      });
    });
  }

  function drawLegendOverlay() {
    const panel = layout.legend;

    p.noStroke();
    p.fill(248, 251, 255, 235);
    p.rect(panel.x, panel.y, panel.w, panel.h, 18);

    p.fill('#243447');
    p.textAlign(p.LEFT, p.TOP);
    p.textSize(14);
    p.text('Legend', panel.x + 16, panel.y + 14);

    let swatchY = panel.y + 42;
    TRAITS.forEach(function (trait) {
      p.noStroke();
      p.fill(colorForTrait(trait.key));
      p.rect(panel.x + 16, swatchY + 1, 14, 14, 3);

      p.fill('#31465c');
      p.textSize(12);
      p.text(trait.key + ' shade', panel.x + 40, swatchY - 1, panel.w - 56, 18);

      swatchY += 22;
    });
  }

  function drawHoverPanel(x, y, w, h) {
    p.noStroke();
    p.fill('#edf3f8');
    p.rect(x, y, w, h, 18);

    if (!selectedCountry) {
      p.fill('#334759');
      p.textAlign(p.LEFT, p.TOP);
      p.textSize(13);
      p.text('Click a colored country to see its dominant trait and flavor evaluation.', x + 16, y + 16, w - 32, 24);

      p.textSize(12);
      p.fill('#63788d');
      p.text(
        loadMode === 'csv'
          ? 'Dataset: data/coffee-quality-cqi.csv. Boundaries: local Natural Earth 110m world countries GeoJSON.'
          : 'Fallback sample data is showing now. Add data/coffee-quality-cqi.csv to switch to your full coffee dataset.',
        x + 16,
        y + 42,
        w - 32,
        40
      );
      return;
    }

    p.fill('#213346');
    p.textAlign(p.LEFT, p.TOP);
    p.textSize(17);
    p.text(selectedCountry.country, x + 16, y + 16);

    p.textSize(12);
    p.fill('#5e7388');
    p.text('Dominant trait: ' + selectedCountry.dominantTrait, x + 16, y + 44);
    p.text('Rows in dataset: ' + selectedCountry.recordCount, x + 16, y + 64);

    const metrics = TRAITS.map(function (trait) {
      return {
        key: trait.key,
        color: colorForTrait(trait.key),
        label: describeTraitScore(trait.key, selectedCountry.averages[trait.key])
      };
    });

    const metricsX = x + 176;
    const metricsY = y + 16;
    const metricsW = w - 192;
    const columnCount = metricsW > 420 ? 3 : 2;
    const gutter = 18;
    const rowsPerColumn = Math.ceil(metrics.length / columnCount);
    const columnW = (metricsW - gutter * (columnCount - 1)) / columnCount;
    const rowGap = 24;

    metrics.forEach(function (metric, index) {
      const columnIndex = Math.floor(index / rowsPerColumn);
      const rowIndex = index % rowsPerColumn;
      const itemX = metricsX + columnIndex * (columnW + gutter);
      const itemY = metricsY + rowIndex * rowGap;

      p.fill(metric.color);
      p.circle(itemX + 5, itemY + 7, 9);

      p.fill('#31465c');
      p.textAlign(p.LEFT, p.TOP);
      p.textSize(12);
      p.text(metric.key + ': ' + metric.label, itemX + 18, itemY, columnW - 18, 18);
    });
  }

  function drawFooterNote() {
    p.fill('#73869a');
    p.noStroke();
    p.textAlign(p.CENTER, p.BOTTOM);
    p.textSize(10);
    p.text(
      'Dominant flavor trait by country. Base boundaries adapted from Natural Earth 1:110m world countries.',
      p.width / 2,
      p.height - 18
    );
  }

  function getLayout() {
    const outerX = 28;
    const outerY = 22;
    const outerW = p.width - 56;
    const outerH = p.height - 44;

    return {
      card: {
        x: outerX,
        y: outerY,
        w: outerW,
        h: outerH
      },
      map: {
        x: outerX + 26,
        y: outerY + 104,
        w: outerW - 52,
        h: 430
      },
      legend: {
        x: outerX + outerW - 186,
        y: outerY + 250,
        w: 144,
        h: 158
      },
      info: {
        x: outerX + 26,
        y: outerY + 554,
        w: outerW - 52,
        h: 86
      }
    };
  }

  function drawFeaturedLabels() {
    FEATURED_COUNTRIES.forEach(function (name) {
      const summary = countrySummaries.find(function (item) {
        return item.canonical === name;
      });

      if (!summary || !LABEL_OFFSETS[name]) return;

      const offset = LABEL_OFFSETS[name];
      const labelX = summary.centroidX + offset.dx;
      const labelY = summary.centroidY + offset.dy;

      p.stroke('#7d90a3');
      p.strokeWeight(1);
      p.line(summary.centroidX, summary.centroidY, labelX, labelY);

      p.noStroke();
      p.fill('#31465c');
      p.textAlign(p.LEFT, p.CENTER);
      p.textSize(11);
      p.text(summary.country, labelX + 4, labelY);
    });
  }

  function findHoveredCountry() {
    for (let i = worldShapes.length - 1; i >= 0; i -= 1) {
      const shape = worldShapes[i];
      if (!shape.summary || !shape.bbox) continue;
      if (!pointInBoundingBox(p.mouseX, p.mouseY, shape.bbox)) continue;
      if (pointInShape(p.mouseX, p.mouseY, shape)) return shape.summary;
    }

    return null;
  }

  function syncWorldGeometry() {
    if (!layout) return;

    worldShapes.forEach(function (shape) {
      const screenPolygons = [];
      let minX = Infinity;
      let minY = Infinity;
      let maxX = -Infinity;
      let maxY = -Infinity;

      shape.polygons.forEach(function (polygon) {
        const screenPolygon = polygon.map(function (ring) {
          return ring.map(function (point) {
            const projected = {
              x: longitudeToX(point[0], layout.map),
              y: latitudeToY(point[1], layout.map)
            };

            minX = Math.min(minX, projected.x);
            minY = Math.min(minY, projected.y);
            maxX = Math.max(maxX, projected.x);
            maxY = Math.max(maxY, projected.y);

            return projected;
          });
        });

        screenPolygons.push(screenPolygon);
      });

      shape.screenPolygons = screenPolygons;
      shape.bbox = Number.isFinite(minX)
        ? { minX: minX, minY: minY, maxX: maxX, maxY: maxY }
        : null;

      if (shape.summary && shape.bbox) {
        shape.summary.centroidX = (shape.bbox.minX + shape.bbox.maxX) / 2;
        shape.summary.centroidY = (shape.bbox.minY + shape.bbox.maxY) / 2;
      }
    });
  }

  function pointInBoundingBox(x, y, bbox) {
    return x >= bbox.minX && x <= bbox.maxX && y >= bbox.minY && y <= bbox.maxY;
  }

  function pointInShape(x, y, shape) {
    for (let polyIndex = 0; polyIndex < shape.screenPolygons.length; polyIndex += 1) {
      const polygon = shape.screenPolygons[polyIndex];
      if (!polygon.length) continue;

      if (!pointInRing(x, y, polygon[0])) continue;

      let insideHole = false;
      for (let ringIndex = 1; ringIndex < polygon.length; ringIndex += 1) {
        if (pointInRing(x, y, polygon[ringIndex])) {
          insideHole = true;
          break;
        }
      }

      if (!insideHole) return true;
    }

    return false;
  }

  function pointInRing(x, y, ring) {
    let inside = false;

    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
      const xi = ring[i].x;
      const yi = ring[i].y;
      const xj = ring[j].x;
      const yj = ring[j].y;

      const intersects = ((yi > y) !== (yj > y)) &&
        (x < ((xj - xi) * (y - yi)) / ((yj - yi) || 0.0000001) + xi);

      if (intersects) inside = !inside;
    }

    return inside;
  }

  function colorForTrait(traitKey) {
    const trait = TRAITS.find(function (item) {
      return item.key === traitKey;
    });

    return trait ? trait.color : '#8d7969';
  }

  function longitudeToX(lon, map) {
    return map.x + p.map(lon, -180, 180, 24, map.w - 24);
  }

  function latitudeToY(lat, map) {
    return map.y + p.map(lat, 85, -60, 28, map.h - 28);
  }

  function findColumn(columns, candidates) {
    for (let i = 0; i < candidates.length; i += 1) {
      const candidate = candidates[i];
      const match = columns.find(function (column) {
        return normalizeHeader(column) === normalizeHeader(candidate);
      });
      if (match) return match;
    }

    return null;
  }

  function normalizeHeader(value) {
    return String(value || '')
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '');
  }

  function canonicalCountryName(country) {
    const normalized = String(country || '')
      .trim()
      .toLowerCase()
      .replace(/[._]/g, ' ')
      .replace(/\s+/g, ' ');

    if (!normalized) return '';
    return COUNTRY_NAME_ALIASES[normalized] || normalized;
  }

  function displayCountryName(canonical) {
    return canonical
      .split(' ')
      .map(function (part) {
        return part.charAt(0).toUpperCase() + part.slice(1);
      })
      .join(' ');
  }

  function parseNumber(value) {
    const numeric = Number(value);
    return Number.isFinite(numeric) ? numeric : null;
  }

  function describeTraitScore(traitKey, value) {
    if (!Number.isFinite(value)) return 'No data';

    const level = scoreLevel(value);

    if (traitKey === 'Aroma') {
      if (level === 'Exceptional') return 'highly distinctive';
      if (level === 'Strong') return 'layered and vivid';
      if (level === 'Balanced') return 'pleasant and clear';
      if (level === 'Mild') return 'noticeable but light';
      return 'muted';
    }

    if (traitKey === 'Flavor') {
      if (level === 'Exceptional') return 'deep and complex';
      if (level === 'Strong') return 'well-defined';
      if (level === 'Balanced') return 'steady and pleasant';
      if (level === 'Mild') return 'simple';
      return 'flat';
    }

    if (traitKey === 'Acidity') {
      if (level === 'Exceptional') return 'bright and lively';
      if (level === 'Strong') return 'crisp and sweet';
      if (level === 'Balanced') return 'gentle brightness';
      if (level === 'Mild') return 'soft acidity';
      return 'dull';
    }

    if (traitKey === 'Aftertaste') {
      if (level === 'Exceptional') return 'long and refined';
      if (level === 'Strong') return 'clean and lasting';
      if (level === 'Balanced') return 'pleasant finish';
      if (level === 'Mild') return 'short finish';
      return 'fades quickly';
    }

    if (traitKey === 'Balance') {
      if (level === 'Exceptional') return 'highly harmonious';
      if (level === 'Strong') return 'well integrated';
      if (level === 'Balanced') return 'mostly even';
      if (level === 'Mild') return 'slightly uneven';
      return 'disjointed';
    }

    return level.toLowerCase();
  }

  function scoreLevel(value) {
    if (value >= 8.3) return 'Exceptional';
    if (value >= 8.0) return 'Strong';
    if (value >= 7.7) return 'Balanced';
    if (value >= 7.4) return 'Mild';
    return 'Weak';
  }
});
