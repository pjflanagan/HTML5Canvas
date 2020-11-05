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
  PLANET: {
    FADE: "88",
    PLANETS: true,
    ORBITS: true,
    MIDPOINTS: true,
    LINES: LINE_MODES.ON,
    SECONDARY: LINE_MODES.OFF
  },
  ATOM: {
    FADE: "10",
    PLANETS: false,
    ORBITS: false,
    MIDPOINTS: true,
    LINES: LINE_MODES.OFF,
    SECONDARY: LINE_MODES.OFF
  },
  LINES: {
    FADE: "01",
    PLANETS: false,
    ORBITS: false,
    MIDPOINTS: false,
    LINES: LINE_MODES.TICKS,
    SECONDARY: LINE_MODES.OFF
  },
  TOROID: {
    FADE: "01",
    PLANETS: false,
    ORBITS: false,
    MIDPOINTS: false,
    LINES: LINE_MODES.OFF,
    SECONDARY: LINE_MODES.TICKS
  },
  TRIANGLE: {
    FADE: "88",
    PLANETS: false,
    ORBITS: false,
    MIDPOINTS: false,
    LINES: LINE_MODES.OFF,
    SECONDARY: LINE_MODES.OFF,
    TRIANGLE: true
  }
}

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
  constructor(ctx, width, height, mode) {
    this.ctx = ctx;
    this.W = width;
    this.H = height;
    this.selectMode(mode);
    this.planets = [];
    this.setup();
    this.drawBackground();

    this.animate = this.animate.bind(this);
    this.animate();
  }

  selectMode(mode) {
    const modesList = Object.keys(MODES);
    if (mode === undefined){
      this.mode = MODES[modesList[randomInt(0, modesList.length-1)]];
      return
    }
    const modeName = modesList[mode];
    if(MODES[modeName]) {
      this.mode = MODES[modeName];
    } else {
      this.mode = MODES[modesList[randomInt(0, modesList.length-1)]];
    }
  }

  setup() {
    let planetCount = randomProp(WORLD.PLANETS);
    if(this.mode.SECONDARY !== LINE_MODES.OFF || this.mode.TRIANGLE) planetCount += 1;
    for(let i = 0; i < planetCount; ++i) {
      this.planets.push(new Planet(this, i));
    }
  }

  drawBackground() {
    this.ctx.rect(0, 0, this.W, this.H);
    this.ctx.fillStyle = "#1c1c1c" + this.mode.FADE;
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

          if(this.mode.SECONDARY !== LINE_MODES.OFF || this.mode.TRIANGLE) {
            this.planets.forEach(planet3 => {
              if(this.mode.SECONDARY !== LINE_MODES.OFF && planet2.id < planet3.id) {
                planet1.drawSecondLine(planet2, planet3);
              }
              if(this.mode.TRIANGLE && (planet3.id !== planet1.id || planet3.id !== planet2.id)) {
                planet1.drawTriangle(planet2, planet3);
              }
            });
          }
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
    this.mode = this.world.mode;
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
    if(this.mode.ORBITS) {
      this.ctx.beginPath();
      this.ctx.arc(this.world.W/2, this.world.H/2, this.orbit.radius, 0, 2 * Math.PI, false);
      this.ctx.strokeStyle = "#FFF1";
      this.ctx.lineWidth = 1;
      this.ctx.stroke();
    }

    // planet
    if(this.mode.PLANETS) {
      this.ctx.beginPath();
      this.ctx.arc(this.p.x, this.p.y, 6, 0, 2 * Math.PI, false);
      this.ctx.fillStyle = colorString(this.color, 1);
      this.ctx.fill();
    }
  }

  shouldDrawLine(line) {
    return (
      line === LINE_MODES.ON // if the line mode is on
      || (line === LINE_MODES.TICKS && this.p.tick === 0) // or set to ticks and it is time
    );
  }

  drawLine(planet2) {
    // line (if line mode is ON || is TICKS and should draw this tick)
    if(this.shouldDrawLine(this.mode.LINES)) {
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

    if (this.mode.MIDPOINTS) {
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

  drawSecondLine(planet2, planet3) {
    if(!this.shouldDrawLine(this.mode.SECONDARY))
      return;
    const mid2X = (this.p.x + planet2.p.x)/2;
    const mid2Y = (this.p.y + planet2.p.y)/2;
    const mid3X = (this.p.x + planet3.p.x)/2;
    const mid3Y = (this.p.y + planet3.p.y)/2;
    this.ctx.beginPath();
    this.ctx.moveTo(mid2X, mid2Y);
    this.ctx.lineTo(mid3X, mid3Y);
    this.ctx.strokeStyle = colorString(this.color, .9);
    this.ctx.lineWidth = 1;
    this.ctx.stroke();
  }

  drawTriangle(planet2, planet3) {
    const opMidX = (planet2.p.x + planet3.p.x)/2;
    const opMidY = (planet2.p.y + planet3.p.y)/2;
    const opAveColor = averageColor(planet2.color, planet3.color);
    const grd = this.ctx.createLinearGradient(
      this.p.x,
      this.p.y,
      opMidX,
      opMidY
    );
    grd.addColorStop(0, colorString(this.color, .6));
    grd.addColorStop(1, colorString(opAveColor, .6));
    this.ctx.beginPath();
    this.ctx.moveTo(this.p.x, this.p.y);
    this.ctx.lineTo(planet2.p.x, planet2.p.y);
    this.ctx.lineTo(planet3.p.x, planet3.p.y);
    this.ctx.fillStyle = grd;
    this.ctx.fill();
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

  const urlParams = new URLSearchParams(window.location.search);
  let mode = parseInt(urlParams.get('mode'));
  new World(ctx, W, H, mode);
};
