
// CONST -------------------------------------------------------------------------------------------

const WORLD = {
  BIRD_COUNT: 2000,
  CLOSE_TO_POINT_DISTANCE: 40,
  LEADER_POINT_BOUNDS_PERCENT: .4,
  CLOSE_TO_EDGE_PERCENT: .3
}

const BIRD = {
  // SHAPE
  HEIGHT_MAX: 20,
  ANGLE: -.25,
  // SPEED
  VELOCITY_MAX: 4,
  ANGULAR_VELOCITY_MIN: .02,
  ANGULAR_VELOCITY_MAX: .16,
  // BRAIN
  CHANGE_MIND_TIMEOUT_MIN: 500,
  CHANGE_MIND_TIMEOUT_MAX: 2000,
  CHANGE_FROM_IS_FOLLOWING_LIKELIHOOD: .3,
  CHANGE_FROM_NOT_FOLLOWING_LIKELIHOOD: .7,
  CHANGE_LEADER_LIKELIHOOD: .2,
  PANIC_TIMEOUT: 800
}

// GLOBAL ------------------------------------------------------------------------------------------

function rando(min,max){
  return Math.floor(Math.random()*max)+min;	
}

function randomBool() {
  return Math.random() > 0.5;
}

function randomColor() {
  var r = Math.round(Math.random()*255);
  var g = Math.round(Math.random()*255);
  var b = Math.round(Math.random()*255);
  var a = 1; // (Math.random()*.3)+.4;
  return `rgba(${r}, ${g}, ${b}, ${a})`
}

