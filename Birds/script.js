
// CONST -------------------------------------------------------------------------------------------

const WORLD = {
  BIRD_COUNT: 1000,
  CLOSE_TO_POINT_DISTANCE: 40,
  LEADER_POINT_BOUNDS: 140,
  CLOSE_TO_EDGE_BOUNDS: 40
}

const BIRD = {
  // SHAPE
  HEIGHT_MAX: 20,
  ANGLE: -.25,
  // SPEED
  BEZIER_DISTANCE: 40,
  VELOCITY_MAX: 8,
  ANGULAR_VELOCITY_MIN: .08, // .04,
  ANGULAR_VELOCITY_MAX: .28, // .1,
  // BRAIN
  CHANGE_MIND_TIMEOUT_MIN: 500,
  CHANGE_MIND_TIMEOUT_MAX: 2000,
  CHANGE_FROM_IS_FOLLOWING_LIKELIHOOD: .3,
  CHANGE_FROM_NOT_FOLLOWING_LIKELIHOOD: .7,
  CHANGE_LEADER_LIKELIHOOD: .2,
  PANIC_TIMEOUT: 800
}

// GLOBAL ------------------------------------------------------------------------------------------

function randoInt(min, max){
  return Math.floor(Math.random()*(max - min)) + min;
}

function randoDec(min, max){
  return Math.random()*(max - min) + min;
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
    this.max = distance({ x: this.W, y: this.H, z:this.D }, { x:0, y:0, z:0 });
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

    this.interval = setInterval(function() {
      world.animate();
    }, 32);
  }

  animate() {
    this.drawBackground();
    this.drawBirds();
  }

  stop() {
    clearInterval(this.interval);
  }

  // DRAW

  drawBackground() {
		this.ctx.rect(0, 0, this.W, this.H);
		this.ctx.fillStyle = "#FFF"; // "#1c1c1c";
		this.ctx.fill();
  }

  drawPoint({x,y}) {
    this.ctx.beginPath();
    this.ctx.arc(x, y, WORLD.CLOSE_TO_POINT_DISTANCE, 0, 2 * Math.PI, false);
    this.ctx.fillStyle = '#0004';
    this.ctx.fill();
  }
  
  drawBirds() {
    const sortedBirds = _.sortBy(this.birds, function(b){
      return -b.z;
    })
    // const sortedBirds = this.birds;
    for(let i = WORLD.BIRD_COUNT - 1; i >= 0; i--) {
      const bird = sortedBirds[i];
      bird.draw();
      bird.move();
    }
  }

  // HELPER

  getRandomCoords() {
    return {
      x: randoInt(0, this.W),
      y: randoInt(0, this.H),
      z: randoInt(0, this.D)
    };
  }

  getRandomLeaderCoords() {
    return {
      x: randoInt(WORLD.LEADER_POINT_BOUNDS, this.W - WORLD.LEADER_POINT_BOUNDS),
      y: randoInt(WORLD.LEADER_POINT_BOUNDS, this.H - WORLD.LEADER_POINT_BOUNDS),
      z: randoInt(WORLD.LEADER_POINT_BOUNDS, this.D - WORLD.LEADER_POINT_BOUNDS)
    }
  }

  isCloseToEdge({ x, y, z }) {
    return (
      x < WORLD.CLOSE_TO_EDGE_BOUNDS || x > this.W - WORLD.CLOSE_TO_EDGE_BOUNDS ||
      y < WORLD.CLOSE_TO_EDGE_BOUNDS || y > this.H - WORLD.CLOSE_TO_EDGE_BOUNDS ||
      z < WORLD.CLOSE_TO_EDGE_BOUNDS || z > this.D - WORLD.CLOSE_TO_EDGE_BOUNDS
    )
  }

  getBird(i) {
    return this.birds[i];
  }

  randomBird() {
    return randoInt(0, WORLD.BIRD_COUNT);
  }

  zScale(z) {
    return .5 * (z / this.D) + .5;
  }

  getMax(){
    return this.max;
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
    this.aXY = randoDec(0, 2 * Math.PI);
    this.aZ = randoDec(0, 2 * Math.PI);
    this.x = x;
    this.y = y;
    this.z = z;
    this.v = BIRD.VELOCITY_MAX;
    this.va = randoDec(BIRD.ANGULAR_VELOCITY_MIN, BIRD.ANGULAR_VELOCITY_MAX);
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
    }, randoInt(BIRD.CHANGE_MIND_TIMEOUT_MIN, BIRD.CHANGE_MIND_TIMEOUT_MAX));
  }

  changeTo() {
    if (!this.isPanic) {
      if (this.isFollowing && Math.random() < BIRD.CHANGE_FROM_IS_FOLLOWING_LIKELIHOOD) {
        this.isFollowing = false;
        this.to = this.world.getRandomLeaderCoords();
        this.va = randoDec(BIRD.ANGULAR_VELOCITY_MIN, BIRD.ANGULAR_VELOCITY_MAX)
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
    return distance({ x: this.x, y: this.y, z: this.to.z }, this.to ) < WORLD.CLOSE_TO_POINT_DISTANCE; // TODO: use z dim properly
  }

  chooseNewPoint(isPanic) {
    this.isFollowing = false;
    this.isPanic = isPanic;
    this.to = this.world.getRandomLeaderCoords();
    this.va = randoDec(BIRD.ANGULAR_VELOCITY_MIN, BIRD.ANGULAR_VELOCITY_MAX)
  }

  getTo() {
    // if not following someone
    if(!this.isFollowing) {

      // if close to the point they chose
      if(this.isCloseToPoint()) {
        this.chooseNewPoint(false);
      }

      // go to the point they chose
      return this.to;
    }

    // if follwoing someone but close to edge
    if(this.isCloseToEdge()) {
      this.chooseNewPoint(true); // panic
      return this.to;
    }

    // otherwise return the bird they are following
    return this.world.getBird(this.leader);
  }

  getAngleTo(to) {
    const dx = this.x - to.x, dy = this.y - to.y; // , dz = this.z - z;
    return -1.0 * Math.atan2(dx, dy) + Math.PI / 2;
  }

  getDeltaAngle(to) {
    const a = this.getAngleTo(to);
    return this.va * Math.sign(this.aXY - a);
  }

  move() {
    const to = this.getTo();

    this.aXY = this.aXY - this.getDeltaAngle(to);
    // this.aXY = this.getAngleTo(to);
    // this.aZ = this.aZ - Math.atan2(dy, dz) * this.va;

    const vx = Math.cos(this.aXY) * this.v;
    const vy = Math.sin(this.aXY) * this.v;
    // const vz = Math.cos(this.aZ) * this.v;

    this.x = this.x - vx;
    this.y = this.y - vy;
    // this.z = this.z - vz;
  }

  draw() {
    const height = BIRD.HEIGHT_MAX * this.world.zScale(this.z);
    this.ctx.beginPath();
		this.ctx.moveTo(this.x, this.y);
		this.ctx.lineTo(this.x + Math.cos(this.aXY - BIRD.ANGLE) * height, this.y + Math.sin(this.aXY - BIRD.ANGLE) * height);
		this.ctx.lineTo(this.x + Math.cos(this.aXY + BIRD.ANGLE) * height, this.y + Math.sin(this.aXY + BIRD.ANGLE) * height);
		this.ctx.fillStyle = this.getColor();
		this.ctx.fill();
		this.ctx.closePath();
  }

  getColor() {
    // if (this.isFollowing) {
    //   return '#0F0';
    // } else if (this.isPanic) {
    //   return '#F00';
    // }
    // return '#00F';
    return `rgba(0, 0, 0, ${this.world.zScale(this.z)})`;
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

