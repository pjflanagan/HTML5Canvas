
import { ShapeType, Coordinates } from '../types';
import { Grid } from '../Grid';
import { IShape, Shape } from './Shape';


export class RowTriangle<T> extends Shape<T> implements IShape<T> {
  constructor(grid: Grid<T>, coordinates: Coordinates, size: number) {
    super(grid, coordinates, {
      type: ShapeType.ROW_TRIANGLE,
      size
    });
    this.initPoints();
  }

  initPoints() {

  }

  getEdgeNeighbors(): IShape<T>[] {
    throw new Error('Method not implemented.');
  }
  getPointNeighbors(): IShape<T>[] {
    throw new Error('Method not implemented.');
  }

  getNeighbors(): IShape<T>[] {
    return []
  }
}

export class ColumnTriangle<T> extends Shape<T> implements IShape<T> {
  constructor(grid: Grid<T>, coordinates: Coordinates, size: number) {
    super(grid, coordinates, {
      type: ShapeType.COLUMN_TRIANGLE,
      size
    });
    this.initPoints();
  }

  initPoints() {

  }

  getEdgeNeighbors(): IShape<T>[] {
    throw new Error('Method not implemented.');
  }
  getPointNeighbors(): IShape<T>[] {
    throw new Error('Method not implemented.');
  }

  getNeighbors(): IShape<T>[] {
    return []
  }
}
