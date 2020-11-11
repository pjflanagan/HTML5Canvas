// GLOBAL ------------------------------------------------------------------------------------------

// random

const Random = {
  int: (min, max) => Math.round(Math.random() * (max - min)) + min,
  dec: (min, max) => Math.random() * (max - min) + min,
  bool: () => Math.random() > 0.5,
};

Random.prop = ({ min, max }) => {
  if (min % 1 === 0 && max % 1 === 0) {
    return Random.int(min, max);
  }
  return Random.dec(min, max);
};

Random.prop2 = ({ min, max }, comp) => Random.prop({ min, max }) * comp;

// color

class Color {
  constructor(color) {
    if (!!color) {
      const { r, g, b, a } = color;
      this.r = r;
      this.g = g;
      this.b = b;
      this.a = a;
    } else {
      this.random();
    }
  }

  random() {
    this.r = Random.int(0, 255);
    this.g = Random.int(0, 255);
    this.b = Random.int(0, 255);
    this.a = Random.dec(0, 1);
  }

  setOpacity(a) {
    this.a = a;
  }

  toString() {
    return `rgba(${this.r}, ${this.g}, ${this.b}, ${this.a})`;
  }

  averageColor(c2) {
    return new Color({
      r: (this.r + c2.r) / 2,
      g: (this.g + c2.g) / 2,
      b: (this.b + c2.b) / 2,
      a: (this.a + c2.a) / 2,
    });
  }

  makeThreshold(c2, colorCount) {
    const colors = [this];
    const delta = {
      r: c2.r - this.r,
      g: c2.g - this.g,
      b: c2.b - this.b,
      a: c2.a - this.a,
    };
    for (let i = 1; i <= colorCount; ++i) {
      colors.push(
        new Color({
          r: this.r + (delta.r * i) / colorCount,
          g: this.g + (delta.g * i) / colorCount,
          b: this.b + (delta.b * i) / colorCount,
          a: this.a + (delta.a * i) / colorCount,
        })
      );
    }
    return colors;
  }
}

// math

function distance(a, b) {
  return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
}

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
      this.bodies.push(new Star(this, 0));
    }

    const bgMoonCount = Random.prop(WORLD.BACKGROUND_MOONS);
    for (let i = 0; i < bgMoonCount; ++i) {
      this.bodies.push(new Moon(this, 1));
    }

    const bgMoonCount2 = Random.prop(WORLD.BACKGROUND_MOONS);
    for (let i = 0; i < bgMoonCount2; ++i) {
      this.bodies.push(new Moon(this, 3));
    }

    this.bodies.push(new Planet(this, 4));

    const fgMoonCount = Random.prop(WORLD.FOREGROUND_MOONS);
    for (let i = 0; i < fgMoonCount; ++i) {
      this.bodies.push(new Moon(this, 5));
    }

    const fgMoonCount2 = Random.prop(WORLD.FOREGROUND_MOONS);
    for (let i = 0; i < fgMoonCount2; ++i) {
      this.bodies.push(new Moon(this, 6));
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
  constructor(world, layer) {
    this.world = world;
    this.ctx = this.world.ctx;
    this.layer = layer;
    this.layerStrength = 18 / (layer + 1) + 4; // TODO: use constant
  }

  setupColors() {
    const smallColorRadius = Random.int(
      this.prop.radius / 4,
      this.prop.radius / 3
    ); // TODO: use random predefined
    const smallColorCenter = {
      x:
        this.prop.central.x +
        Random.int(-this.prop.radius / 2, this.prop.radius / 2), // TODO: use random predefined
      y:
        this.prop.central.y +
        Random.int(-this.prop.radius / 2, this.prop.radius / 2),
    };
    this.prop.colorDelta = {
      x: smallColorCenter.x - this.prop.central.x,
      y: smallColorCenter.y - this.prop.central.y,
      r: smallColorRadius - this.prop.radius,
    };
  }

  move(angle, strength) {
    // move towards the new wiggle point
    // if we are there then select a new wiggle point
    const { central } = this.prop;
    this.pos = {
      x: central.x + this.layerStrength * strength * Math.cos(angle),
      y: central.y + this.layerStrength * strength * Math.sin(angle),
    };
  }

  draw() {
    // planet
    const { colorDelta, colors, radius } = this.prop;
    for (let i = 0; i < colors.length; ++i) {
      this.ctx.beginPath();
      this.ctx.arc(
        this.pos.x - (colorDelta.x * i) / colors.length,
        this.pos.y - (colorDelta.y * i) / colors.length,
        radius + (colorDelta.r * i) / colors.length,
        0,
        2 * Math.PI,
        false
      );
      this.ctx.fillStyle = colors[i].toString();
      this.ctx.fill();
    }
  }
}

class Star extends Body {
  constructor(world, layer) {
    super(world, layer);

    const color = new Color({
      r: 248,
      g: 255,
      b: 168,
      a: Random.dec(.5, 1),
    });
    const toColor = new Color({
      r: 255,
      g: 255,
      b: 255,
      a: Random.dec(.5, 1),
    });

    // unchanging props
    this.prop = {
      central: {
        x: Random.int(
          0,
          this.world.W
        ),
        y: Random.int(
          0,
          this.world.H
        ),
      }, // planet is in the center
      radius: Random.prop2(BODY.STAR.RADIUS, world.H),
      colors: color.makeThreshold(toColor, 3), // TODO: use random predefined count
    };
    this.setupColors();

    // changing pos
    this.pos = this.prop.central;
  }
}

class Moon extends Body {
  constructor(world, layer) {
    super(world, layer);

    const color = new Color(); // random color
    color.setOpacity(1);
    const toColor = new Color();
    toColor.setOpacity(1);

    // unchanging props
    const radius = Random.prop2(BODY.MOON.RADIUS, world.H);
    this.prop = {
      central: {
        x: Random.int(
          radius * 2,
          this.world.W - radius * 2
        ),
        y: Random.int(
          radius,
          this.world.H - radius * 2
        ),
      }, // planet is in the center
      radius,
      colors: color.makeThreshold(toColor, 3), // TODO: use random predefined count
    };
    this.setupColors();

    // changing pos
    this.pos = this.prop.central;
  }
}

class Planet extends Body {
  constructor(world, layer) {
    super(world, layer);

    const color = new Color(); // random color
    color.setOpacity(1);
    const toColor = new Color();
    toColor.setOpacity(1);

    // unchanging props
    this.prop = {
      central: { x: this.world.W / 2, y: this.world.H / 2 }, // planet is in the center
      radius: Random.prop2(BODY.PLANET.RADIUS, world.H),
      colors: color.makeThreshold(toColor, 5), // TODO: use random predefined count
    };
    this.setupColors();

    // changing pos
    this.pos = this.prop.central;
  }

  // TODO: we wiggle around the central point, the central point can shift based on where the mouse is
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
