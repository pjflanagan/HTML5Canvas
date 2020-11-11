// WORLD -------------------------------------------------------------------------------------------

const WORLD = {
  STARS: { min: 64, max: 140 },
  BACKGROUND_MOONS: { min: 2, max: 7 },
  FOREGROUND_MOONS: { min: 3, max: 5 },
};

// bodies:
// background stars
// background moons
// planet (with rings)
// foreground moons

class World {
  constructor(ctx, width, height) {
    this.ctx = ctx;
    this.W = width;
    this.H = height;
    this.diagonal = distance({ x: 0, y: 0 }, { x: width, y: height });
    this.angle = 0;
    this.strength = 0;
    this.setup();
    this.drawBackground();

    this.animate = this.animate.bind(this);
    this.start();
  }

  setup() {
    // add things to bodies in order from bottom to top
    this.bodies = [];

    const starCount = Random.prop(WORLD.STARS);
    for (let i = 0; i < starCount; ++i) {
      this.bodies.push(new Star(this, 0, i));
    }

    const starCount2 = Random.prop(WORLD.STARS);
    for (let i = 0; i < starCount2; ++i) {
      this.bodies.push(new Star(this, 1, i));
    }

    const bgMoonCount = Random.prop(WORLD.BACKGROUND_MOONS);
    for (let i = 0; i < bgMoonCount; ++i) {
      this.bodies.push(new Moon(this, 2, i));
    }

    const bgMoonCount2 = Random.prop(WORLD.BACKGROUND_MOONS);
    for (let i = 0; i < bgMoonCount2; ++i) {
      this.bodies.push(new Moon(this, 3, i));
    }

    this.bodies.push(new Planet(this, 4, 0));

    const fgMoonCount = Random.prop(WORLD.FOREGROUND_MOONS);
    for (let i = 0; i < fgMoonCount; ++i) {
      this.bodies.push(new Moon(this, 5, i));
    }

    const fgMoonCount2 = Random.prop(WORLD.FOREGROUND_MOONS);
    for (let i = 0; i < fgMoonCount2; ++i) {
      this.bodies.push(new Moon(this, 6, i));
    }

    const starCount3 = Random.prop(WORLD.STARS);
    for (let i = 0; i < starCount3; ++i) {
      this.bodies.push(new Star(this, 7, i));
    }
  }

  drawBackground() {
    this.ctx.rect(0, 0, this.W, this.H);
    this.ctx.fillStyle = "#1c1c1c";
    this.ctx.fill();

    // TODO: more interesting stuff here as well
  }

  drawFrame() {
    this.drawBackground();
    this.bodies.forEach((body) => {
      body.move(this.angle, this.strength);
      body.draw();
    });
  }

  start() {
    this.isRunning = true;
    this.animate();
  }

  animate() {
    this.drawFrame();
    this.animationReq = window.requestAnimationFrame(this.animate.bind(this));
  }

  stop() {
    if (!!this.animationReq) {
      window.cancelAnimationFrame(this.animationReq);
    }
    this.isRunning = false;
  }

  mousemove(e) {
    const mouse = {
      x: e.pageX,
      y: e.pageY,
    };
    const center = {
      x: this.W / 2,
      y: this.H / 2,
    };
    this.angle = Math.atan2(mouse.y - center.y, mouse.x - center.x);
    this.strength = distance(center, mouse) / (this.diagonal / 2);
  }
}

// BODIES ---------------------------------------------------------------------------------------------

const BODY = {
  STAR: {
    RADIUS: { min: 0.0008, max: 0.002 },
  },
  MOON: {
    RADIUS: { min: 0.01, max: 0.06 },
  },
  PLANET: {
    RADIUS: { min: 0.2, max: 0.3 }, // proportional to world
  },
};

class Body {
  constructor(world, layer, id) {
    this.world = world;
    this.ctx = this.world.ctx;
    this.id = `${layer}-${id}`;
    this.prop = {};
    this.pos = {};
    this.layer = layer;
    this.layerStrength = Random.dec(.9,1.1) * (18 / (0.1 * layer + 0.8) + 4); // TODO: use constant

    this.setup();

    // changing pos
    this.setupColors();
    this.pos.x = this.prop.center.x;
    this.pos.y = this.prop.center.y;

  }

  setupColors() {
    const dir = Random.bool() ? 1 : -1;
    this.prop.colorProp = {
      angularVelocity: dir * Random.dec(0.001, 0.003),
      resizeFrequency: Random.dec(0.1, 0.3),
    };
    // color is relative to the actual center
    this.pos.colorPos = {
      angle: Random.dec(-Math.PI, Math.PI),
      distanceFromCenter: Random.int(
        this.prop.radius / 4,
        this.prop.radius / 3
      ),
    };
  }

