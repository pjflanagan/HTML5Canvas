
// CONST -------------------------------------------------------------------------------------------

const WORLD = {
	BUG_COUNT: 5000,
  CLOSE_TO_POINT_DISTANCE: 20,
  NEXT_POINT_DISTANCE: 100,
}

const BUG = {
  VELOCITY_MIN: .2,
  VELOCITY_MAX: .8,
  BLINK_TIMEOUT_MIN: 600,
  BLINK_TIMEOUT_MAX: 2000,
  BLINK_DURATION_MIN: 80,
  BLINK_DURATION_MAX: 120
}

Math.HALF_PI = Math.PI / 2;
Math.TWO_PI = Math.PI * 2;

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

function randomColor() {
	var r = Math.round(Math.random() * 255);
	var g = Math.round(Math.random() * 255);
	var b = Math.round(Math.random() * 255);
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
		this.bugs = [];
    this.max = distance({ x: this.W, y: this.H, z: this.D }, { x: 0, y: 0, z: 0 });
    
    this.drawBackground();
		this.initBugs();
		this.drawBugs();
	}

	// INIT

	initBugs() {
		for (var i = 0; i < WORLD.BUG_COUNT; i++) {
			this.bugs.push(new Bug(this, i));
		}
  }

	// ANIMATE

	run() {
    window.requestAnimationFrame(this.animate.bind(this));
	}

	animate() {
		this.drawBackground();
    this.drawBugs();
    window.requestAnimationFrame(this.animate.bind(this));
	}

	stop() {
		clearInterval(this.interval);
	}

	// DRAW

	drawBackground() {
		this.ctx.rect(0, 0, this.W, this.H);
		this.ctx.fillStyle = "#1c1c1c";
		this.ctx.fill();
	}

	drawBugs() {
		for (let i = WORLD.BUG_COUNT - 1; i >= 0; i--) {
      const bug = this.bugs[i];
			bug.draw();
      bug.move(Date.now());
		}
	}

	// HELPER

	getRandomCoords() {
		return {
			x: randomInt(-100, this.W+100),
			y: randomInt(-100, this.H+100),
			z: randomInt(-100, this.D+100)
		};
	}

	isCloseToEdge({ x, y, z }) {
		return (
			x < 0 || x > this.W ||
			y < 0 || y > this.H ||
			z < 0 || z > this.D
		)
	}

	zScale(z) {
		return .5 * (z / this.D) + .5;
	}

	getMax() {
		return this.max;
  }
  
  getCtx() {
    return this.ctx;
  }
}

// BUG ---------------------------------------------------------------------------------------------

class Bug {
	constructor(world, i) {
    this.world = world;
    this.ctx = this.world.getCtx();
		this.i = i;

		this.pos = this.world.getRandomCoords();
    this.to = this.world.getRandomCoords();
    this.v = BUG.VELOCITY_MAX;

    this.on = randomOdds(.2);
    this.blink();
  }

  setNextBlinkTime() {
    if(this.on) {
      this.nextBlinkTime = Date.now() + randomDec(BUG.BLINK_DURATION_MIN, BUG.BLINK_DURATION_MAX);
    } else {
      this.nextBlinkTime = Date.now() + randomDec(BUG.BLINK_TIMEOUT_MIN, BUG.BLINK_TIMEOUT_MAX);
    }
  }

  blink() {
    this.on = !this.on;
    this.setNextBlinkTime();
  }

	move(date) {
    if (this.isCloseToPoint()) {
      this.chooseNewPoint();
    }

    if (date > this.nextBlinkTime) {
      this.blink();
    }

    const { aXY, aZ } = this.getAngleTo();

		const vx = Math.cos(aXY) * this.v;
		const vy = Math.sin(aXY) * this.v;
		const vz = Math.cos(aZ) * this.v;

		this.pos = {
      x: this.pos.x - vx,
      y: this.pos.y - vy,
      z: this.pos.z - vz
    }
	}

	draw() {
    const radius = randomDec(.5, 1.2); // TODO: set this to be distance somehow
		this.ctx.beginPath();
		this.ctx.moveTo(this.pos.x, this.pos.y);
    this.ctx.arc(this.pos.x, this.pos.y, radius, 0, Math.TWO_PI, false);
		this.ctx.fillStyle = this.getColor();
		this.ctx.fill();
		this.ctx.closePath();
	}

	getColor() {
    if(this.on) {
      return "#FF7";
    }
		return "#1c1c1c";
  }
  
  isCloseToPoint() {
		return distance(this.pos, this.to) < WORLD.CLOSE_TO_POINT_DISTANCE;
	}

	chooseNewPoint() {
		this.to = this.world.getRandomCoords(); // TODO: make this with respect to current position
	}

	getAngleTo() {
    const to = this.to;
    const pos = this.pos;
		const dx = pos.x - to.x, dy = pos.y - to.y, dz = pos.z - to.z;
		return { aXY: -1.0 * Math.atan2(dx, dy) + Math.HALF_PI, aZ: -1.0 * Math.atan2(dx, dz) };
	}

}

// MAIN --------------------------------------------------------------------------------------------

window.onload = function () {

	const canvas = document.getElementById("pix");
	const ctx = canvas.getContext("2d");

	const W = window.innerWidth, H = window.innerHeight;
	canvas.width = W;
	canvas.height = H;

	const world = new World(ctx, W, H);
	world.run();
}

