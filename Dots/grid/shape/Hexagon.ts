
import { ShapeType, Coordinates } from '../types';
import { Grid } from '../Grid';
import { IShape, Shape } from './Shape';

export class PointyHexagon<T> extends Shape<T> implements IShape<T> {
  constructor(grid: Grid<T>, coordinates: Coordinates, size: number) {
    super(grid, coordinates, {
      type: ShapeType.POINTY_HEXAGON,
      size,
    });
    this.initPoints();
  }

  initPoints() {

  }

  // On a hexagon, edge and point neighbors are the same
  getEdgeNeighbors(): IShape<T>[] {
    return this.getNeighbors();
  }

  // On a hexagon, edge and point neighbors are the same
  getPointNeighbors(): IShape<T>[] {
    return this.getNeighbors();
  }

  getNeighbors(): IShape<T>[] {
    // TODO:, do I want these to be in order (?)
    return [
      ...this.getEdgeNeighbors(),
      ...this.getPointNeighbors(),
    ];
  }
}

export class FlatHexagon<T> extends Shape<T> implements IShape<T> {
  constructor(grid: Grid<T>, coordinates: Coordinates, size: number) {
    super(grid, coordinates, {
      type: ShapeType.FLAT_HEXAGON,
      size,
    });
    this.initPoints();
  }

  initPoints() {

  }

  // On a hexagon, edge and point neighbors are the same
  getEdgeNeighbors(): IShape<T>[] {
    return this.getNeighbors();
  }

  // On a hexagon, edge and point neighbors are the same
  getPointNeighbors(): IShape<T>[] {
    return this.getNeighbors();
  }

  getNeighbors(): IShape<T>[] {
    // TODO:, do I want these to be in order (?)
    return [
      ...this.getEdgeNeighbors(),
      ...this.getPointNeighbors(),
    ];
  }
}