

// some helpful numbers we might not want to recalculate
Math.HALF_PI = Math.PI / 2;
Math.TWO_PI = Math.PI * 2;

// random int between two numbers
function randomInt(min, max) {
	return Math.floor(Math.random() * (max - min)) + min;
}

// random float between two numbers
function randomDec(min, max) {
	return Math.random() * (max - min) + min;
}

// returns a bool based on a likelihood of an outcome
function randomOdds(likelihood) {
	return Math.random() < likelihood;
}

// coin flip 50/50
function randomBool() {
	return randomOdds(0.5);
}

// returns a random rgb color
function randomColor() {
	var r = Math.round(Math.random() * 255);
	var g = Math.round(Math.random() * 255);
	var b = Math.round(Math.random() * 255);
	var a = 1; // (Math.random()*.3)+.4;
	return `rgba(${r}, ${g}, ${b}, ${a})`
}

// calculates the distnace between an object with { x, y } properties
function distance(a, b) {
	return Math.sqrt(
		Math.pow(a.x - b.x, 2) +
		Math.pow(a.y - b.y, 2) +
		Math.pow(a.z - b.z, 2)
	);
}