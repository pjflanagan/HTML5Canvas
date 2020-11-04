// CONST -------------------------------------------------------------------------------------------

const WORLD = {
  PLANETS: { min: 2, max: 5},
};

const PLANET = {
  ORBIT_SPEED: {min: .005, max: .03},
  ORBIT_RADIUS_GAP: 200,
  DRAW_LINE_TICK: {min: 1, max: 6}
}

const LINE_MODES = {
  TICKS: 1,
  ON: 2,
  OFF: 3
}

const MODES = {
  ATOM: {
    PLANETS: false,
    ORBITS: false,
    MIDPOINTS: true,
    LINES: LINE_MODES.OFF,
    FADE: "10"
  },
  LINES: {
    PLANETS: false,
    ORBITS: false,
    MIDPOINTS: false,
    LINES: LINE_MODES.TICKS,
    FADE: "01"
  },
  PLANET: {
    PLANETS: true,
    ORBITS: true,
    MIDPOINTS: true,
    LINES: LINE_MODES.ON,
    FADE: "88"
  },
  EXPERIMENT: {
    PLANETS: false,
    ORBITS: true,
    MIDPOINTS: true,
    LINES: LINE_MODES.ON,
    FADE: "aa"
  }
}

const DRAW = MODES.PLANET;

// GLOBAL ------------------------------------------------------------------------------------------

// random

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

function randomDec(min, max) {
  return Math.random() * (max - min) + min;
}

function randomBool() {
  return randomDec(0,1) > .5;
}

function randomProp({ min, max }) {
  if(min % 1 === 0 && max % 1 === 0) {
    return randomInt(min, max);
  }
  return randomDec(min, max);
}

// color

function randomColor() {
  var r = Math.round(Math.random() * 255);
  var g = Math.round(Math.random() * 255);
  var b = Math.round(Math.random() * 255);
  return { r, g, b, };
}

