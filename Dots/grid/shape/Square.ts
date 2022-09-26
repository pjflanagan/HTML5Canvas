
import { ShapeType, Coordinates } from '../types';
import { Grid } from '../Grid';
import { CenterPoint } from '../Point';
import { Shape, IShape } from './Shape';
import { addToPosition } from '../position';

export class Square<T> extends Shape<T> implements IShape<T> {
  constructor(grid: Grid<T>, coordinates: Coordinates, size: number) {
    super(grid, coordinates, {
      type: ShapeType.SQUARE,
      size,
    });
    this.initPoints();
  }

  initPoints() {
    const { row, col } = this.coordinates;
    const { size } = this.props;
    const halfSize = this.props.size / 2;
    const topLeft = {
      x: size * row,
      y: size * col
    };
    this.center = new CenterPoint(this, addToPosition(topLeft, [halfSize, halfSize]));
    this.vertices = [
      this.registerVertex(topLeft),
      this.registerVertex(addToPosition(topLeft, [size, 0])),
      this.registerVertex(addToPosition(topLeft, [size, size])),
      this.registerVertex(addToPosition(topLeft, [0, size])),
    ];
  }

  getEdgeNeighbors(): Square<T>[] {
    // TODO: just hardcode from the grid
    return [];
  }

  getPointNeighbors(): Square<T>[] {
    // TODO: just hardcode from the grid
    return [];
  }

  getNeighbors(): Square<T>[] {
    // this should get all neighbors using the grid
    // not sure if I want this in a particular order
    return [];
  }
}

export class Diamond<T> extends Shape<T> implements IShape<T> {
  constructor(grid: Grid<T>, coordinates: Coordinates, size: number) {
    super(grid, coordinates, {
      type: ShapeType.DIAMOND,
      size,
    });
    this.initPoints();
  }

  initPoints() {
    const { row, col } = this.coordinates;
    const { size } = this.props;
    const halfSize = this.props.size / 2;

    if (row % 2 == 0) {
      this.center = new CenterPoint(this, {
        x: halfSize * row,
        y: size * col
      })
    } else {
      this.center = new CenterPoint(this, {
        x: halfSize * row,
        y: size * col + halfSize
      })
    }

    const centerPosition = this.center.getPosition();
    this.vertices = [
      this.registerVertex(addToPosition(centerPosition, [halfSize, 0])),
      this.registerVertex(addToPosition(centerPosition, [0, -halfSize])),
      this.registerVertex(addToPosition(centerPosition, [-halfSize, 0])),
      this.registerVertex(addToPosition(centerPosition, [0, halfSize])),
    ];
  }

  getEdgeNeighbors(): Diamond<T>[] {
    // TODO: just hardcode from the grid
    return [];
  }

  getPointNeighbors(): Diamond<T>[] {
    // TODO: just hardcode from the grid
    return [];
  }

  getNeighbors(): Diamond<T>[] {
    // this should get all neighbors using the grid
    return [];
  }
}
