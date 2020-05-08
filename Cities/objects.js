
// CONST -------------------------------------------------------------------------------------------
// this is a good place to store constants

const WORLD = {
	BACKGROUND: '#29073b',
	BUILDING_COUNT: 100
}

const BUILDING = {
}

// WORLD -------------------------------------------------------------------------------------------

class World {
	constructor(ctx, width, height) {
		// the context (ctx) is the reference to the element on page and is where we will draw EVERYTHING
		this.ctx = ctx;
		this.W = width;
		this.H = height;

		// we will be drawing buildings, so lets store them all in an array
		this.buildings = [];

		// draw the background so the page has color
		this.drawBackground();

		// initialize the buildings (make them all exist)
		this.initBuildings();
	}

	// INIT

	initBuildings() {
		// initialize one building for every building in the count
		for (let b = 0; b < WORLD.BUILDING_COUNT; ++b) {
			this.buildings.push(new Building(this));
		}
		this.drawBuildings();
	}

	// ANIMATE

	run() {
		// this function means the next time the computer is ready to draw
		// then run the function "animate"
		window.requestAnimationFrame(this.animate.bind(this));
	}

	animate() {
		// first we will draw the background
		this.drawBackground();

		// then we will draw the buildings on top of the background
		const done = this.drawBuildings();

		// if we are done drawing buildings then we should stop
		// otherwise we will animate again the next time the computer is ready
		if (!done) {
			window.requestAnimationFrame(this.animate.bind(this));
		}
	}

	// DRAW

	drawBackground() {
		// draw a rectangle that covers the whole page
		this.ctx.rect(0, 0, this.W, this.H);
		this.ctx.fillStyle = WORLD.BACKGROUND;
		this.ctx.fill();
	}

	drawBuildings() {
		// for each of the buildings, grow in size, then draw them
		this.buildings.forEach(building => {
			building.grow();
			building.draw();
		});
		return false;
	}
}

// BUILDING ---------------------------------------------------------------------------------------------

class Building {
	constructor(world) {
		// hold onto the world object so we can reference height and width
		this.world = world;

		// hold onto the context so we can all draw on the same canvas
		this.ctx = this.world.ctx;

		this.currentHeight = 0;

		// this.eventualHeight = ?;
		// this.growthRate = ?;
		// this.width = ?;
		// this.color = ?;
		// this.windows = [];

	}

	grow() {
		// the grow function will have the building increase in size
	}

	draw() {
		// the draw function will have the actual building being drawn
	}

}