function distance(a, b) {
  return Math.sqrt(
    Math.pow(a.x - b.x, 2) +
    Math.pow(a.y - b.y, 2) +
    Math.pow(a.z - b.z, 2)
  );
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
    this.drawBirds();
  }

  initBirds() {
    for(var i = 0; i < WORLD.BIRD_COUNT; i++) {
      this.birds.push(new Bird(this, this.ctx, i));
    }
  }

  // ANIMATE

  run() {
    const world = this;

    for(let i = WORLD.BIRD_COUNT - 1; i >= 0; i--) {
      this.birds[i].run(); // starts the bird brain
    }

    setInterval(function() {
      world.animate();
    }, 32);
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
    const sortedBirds = _.sortBy(this.birds, function(b){
      return -b.z;
    })
    for(let i = WORLD.BIRD_COUNT - 1; i >= 0; i--) {
      sortedBirds[i].draw();
      sortedBirds[i].move();
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

  getRandomLeaderCoords() {
    return {
      x: rando(this.W * WORLD.LEADER_POINT_BOUNDS_PERCENT, this.W * (1 - WORLD.LEADER_POINT_BOUNDS_PERCENT)),
      y: rando(this.H * WORLD.LEADER_POINT_BOUNDS_PERCENT, this.H * (1 - WORLD.LEADER_POINT_BOUNDS_PERCENT)),
      z: rando(this.D * WORLD.LEADER_POINT_BOUNDS_PERCENT, this.D * (1 - WORLD.LEADER_POINT_BOUNDS_PERCENT))
    }
  }

  isCloseToEdge({ x, y, z }) {
    return (
      x < this.W * WORLD.CLOSE_TO_EDGE_PERCENT || x > this.W * (1 - WORLD.CLOSE_TO_EDGE_PERCENT) ||
      y < this.H * WORLD.CLOSE_TO_EDGE_PERCENT || y > this.H * (1 - WORLD.CLOSE_TO_EDGE_PERCENT) ||
      z < this.D * WORLD.CLOSE_TO_EDGE_PERCENT || z > this.D * (1 - WORLD.CLOSE_TO_EDGE_PERCENT)
    )
  }

  getBird(i) {
    return this.birds[i];
  }

  randomBird() {
    return rando(0, WORLD.BIRD_COUNT);
  }

  zScale(z) {
    return z / this.D;
  }
}

// BIRD --------------------------------------------------------------------------------------------

// rather than globally set leaders, birds should pick thier own points to go to
// birds pick leaders in the area around them or points to go to
// when that point or leader expires birds pick a new point or leader
// if a bird gets too close to the edge it should "panic" and go back towards the center (choose a new point)
// if a bird gets to a point before it expires it should go to another point

class Bird {
  constructor(world, ctx, i){
    this.i = i;
    this.ctx = ctx;
    this.world = world;

    const { x , y, z } = this.world.getRandomCoords();
    this.a = rando(0, 2*Math.PI);
    this.x = x;
    this.y = y;
    this.z = z;
    this.v = BIRD.VELOCITY_MAX;
    this.va = rando(BIRD.ANGULAR_VELOCITY_MIN, BIRD.ANGULAR_VELOCITY_MAX);
    this.color = randomColor();

    this.isFollowing = randomBool();
    this.isPanic = false;
    this.leader = this.world.randomBird();
    this.to = this.world.getRandomLeaderCoords();
  }

  run() {
    const bird = this;
    setTimeout(function() {
      bird.changeTo();
    }, rando(BIRD.CHANGE_MIND_TIMEOUT_MIN, BIRD.CHANGE_MIND_TIMEOUT_MAX));
  }

  changeTo() {
    if (!this.isPanic) {
      if (this.isFollowing && Math.random() < BIRD.CHANGE_FROM_IS_FOLLOWING_LIKELIHOOD) {
        this.isFollowing = false;
        this.to = this.world.getRandomLeaderCoords();
      } else if (this.isFollowing && Math.random() < BIRD.CHANGE_LEADER_LIKELIHOOD) {
        this.leader = this.world.randomBird();
      } else if (!this.isFollowing && Math.random() < BIRD.CHANGE_FROM_NOT_FOLLOWING_LIKELIHOOD){
        this.isFollowing = true;
        this.leader = this.world.randomBird();
      }
    }
    this.run();
  }

  isCloseToEdge() {
    const { x, y, z } = this;
    return this.world.isCloseToEdge({ x, y, z });
  }

  isCloseToPoint() {
    if (distance({ x: this.x, y: this.y, z: this.z }, this.to ) < WORLD.CLOSE_TO_POINT_DISTANCE) {
      console.log("CLOSE TO POINT");
      return true;
    }
    return false;
    // return distance({ x: this.x, y: this.y, z: this.z }, this.to ) < WORLD.CLOSE_TO_POINT_DISTANCE;
  }

  panic() {
    this.isFollowing = false;
    this.isPanic = true;
    this.to = this.world.getRandomLeaderCoords();

    const bird = this;
    setTimeout(function(){
      bird.isPanic = false;
    }, BIRD.PANIC_TIMEOUT);
  }

  getTo() {
    if(!this.isFollowing) {
      return this.to;
    } else if(this.isCloseToEdge()) {
      this.panic();
      return this.to;
    } else if(this.isCloseToPoint()) {
      this.to = this.world.getRandomLeaderCoords();
      return this.to;
    }
    return this.world.getBird(this.leader);
  }

  move() {
    let { x, y, z } = this.getTo();
    const dx = this.x - x, dy = this.y - y, dz = this.z - z;

    const dir = Math.atan2(dy, dx);
    const va = this.va; // TODO: proportional to distance to point
    this.a = (Math.abs(this.a - dir) < .5) ? this.a : this.a - dir * va;
    const az = Math.atan2(dy, dz);

    const vx = Math.cos(this.a) * this.v;
    const vy = Math.sin(this.a) * this.v;
    const vz = Math.cos(az) * this.v;

    this.x = this.x - vx;
    this.y = this.y - vy;
    this.z = this.z - vz;
  }

  draw() {
    const height = BIRD.HEIGHT_MAX * this.world.zScale(this.z);
    this.ctx.beginPath();
		this.ctx.moveTo(this.x, this.y);
		this.ctx.lineTo(this.x + Math.cos(this.a - BIRD.ANGLE) * height, this.y + Math.sin(this.a - BIRD.ANGLE) * height);
		this.ctx.lineTo(this.x + Math.cos(this.a + BIRD.ANGLE) * height, this.y + Math.sin(this.a + BIRD.ANGLE) * height);
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

