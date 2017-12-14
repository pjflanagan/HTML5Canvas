
// ------------------------------------- GLOBAL --------------------------------

canvas = document.getElementById("c");
ctx = canvas.getContext("2d");

W = window.innerWidth, H = (window.innerHeight < 500) ? 500 : window.innerHeight;
canvas.width = W;
canvas.height = H;

len = 18;
lenx = Math.floor(len/2);
leny = Math.floor(len * Math.sqrt(3) / 2);

// ------------------------------------- RANDOMS -------------------------------

function rando(min,max){
	return Math.random()*(max-min+1)+min;
}

function randomColor() {
	var rm = 255,
			gm = 255,
			bm = 255;
	var r = Math.round(Math.random()*rm);
	var g = Math.round(Math.random()*gm);
	var b = Math.round(Math.random()*bm);
	var a = 1; //(Math.random()*.5)+.5;
	var rgba = "rgba("+r+", "+g+", "+b+", "+a+")";
	return rgba;
}

// ------------------------------------- CLASSES -------------------------------

var Point = class Point {
	constructor(x, y){
		this.x = Math.floor(x);
		this.y = Math.floor(y);
		this.register();
	}

	register(){
		if(this.y > H+len || this.y < 0-len || this.x > W+len || this.x < 0-len){ //over border + len
			this.done = true;
			return;
		}
		if(this.y < H && this.y >= 0 && this.x < W && this.x >= 0){ //under border
			points.set(this.x, this.y, this);
		}
		this.done = false; //under border or slightly over border
	}

	setDone(){
		this.done = true;
	}

	isDone(){
		return this.done;
	}
};

var PointArray = class PointArray {
	constructor(){
		this.queue = [];
		this.array = new Array(W);
		for (var i = 0; i < W; i++) {
			this.array[i] = new Array(H).fill(false);
		}
	}

	find(x,y){
		if(y >= H || y < 0 || x >= W || x < 0)
			return false;
		return this.array[Math.floor(x)][Math.floor(y)];
	}

	set(x,y, point){
		this.array[x][y] = point;
		this.queue.push(point);
	}

	top(){
		var index = Math.floor(rando(0, this.queue.length));
		var point = this.queue[index];
		this.queue.splice(index, 1);
		return point;
	}

	none(){
		return this.queue.length == 0;
	}
};

var Triangle = class Triangle {
	constructor(point1, point2, point3){
		this.points = [point1, point2, point3];
		this.setColor();
		this.draw();
	}

	setColor(){
		var Ox = 0;
		var Oy = 0;
		for(var i = 0; i < 3; i++){
			Ox += this.points[i].x;
			Oy += this.points[i].y;
		}
		Ox = Math.floor(Ox/3);
		Oy = Math.floor(Oy/3);
		var col = ctx.getImageData(Ox,Oy,1,1).data
		this.color = "rgb(" + col[0] + ", " + col[1] + ", " + col[2] + ")";
	}

	draw(){
		/*if(this.points[0].x < W/3){
		}
		else if(this.points[0].x > 3*W/4){
			return;
		}
		else if(rando(0, W) < this.points[0].x)
			return;*/
		ctx.fillStyle = this.color;
		ctx.beginPath();
		ctx.moveTo(this.points[0].x, this.points[0].y);
		ctx.lineTo(this.points[1].x, this.points[1].y);
		ctx.lineTo(this.points[2].x, this.points[2].y);
		ctx.closePath();
		ctx.fill();
	}
};

// ------------------------------------- DRAW ----------------------------------

function drawNext(){
	if(points.none()){
		clearTimeout(playID);
		done();
		return false;
	}
	point = points.top();
	while(typeof point == 'undefined' || point.isDone()){
		point = points.top();
	}

	var x = point.x;
	var y = point.y;

	newPoints = [
		{x: x-lenx, y: y-leny},
		{x: x+lenx, y: y-leny},
		{x: x+len , y: y},
		{x: x+lenx, y: y+leny},
		{x: x-lenx, y: y+leny},
		{x: x-len , y: y},
		{x: x-lenx, y: y-leny}
	];
	for(var i = 0; i < newPoints.length-1; i++){
		pointA = points.find(newPoints[i].x, newPoints[i].y);
		pointB = points.find(newPoints[i+1].x, newPoints[i+1].y);
		if(pointA == false)
			pointA = new Point(newPoints[i].x, newPoints[i].y);
		if(pointB == false)
			pointB = new Point(newPoints[i+1].x, newPoints[i+1].y);
		try {
			if(!pointA.isDone() && !pointB.isDone()){
				triangles.push(new Triangle(point, pointA, pointB));
				point.setDone();
			}
		}
		catch(e){
		}
	}
	return true;
}

function drawBackground(){
	var imgWidth =  H * img.width / img.height;
	var imgHeight = H;
	if(imgWidth < W){
		imgWidth =  W;
		imgHeight = W * img.height / img.width;
	}
	ctx.drawImage(img, 0, 0, imgWidth, imgHeight);
}

function drawBunch(){
	var i = 0;
	while(drawNext() && i != 10){
		i++;
	}
}

// ------------------------------------- FLOW ----------------------------------

points = new PointArray();
triangles = [];
point0 = new Point(0,0);
img = new Image();

// https://stackoverflow.com/questions/17397319/save-canvas-as-jpg-to-desktop
function download() {
    var dt = canvas.toDataURL('image/jpeg');
    this.href = dt;
};
downloadLnk.addEventListener('click', download, false);


function previewFile(){
  var preview = document.querySelector('img'); //selects the query named img
  var file    = document.querySelector('input[type=file]').files[0]; //sames as here
  var reader  = new FileReader();

  reader.onloadend = function () {
    preview.src = reader.result;
		$("#hide").remove();
		setImage();
  }

  if (file) reader.readAsDataURL(file); //reads the data as a URL
  else preview.src = "";
}

function setImage(){
	img.crossOrigin = "Anonymous";
	 img.onload = function() {
	 	naturalHeight = img.height;
	 	naturalWidth = img.width;
		console.log(img);
		console.log(naturalWidth);
		console.log(naturalHeight);
		start();
	}
	img.src = document.querySelector('img').src;
}

function start(){
	if(W > 700){
		W = window.innerWidth, H = (window.innerHeight < 500) ? 500 : window.innerHeight;
		canvas.width = W;
		canvas.height = H;

		points = new PointArray();
		triangles = [];
		point0 = new Point(0,0);

		drawBackground();
		playID = setInterval(drawBunch, 16);
	}
}

function done(){
	$("#downloadLnk").css({
		display: "inline-block"
	});
}

// ------------------------------------- LISTENERS -----------------------------

$(window).resize(function() {
	clearTimeout(playID);
	start();
});
