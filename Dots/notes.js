
function generatePointyGrid(W, H) {
  const grid = [];

  const hexH = 2 * WORLD.HEX_SIZE;
  const hexW = Math.sqrt(3) * WORLD.HEX_SIZE;

  let rowIndex = 0;
  for (let y = 0; y < H; y += hexH / 4) {
    const rowType = rowIndex % 6;

    let startPoint = W;
    if ([0, 4].includes(rowType)) {
      startPoint = 0;
    } else if ([1, 3].includes(rowType)) {
      startPoint = hexW / 2;
    }

    for (let x = startPoint; x < W; x += hexW ) {
      grid.push({ x, y });
    }

    ++rowIndex;
  }

  return grid;
}