  move(angle, strength) {
    // move towards the new wiggle point
    // if we are there then select a new wiggle point
    const { center, colorProp, radius } = this.prop;
    const shiftedCenter = {
      x: center.x + this.layerStrength * strength * Math.cos(angle),
      y: center.y + this.layerStrength * strength * Math.sin(angle),
    };

    this.pos.colorPos.angle =
      this.pos.colorPos.angle + colorProp.angularVelocity;
    this.pos.colorPos.smallRadius =
      radius / 4 +
      (0.5 *
        Math.sin(
          Math.PI * colorProp.resizeFrequency * this.pos.colorPos.angle
        ) +
        1) *
        (radius / 3);
    this.pos.colorPos.distanceFromCenter = 3 * radius / 4 - this.pos.colorPos.smallRadius;

    // TODO: for now just use shiftedCenter but I want them to bob
    this.pos.x = shiftedCenter.x;
    this.pos.y = shiftedCenter.y;
  }

  draw() {
    // planet
    const { colorSpectrum, radius } = this.prop;
    const { colorPos } = this.pos;
    const colorDelta = {
      x: colorPos.distanceFromCenter * Math.cos(colorPos.angle),
      y: colorPos.distanceFromCenter * Math.sin(colorPos.angle),
      r: radius - colorPos.smallRadius,
    };
    for (let i = 0; i < colorSpectrum.length; ++i) {
      this.ctx.beginPath();
      this.ctx.arc(
        this.pos.x - (colorDelta.x * i) / colorSpectrum.length,
        this.pos.y - (colorDelta.y * i) / colorSpectrum.length,
        radius - (colorDelta.r * i) / colorSpectrum.length,
        0,
        2 * Math.PI,
        false
      );
      this.ctx.fillStyle = colorSpectrum[i].toString();
      this.ctx.fill();
    }
  }
}

class Moon extends Body {
  constructor(world, layer, id) {
    super(world, layer, id);
  }

  setup() {
    const color = new Color(); // random color
    color.setOpacity(1);
    // const toColor = color.randomSimilar(64);
    const toColor = new Color(); // random color
    toColor.setOpacity(1);

    // unchanging props
    const radius = Random.prop2(BODY.MOON.RADIUS, this.world.H);
    this.prop = {
      center: {
        x: Random.int(radius * 2, this.world.W - radius * 2),
        y: Random.int(radius, this.world.H - radius * 2),
      }, // planet is in the center
      radius,
      colorSpectrum: color.makeSpectrum(toColor, 3), // TODO: use random predefined count
    };
    Random.insertRandom(this.prop.colorSpectrum, new Color());
  }
}

class Planet extends Body {
  constructor(world, layer, id) {
    super(world, layer, id);
  }

  setup() {
    const color = new Color(); // random color TODO: use a pallet
    color.setOpacity(1);
    const toColor = new Color();
    toColor.setOpacity(1);

    // unchanging props
    this.prop = {
      center: { x: this.world.W / 2, y: this.world.H / 2 }, // planet is in the center
      radius: Random.prop2(BODY.PLANET.RADIUS, this.world.H),
      colorSpectrum: color.makeSpectrum(toColor, 5), // TODO: use random predefined count
    };
    Random.insertRandom(this.prop.colorSpectrum, new Color());
  }

  // TODO: we wiggle around the center point, the center point can shift based on where the mouse is
}

class Star extends Body {
  constructor(world, layer, id) {
    super(world, layer, id);
  }

  setup() {
    const color = new Color({
      r: 248,
      g: 255,
      b: 168,
      a: Random.dec(0.5, 1),
    });
    const toColor = new Color({
      r: 255,
      g: 255,
      b: 255,
      a: Random.dec(0.5, 1),
    });

    // unchanging props
    this.prop = {
      center: {
        x: Random.int(0, this.world.W),
        y: Random.int(0, this.world.H),
      }, // planet is in the center
      radius: Random.prop2(BODY.STAR.RADIUS, this.world.H),
      colorSpectrum: color.makeSpectrum(toColor, 3), // TODO: use random predefined count
    };
  }
}

// MAIN ---------------------------------------------------------------------------------------------

const G = {};

window.onload = function () {
  const canvas = document.getElementById("pix");
  const ctx = canvas.getContext("2d");

  const W = window.innerWidth,
    H = window.innerHeight;
  canvas.width = W;
  canvas.height = H;

  G.world = new World(ctx, W, H);
};

$(document).mousemove(function (e) {
  G.world.mousemove(e);
});
