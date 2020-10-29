// CONST -------------------------------------------------------------------------------------------

const WORLD = {
  MAX_ALIVE: 12,
  DRAW_SPEED: 8,
};

const LOOP = {
  COUNT: { max: 16, min: 8 },
  LENGTH: { max: 14, min: 6 },
  WIDTH: { max: 8, min: 3 },
};

const APODMENT = {
  COUNT: { max: 60, min: 30 },
  LENGTH: { max: 6, min: 1 },
  WIDTH: { max: 6, min: 3 },
};

// GLOBAL ------------------------------------------------------------------------------------------

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

function randomDec(min, max) {
  return Math.random() * (max - min) + min;
}

function randomBool() {
  return randomOdds(0.5);
}

function randomOdds(likelihood) {
  return Math.random() < likelihood;
}

function randomProp({ min, max }) {
  return randomInt(min, max);
}

function randomColor() {
  var r = Math.round(Math.random() * 255);
  var g = Math.round(Math.random() * 255);
  var b = Math.round(Math.random() * 255);
  var a = 1; // (Math.random()*.3)+.4;
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

// WORLD -------------------------------------------------------------------------------------------

class World {
  constructor(ctx, width, height) {
    this.ctx = ctx;
    this.W = width;
    this.H = height;
    this.pods = [];
    this.drawBackground();

    const { angle, pos } = this.chooseDirection();
    this.addPodToQueue(new Loop(this, randomLoop({ pos, angle })));
    this.animate();
  }

  drawBackground() {
    this.ctx.rect(0, 0, this.W, this.H);
    const grd = this.ctx.createRadialGradient(
      this.W / 2,
      this.H / 2,
      0,
      this.W / 2,
      this.H / 2,
      this.W / 2
    );
    grd.addColorStop(0, "#ffffff0a");
    grd.addColorStop(1, "#d1d1d10a");
    this.ctx.fillStyle = grd;
    this.ctx.fill();
  }

  chooseDirection() {
    return {
      pos: {
        x: this.W / 2,
        y: this.H / 2,
      },
      angle: randomDec(0, 2 * Math.PI),
    };
  }

  isOutOfBounds({ x, y }) {
    return x < 0 || x > this.W || y < 0 || y > this.H;
  }

  addPodToQueue(pod) {
    if (this.pods.length < WORLD.MAX_ALIVE && !pod.isOutOfBounds()) {
      this.pods.push(pod);
    }
  }

  newPodOdds() {
    return 1 - this.pods.length / WORLD.MAX_ALIVE;
  }

  animate() {
    this.drawBackground();
    for (let i = 0; i < WORLD.DRAW_SPEED; i++) {
      const pod = this.pods.shift();
      if (!!pod) {
        pod.animate();
      }
    }
    if (this.pods.length > 0) {
      window.requestAnimationFrame(this.animate.bind(this));
    }
  }
}

// POD ---------------------------------------------------------------------------------------------

class Pod {
  constructor(world, data) {
    this.world = world;
    this.ctx = this.world.ctx;
    this.p1 = data.pos;
    this.width = data.width;
    this.length = data.length;
    this.angle = data.angle;
    this.count = data.count;
    this.color = data.color;
    this.calcP2();
  }

  calcP2() {
    this.p2 = {
      x: this.p1.x + this.length * Math.sin(this.angle),
      y: this.p1.y + this.length * Math.cos(this.angle),
    };
  }

  draw() {
    const { p1, p2 } = this;
    this.ctx.beginPath();
    this.ctx.moveTo(p1.x, p1.y);
    this.ctx.lineTo(p2.x, p2.y);
    this.ctx.strokeStyle = this.color;
    this.ctx.lineWidth = this.width;
    this.ctx.stroke();
  }

  animate() {
    this.draw();
    this.setNext();
  }

  isOutOfBounds() {
    return (
      this.world.isOutOfBounds(this.p1) || this.world.isOutOfBounds(this.p2)
    );
  }
}

// Loop

function randomLoop({ pos, angle }) {
  const fullCount = randomProp(LOOP.COUNT);
  return {
    pos,
    angle,
    count: fullCount,
    fullCount: fullCount,
    color: randomColor(),
    dir: randomBool() ? 1 : -1,
    length: randomProp(LOOP.LENGTH),
    width: randomProp(LOOP.WIDTH),
  };
}

class Loop extends Pod {
  constructor(world, data) {
    super(world, data);
    this.dir = data.dir;
    this.fullCount = data.fullCount;
  }

  setNext() {
    if (this.count !== 0) {
      this.world.addPodToQueue(
        new Loop(this.world, {
          pos: this.p2,
          angle: this.angle + this.dir * ((2 * Math.PI) / this.fullCount),
          count: this.count - 1,
          fullCount: this.fullCount,
          color: this.color,
          dir: this.dir,
          length: this.length,
          width: this.width,
        })
      );
    }
    if (randomOdds(this.world.newPodOdds())) {
      this.world.addPodToQueue(
        new Apodment(
          this.world,
          randomApodment({
            pos: this.p2,
            angle:
              this.angle -
              (2 * Math.PI) / this.fullCount -
              (this.dir * Math.PI) / 2,
            color: this.color
          })
        )
      );
    }
  }
}

// Apodment

function randomApodment({ pos, angle, color }) {
  return {
    pos: pos,
    angle: angle,
    count: randomProp(APODMENT.COUNT),
    color: color || randomColor(),
    length: randomProp(APODMENT.LENGTH),
    width: randomProp(APODMENT.WIDTH),
  };
}

class Apodment extends Pod {
  constructor(world, data) {
    super(world, data);
  }

  setNext() {
    // if the row is done then draw a loop
    // otherwise draw another in the row
    if (this.count === 0) {
      if (randomOdds(this.world.newPodOdds())) {
        this.world.addPodToQueue(
          new Loop(
            this.world,
            randomLoop({
              pos: this.p2,
              angle: this.angle + Math.PI / 2,
            })
          )
        );
      }
    } else {
      this.world.addPodToQueue(
        new Apodment(this.world, {
          pos: this.p2,
          angle: this.angle,
          count: this.count - 1,
          color: this.color,
          length: this.length,
          width: this.width,
        })
      );
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