function colorString({ r, g, b }, a) {
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

function averageColor(c1, c2) {
  return {
    r: (c1.r + c2.r) / 2,
    g: (c1.g + c2.g) / 2,
    b: (c1.b + c2.b) / 2
  }
}

// math

function distance(a, b) {
	return Math.sqrt(
		Math.pow(a.x - b.x, 2) +
		Math.pow(a.y - b.y, 2)
	);
}

// WORLD -------------------------------------------------------------------------------------------

class World {
  constructor(ctx, width, height) {
    this.ctx = ctx;
    this.W = width;
    this.H = height;
    this.planets = [];
    this.setup();
    this.drawBackground();

    this.animate = this.animate.bind(this);
    this.animate();
  }

  setup() {
    const planetCount = randomProp(WORLD.PLANETS);
    for(let i = 0; i < planetCount; ++i) {
      this.planets.push(new Planet(this, i));
    }
  }

  drawBackground() {
    this.ctx.rect(0, 0, this.W, this.H);
    this.ctx.fillStyle = "#1c1c1c" + DRAW.FADE;
    this.ctx.fill();
  }

  animate() {
    this.drawBackground();
    this.planets.forEach(planet => {
      planet.move();
      planet.draw();
    });
    this.planets.forEach(planet1 => {
      this.planets.forEach(planet2 => {
        if(planet1.id < planet2.id) { // less than to only draw lines once
          planet1.drawLine(planet2);
        }
      })
    });
    // setTimeout(this.animate.bind(this), 64); // makes it kinda flipbook-y
    window.requestAnimationFrame(this.animate.bind(this));

  }
}

// POD ---------------------------------------------------------------------------------------------

class Planet {
  constructor(world, id) {
    this.world = world;
    this.ctx = this.world.ctx;
    this.id = id;
    this.color = randomColor();
    this.setup();
  }

  setup() {
    const direction = randomBool() ? 1 : -1;
    const angularVelocity = direction * randomProp(PLANET.ORBIT_SPEED);
    const radius = randomInt(PLANET.ORBIT_RADIUS_GAP, this.world.W - PLANET.ORBIT_RADIUS_GAP) / 2;
    const drawTick = randomProp(PLANET.DRAW_LINE_TICK);

    const angle = randomDec(0 , 2 * Math.PI);
    const x = this.world.W / 2 + radius * Math.cos(angle);
    const y = this.world.H / 2 + radius * Math.sin(angle);

    this.orbit = { radius, angularVelocity, drawTick };
    this.p = { x , y , angle, tick: 0 };
  }

  move() {
    const newAngle = this.p.angle + this.orbit.angularVelocity;
    this.p = {
      x: this.world.W / 2 + this.orbit.radius * Math.cos(newAngle),
      y: this.world.H / 2 + this.orbit.radius * Math.sin(newAngle),
      angle: newAngle,
      tick: this.p.tick + 1
    };

    if(this.p.tick === this.orbit.drawTick) {
      this.p.tick = 0;
    }
  }

  draw() {
    // orbit
    if(DRAW.ORBITS) {
      this.ctx.beginPath();
      this.ctx.arc(this.world.W/2, this.world.H/2, this.orbit.radius, 0, 2 * Math.PI, false);
      this.ctx.strokeStyle = "#FFF1";
      this.ctx.lineWidth = 1;
      this.ctx.stroke();
    }

    // planet
    if(DRAW.PLANETS) {
      this.ctx.beginPath();
      this.ctx.arc(this.p.x, this.p.y, 6, 0, 2 * Math.PI, false);
      this.ctx.fillStyle = colorString(this.color, 1);
      this.ctx.fill();
    }
  }

  drawLine(planet2) {
    // line (if line mode is ON || is TICKS and should draw this tick)
    if(DRAW.LINES === LINE_MODES.ON || (DRAW.LINES === LINE_MODES.TICKS && this.p.tick === 0)) {
      const grd = this.ctx.createLinearGradient(
        this.p.x,
        this.p.y,
        planet2.p.x,
        planet2.p.y
      );
      grd.addColorStop(0, colorString(this.color, .1));
      grd.addColorStop(1, colorString(planet2.color, .1));
      this.ctx.beginPath();
      this.ctx.moveTo(this.p.x, this.p.y);
      this.ctx.lineTo(planet2.p.x, planet2.p.y);
      this.ctx.strokeStyle = grd;
      this.ctx.lineWidth = 1;
      this.ctx.stroke();
    }

    if (DRAW.MIDPOINTS) {
      // midpoint
      const midX = (this.p.x + planet2.p.x)/2;
      const midY = (this.p.y + planet2.p.y)/2;
      const aveColor = averageColor(this.color, planet2.color);
      this.ctx.beginPath();
      this.ctx.arc(midX, midY, 2, 0, 2 * Math.PI, false);
      this.ctx.fillStyle = colorString(aveColor, .9);
      this.ctx.fill();

      // far point
      const aveColorFar = averageColor(planet2.color, aveColor);
      this.ctx.beginPath();
      this.ctx.arc((midX + planet2.p.x)/2, (midY + planet2.p.y)/2, 1, 0, 2 * Math.PI, false);
      this.ctx.fillStyle = colorString(aveColorFar, .8);;
      this.ctx.fill();

      // close point
      const aveColorClose = averageColor(this.color, aveColor);
      this.ctx.beginPath();
      this.ctx.arc((midX + this.p.x)/2, (midY + this.p.y)/2, 1, 0, 2 * Math.PI, false);
      this.ctx.fillStyle = colorString(aveColorClose, .8);
      this.ctx.fill();
    }
  }
}

// MAIN --------------------------------------------------------------------------------------------

window.onload = function () {
  const canvas = document.getElementById("pix");
  const ctx = canvas.getContext("2d");

  const W = window.innerWidth,
    H = window.innerHeight;
  canvas.width = W;
  canvas.height = H;

  new World(ctx, W, H);
};
