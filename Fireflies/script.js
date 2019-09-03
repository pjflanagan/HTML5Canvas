
// CONST -------------------------------------------------------------------------------------------

const WORLD = {
	BUG_COUNT: 5000,
	CLOSE_TO_POINT_DISTANCE: 20,
	NEXT_POINT_DISTANCE: 100,
	COLOR: [
		"#032130BB",
		"#02092eBB",
		"#11011FBB",
		"#0F001aBB",
		"#000000BB"
	],
	COLOR_VARIATION: .1, // plus or minus
	COLOR_VELOCITY: .0005,
	CLOSE_TO_COLOR_DISTANCE: .0015
}

const BUG = {
	VELOCITY_MIN: .2,
	VELOCITY_MAX: .8,
	BLINK_TIMEOUT_MIN: 600,
	BLINK_TIMEOUT_MAX: 2000,
	BLINK_DURATION_MIN: 80,
	BLINK_DURATION_MAX: 120,
	BIG_CHANCE: 0.96,
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
		this.Wp100 = this.W + 100;
		this.Hp100 = this.H + 100;
		this.Dp100 = this.D + 100;
		this.bugs = [];
		this.max = distance({ x: this.W, y: this.H, z: this.D }, { x: 0, y: 0, z: 0 });

		this.initBackground();
		this.drawBackground();
		this.initBugs();
		this.drawBugs();
	}

	// INIT

	initBackground() {
		this.color = [
			0,
			.25,
			.5,
			.75,
			1
		];
		this.toColor = [];
		for (let i = 1; i < this.color.length - 1; ++i) {
			this.toColor[i - 1] = this.color[i] + randomDec(-WORLD.COLOR_VARIATION, WORLD.COLOR_VARIATION);
		}
		this.setGradient();
	}

	setGradient() {
		this.grd = this.ctx.createLinearGradient(0, 0, 0, this.H);
		for (let i = 0; i < this.color.length; ++i) {
			this.grd.addColorStop(this.color[i], WORLD.COLOR[i]);
		}
	}

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

	moveGradient() {
		for (let i = 1; i < this.color.length - 1; ++i) {
			const colorDiff = this.color[i] - this.toColor[i - 1];
			if (Math.abs(colorDiff) < WORLD.CLOSE_TO_COLOR_DISTANCE) {
				this.toColor[i - 1] = (i * .25) - randomDec(-WORLD.COLOR_VARIATION, WORLD.COLOR_VARIATION);
			} else {
				this.color[i] = this.color[i] - Math.sign(colorDiff) * WORLD.COLOR_VELOCITY;
			}
		}
		this.setGradient();
	}

	drawBackground() {
		this.moveGradient();
		this.ctx.rect(0, 0, this.W, this.H);
		this.ctx.fillStyle = this.grd;
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
			x: randomInt(-100, this.Wp100),
			y: randomInt(-100, this.Hp100),
			z: randomInt(-100, this.Dp100)
		};
	}

	isCloseToEdge({ x, y, z }) {
		return (
			x < -100 || x > this.Wp100 ||
			y < -100 || y > this.Hp100 ||
			z < -100 || z > this.Dp100
		)
	}

	zScale(z) {
		return (.5 * (z / this.D)) + .5;
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
		this.chooseNewPoint();

		this.on = randomOdds(.2);
		this.blink();
	}

	setNextBlinkTime() {
		const zScale = this.world.zScale(this.pos.z);
		if (this.on) {
			if (zScale > BUG.BIG_CHANCE) {
				this.nextBlinkTime = Date.now() + randomDec(BUG.BLINK_DURATION_MIN * 2, BUG.BLINK_DURATION_MAX * 2);

			} else {
				this.nextBlinkTime = Date.now() + randomDec(BUG.BLINK_DURATION_MIN, BUG.BLINK_DURATION_MAX);
			}
		} else {
			this.nextBlinkTime = Date.now() + randomDec(BUG.BLINK_TIMEOUT_MIN, BUG.BLINK_TIMEOUT_MAX);
		}
	}

	blink() {
		this.on = !this.on;
		this.setNextBlinkTime();
	}

	isCloseToEdge() {
		return this.world.isCloseToEdge(this.pos);
	}

	move(date) {
		if (this.isCloseToPoint()) {
			this.chooseNewPoint();
		} else if (this.isCloseToEdge()) {
			this.pos = this.world.getRandomCoords();
			this.chooseNewPoint();
		}

		if (date > this.nextBlinkTime) {
			this.blink();
		}

		const vx = Math.cos(this.aXY) * this.v;
		const vy = Math.sin(this.aXY) * this.v;
		const vz = Math.cos(this.aZ) * this.v;

		this.pos = {
			x: this.pos.x - vx,
			y: this.pos.y - vy,
			z: this.pos.z - vz
		}
	}

	draw() {
		const zScale = this.world.zScale(this.pos.z);
		const radius = 1.2 * zScale;
		this.ctx.beginPath();
		this.ctx.moveTo(this.pos.x, this.pos.y);
		this.ctx.arc(this.pos.x, this.pos.y, radius, 0, Math.TWO_PI, false);
		this.ctx.fillStyle = this.getColor();
		this.ctx.fill();
		this.ctx.closePath();
		if (this.on && zScale > BUG.BIG_CHANCE) {
			const glowRadius = 6 + (zScale - BUG.BIG_CHANCE) * 10;
			this.ctx.beginPath();
			this.ctx.moveTo(this.pos.x, this.pos.y);
			this.ctx.arc(this.pos.x, this.pos.y, glowRadius, 0, Math.TWO_PI, false);
			this.ctx.fillStyle = "#feffcf11";
			this.ctx.fill();
			this.ctx.closePath();
		}
	}

	getColor() {
		if (this.on) {
			const blue = 255 * this.world.zScale(this.pos.z);
			// this.print(blue);
			return `rgb(255, 255, ${blue})`;
		}
		return "#0000";
	}

	isCloseToPoint() {
		return distance(this.pos, this.to) < WORLD.CLOSE_TO_POINT_DISTANCE;
	}

	chooseNewPoint() {
		this.to = this.world.getRandomCoords();
		const { aXY, aZ } = this.getAngleTo();
		this.aXY = aXY;
		this.aZ = aZ;
		this.v = randomDec(BUG.VELOCITY_MIN, BUG.VELOCITY_MAX);
	}

	getAngleTo() {
		const to = this.to;
		const pos = this.pos;
		const dx = pos.x - to.x,
			dy = pos.y - to.y,
			dz = pos.z - to.z;
		return {
			aXY: -1.0 * Math.atan2(dx, dy) + Math.HALF_PI,
			aZ: 1.0 * Math.atan2(dx, dz) + Math.HALF_PI
		};
	}

	print(statement) {
		if (this.i === 0) {
			console.log(statement);
		}
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

