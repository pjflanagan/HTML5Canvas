
// CONST -------------------------------------------------------------------------------------------

const WORLD = {
  BIRD_COUNT: 1000,
  LEADER_COUNT: 12,
  RESET_LEADER_INTERVAL: 300
}

const BIRD = {
  HEIGHT: 12,
  ANGLE: -.5,
  VELOCITY_MAX: 5
}

// GLOBAL ------------------------------------------------------------------------------------------

function rando(min,max){
  return Math.floor(Math.random()*max)+min;	
}

function randomColor() {
  var rm = 255,
    gm = 255,
    bm = 255;
  var r = Math.round(Math.random()*rm);
  var g = Math.round(Math.random()*gm);
  var b = Math.round(Math.random()*bm);
  var a = (Math.random()*.3)+.4;
  var rgba = "rgba("+r+", "+g+", "+b+", "+a+")";
  return rgba;
}

// WORLD -------------------------------------------------------------------------------------------

class World {
  constructor(ctx, width, height) {
    this.ctx = ctx;
    this.W = width;
    this.H = height;
    this.D = (width + height) / 2;
    this.birds = [];
    this.leaders = [];
  }

  // INIT

  init () {
    this.drawBackground();
    this.initBirds();
    this.initLeaders();
    this.drawBirds();
  }

  initBirds() {
    for(var i = 0; i < WORLD.BIRD_COUNT; i++) {
      this.birds.push(new Bird(this, this.ctx, i));
    }
  }

  initLeaders() {
    for(let i = 0; i < WORLD.LEADER_COUNT; ++i) {
      const newLeader = rando(0, WORLD.BIRD_COUNT);
      this.leaders.push(newLeader)
      this.birds[newLeader].to = this.getRandomCoords();
    }
    this.cycleLeaders();
  }

  // ANIMATE

  run() {
    const world = this;
    setInterval(function() {
      world.animate();
    }, 32);
    setInterval(function() {
      world.cycleLeaders()
    }, WORLD.RESET_LEADER_INTERVAL);
  }

  animate() {
    this.drawBackground();
    this.drawBirds();
  }

  cycleLeaders() {
    this.leaders.shift();

    const newLeader = rando(0, WORLD.BIRD_COUNT);
    this.leaders.push(newLeader)

    this.birds[newLeader].to = this.getRandomCoords();
    for (let i = WORLD.BIRD_COUNT - 1; i >= 0; i--) {
      this.birds[i].setLeader(this.leaders[rando(0, WORLD.LEADER_COUNT)]);
    }
  }

  // DRAW

  drawBackground() {
		this.ctx.rect(0, 0, this.W, this.H);
		this.ctx.fillStyle = "#1c1c1c";
		this.ctx.fill();
  }
  
  drawBirds() {
    // TODO: sort the birds first to not draw on top
    for(let i = WORLD.BIRD_COUNT - 1; i >= 0; i--) {
      this.birds[i].draw();
      this.birds[i].move();
    }
  }

  // HELPER

  getRandomCoords() {
    return {
      x: rando(0, this.W),
      y: rando(0, this.H),
      z: rando(0, this.D)
    };
  }

  getBird(i) {
    return this.birds[i];
  }

  isLeader(i) {
    return _.includes(this.leaders, i);
  }
}

// BIRD --------------------------------------------------------------------------------------------

class Bird {
  constructor(world, ctx, i){
    const { x , y, z } = world.getRandomCoords();
    this.a = 0;
    this.x = x;
    this.y = y;
    this.z = z;

    this.leader = 0;
    this.to = world.getRandomCoords();

    this.i = i;
    this.ctx = ctx;
    this.world = world;

    this.v = BIRD.VELOCITY_MAX;
    this.color = randomColor();
  }

  move() {
    let { x, y, z } = this.world.getBird(this.leader);
    if (this.world.isLeader(this.i)) {
      x = this.to.x;
      y = this.to.y;
      z = this.to.z;
    }
    const dx = this.x - x, dy = this.y - y, dz = this.z - z;

    this.a = Math.atan2(dy, dx);
    // const a1 = Math.atan2(dy, dz);

    const vx = Math.cos(this.a) * this.v;
    const vy = Math.sin(this.a) * this.v;

    this.x = this.x - vx;
    this.y = this.y - vy;
  }

  draw() {
    this.ctx.beginPath();
		this.ctx.moveTo(this.x, this.y);
		this.ctx.lineTo(this.x + Math.sin(this.a - BIRD.ANGLE) * BIRD.HEIGHT, this.y + Math.cos(this.a - BIRD.ANGLE) * BIRD.HEIGHT);
		this.ctx.lineTo(this.x + Math.cos(this.a + BIRD.ANGLE) * BIRD.HEIGHT, this.y - Math.sin(this.a + BIRD.ANGLE) * BIRD.HEIGHT);
		this.ctx.fillStyle = this.getColor();
		this.ctx.fill();
		this.ctx.closePath();
  }

  getColor() {
    return this.color;
  }

  setLeader(i) {
    this.leader = i;
  }
}

// MAIN --------------------------------------------------------------------------------------------

window.onload = function(){

	const canvas = document.getElementById("pix");
	const ctx = canvas.getContext("2d");
	
	const W = window.innerWidth, H = window.innerHeight;
	canvas.width = W;
	canvas.height = H;

  const world = new World(ctx, W, H);
  world.init();
  world.run();
}

