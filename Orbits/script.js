// CONST -------------------------------------------------------------------------------------------

const WORLD = {
  PLANETS: { min: 2, max: 5},
  DRAW_INTERVAL: { min: 3, max: 8 } // min is faster
};

const PLANET = {
  ORBIT_SPEED: {min: .03, max: .2},
  ORBIT_RADIUS_MIN: 200
}

// GLOBAL ------------------------------------------------------------------------------------------

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
  return randomDec(min, max);
}

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
    console.log(this.planets);
  }

  drawBackground() {
    this.ctx.rect(0, 0, this.W, this.H);
    this.ctx.fillStyle = "#1c1c1caa";
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
    setTimeout(this.animate.bind(this), 64);
  }
}

// POD ---------------------------------------------------------------------------------------------

class Planet {
  constructor(world, id) {
    this.world = world;
    this.ctx = this.world.ctx;
    this.id = id;
    this.setup();
  }

  setup() {
    const direction = randomBool() ? 1 : -1;
    console.log(direction);
    const angularVelocity = direction * randomProp(PLANET.ORBIT_SPEED);
    console.log({angularVelocity});
    const radius = randomInt(PLANET.ORBIT_RADIUS_MIN, this.world.W - PLANET.ORBIT_RADIUS_MIN) / 2;
    const angle = randomDec(0 , 2 * Math.PI);
    const x = this.world.W / 2 + radius * Math.cos(angle);
    const y = this.world.H / 2 + radius * Math.sin(angle);

    this.orbit = { radius, angularVelocity};
    this.p = { x , y , angle };
  }

  move() {
    const newAngle = this.p.angle + this.orbit.angularVelocity;
    this.p = {
      x: this.world.W / 2 + this.orbit.radius * Math.cos(newAngle),
      y: this.world.H / 2 + this.orbit.radius * Math.sin(newAngle),
      angle: newAngle
    };
  }

  draw() {
    this.ctx.beginPath();
    this.ctx.arc(this.p.x, this.p.y, 6, 0, 2 * Math.PI, false);
    this.ctx.fillStyle = "#FFF";
    this.ctx.fill();
  }

  drawLine(planet2) {
    if(distance(this.p, planet2.p) < 600) {
      this.ctx.beginPath();
      this.ctx.moveTo(this.p.x, this.p.y);
      this.ctx.lineTo(planet2.p.x, planet2.p.y);
      this.ctx.strokeStyle = "#FFF3";
      this.ctx.lineWidth = 1;
      this.ctx.stroke();
    }

    // draw midpoint
    this.ctx.beginPath();
    this.ctx.arc((this.p.x + planet2.p.x)/2, (this.p.y + planet2.p.y)/2, 2, 0, 2 * Math.PI, false);
    this.ctx.fillStyle = "#FFFa";
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

  new World(ctx, W, H);
};
