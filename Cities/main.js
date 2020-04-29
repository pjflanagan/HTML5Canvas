
// MAIN --------------------------------------------------------------------------------------------

window.onload = function () {

	// the canvas is an element in our html that we reference here by id
	const canvas = document.getElementById("pix");
	const ctx = canvas.getContext("2d");

	// we want this to take up the whole page, so we get the window height and width here
	const W = window.innerWidth, H = window.innerHeight;
	canvas.width = W;
	canvas.height = H;

	// world is defined by us, first we initialize it and then we run the program
	const world = new World(ctx, W, H);
	world.run();
}

