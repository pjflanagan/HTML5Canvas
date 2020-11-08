
// VIEW --------------------------------------------------------------------------------------------

function randomHover() {
  $('.button#random').css({ background: colorString(randomColor(), .9) });
  G.randomHoverTimeout = setTimeout(randomHover, 32);
}

function randomHoverOut() {
  clearTimeout(G.randomHoverTimeout);
}

function toggleSidebar() {
  G.sidebarOpen = !G.sidebarOpen;
  const sideBarAddClass = G.sidebarOpen ? 'open' : 'closed';
  const sideBarRemoveClass = G.sidebarOpen ? 'closed' : 'open';
  $('#sidebar').removeClass(sideBarRemoveClass);
  $('#sidebar').addClass(sideBarAddClass);
}

// INPUT --------------------------------------------------------------------------------------------

function e(run, args){
  run(...args);
  updateDisplay();
}

function clearCanvas() {
  G.world.clearCanvas();
}

function random() {
  G.world.random();
}

function changeSpeed(speed) {
  G.world.changeSpeed(speed);
}

function selectMode(mode) {
  G.world.selectMode(mode);
}

function togglePlayPause() {
  G.world.togglePlayPause();
}

function addPlanet() {
  G.world.addPlanet();
}

// CONTROL --------------------------------------------------------------------------------------------

function updateDisplay() {
  updatePlayPause();
  updateMode();
  updatePlanets();
}

function updatePlayPause() {
  // play/pause
  const text = G.world.isRunning ? 'Pause' : 'Play';
  const addClass = G.world.isRunning ? 'pause' : 'play';
  const removeClass = G.world.isRunning ? 'play' : 'pause';
  $('#playPause').removeClass(removeClass);
  $('#playPause').addClass(addClass);
  $('#playPause').text(text);
  // speed
  $('.button.speed').removeClass('disabled');
  if(G.world.speed === WORLD.SPEED.min) {
    $('#slower').addClass('disabled');
  } else if(G.world.speed === WORLD.SPEED.max) {
    $('#faster').addClass('disabled');
  }
}

function updateMode() {
  // mode
  const modeID = G.world.modeID;
  const planetCount = G.world.planets.length;
  $('.button.mode').removeClass('active');
  $(`.button#mode-${modeID}`).addClass('active');
  $(`.button.mode`).removeClass('disabled');
  if(planetCount < 3) {
    $(`.button#mode-3`).addClass('disabled');
    $(`.button#mode-4`).addClass('disabled');
  }
}

function updatePlanets() {
  $(`.button#addPlanet`).removeClass('disabled');
  if(G.world.planets.length === WORLD.PLANETS.max) {
    $(`.button#addPlanet`).addClass('disabled');
  }

  // G.world.planets.forEach((planet) => {
  //   updatePlanet(planet);
  // });
}

// MAIN --------------------------------------------------------------------------------------------

const G = {
  sidebarOpen: false
};

window.onload = function () {
  const canvas = document.getElementById('pix');
  const ctx = canvas.getContext('2d');

  const W = window.innerWidth,
    H = window.innerHeight;
  canvas.width = W;
  canvas.height = H;

  const urlParams = new URLSearchParams(window.location.search);
  let mode = parseInt(urlParams.get('mode'));
  G.world = new World(ctx, W, H, mode);

  updateDisplay();
};