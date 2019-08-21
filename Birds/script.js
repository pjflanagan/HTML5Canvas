
// CONST -------------------------------------------------------------------------------------------

const WORLD = {
  BIRD_COUNT: 100,
  RESET_LEADER_INTERVAL: 1 * 1000
}

const BIRD = {
  WIDTH: 4,
  HEIGHT: 12,
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
  }

  // SETUP

  init () {
    this.drawBackground();
    this.initBirds();
    this.resetLeader();
    this.drawBirds();
  }

  initBirds() {
    for(var i = 0; i < WORLD.BIRD_COUNT; i++) {
      this.birds.push(new Bird(this, this.ctx, i));
    }
  }

  resetLeader() {
    // TODO: have several different leaders
    this.leader = rando(0, WORLD.BIRD_COUNT)
    this.birds[this.leader].to = this.getRandomCoords();
  }

  isLeader(i) {
    return _.includes(this.leaders, i);
  }

  // ANIMATE

  run() {
    const world = this;
    setInterval(function() {
      world.animate();
    }, 32);
    setInterval(function() {
      world.resetLeader()
    }, WORLD.RESET_LEADER_INTERVAL);
  }

  animate() {
    this.drawBackground();
    this.drawBirds();
  }

  // DRAW

  drawBackground() {
		this.ctx.rect(0, 0, this.W, this.H);
		this.ctx.fillStyle = "#1c1c1c";
		this.ctx.fill();
  }
  
  drawBirds() {
    // TODO: sort the birds first to not draw on top
    for(var i = WORLD.BIRD_COUNT - 1; i >= 0; i--) {
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

  getLeader() {
    return this.birds[this.leader];
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
    this.to = world.getRandomCoords();

    this.i = i;
    this.ctx = ctx;
    this.world = world;

    this.v = BIRD.VELOCITY_MAX;
    this.color = randomColor();
  }

  move() {
    let { i, x, y, z } = this.world.getLeader();
    if (i === this.i) {
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
		this.ctx.lineTo(this.x - Math.cos(this.a) * BIRD.WIDTH , this.y + Math.sin(this.a) * BIRD.HEIGHT);
		this.ctx.lineTo(this.x + Math.cos(this.a) * BIRD.WIDTH, this.y + Math.sin(this.a) * BIRD.HEIGHT);
		this.ctx.fillStyle = this.getColor();
		this.ctx.fill();
		this.ctx.closePath();
  }

  getColor() {
    return this.color;
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

