
import { Position, ShapeProps, Coordinates, Edge } from '../types';
import { Grid } from '../Grid';
import { CenterPoint, Point, VertexPoint } from '../Point';

export interface IShape<T> {
  getCenter(): CenterPoint<T>;
  getCenterPosition(): Position;
  getVertices(): VertexPoint<T>[];
  areAllPointsOnGrid(): boolean;
  areSomePointsOnGrid(): boolean;
  setValue(value: T): void;
  hasValue(): boolean;
  getValue(): T;
  // Shape extension
  getNeighbors(): IShape<T>[];
  getEdgeNeighbors(): IShape<T>[];
  getPointNeighbors(): IShape<T>[];
}

export class Shape<T> implements IShape<T> {
  protected grid: Grid<T>;
  protected props: ShapeProps;
  protected vertices: VertexPoint<T>[];
  protected center: CenterPoint<T>;
  protected coordinates: Coordinates;

  constructor(grid: Grid<T>, coordinates: Coordinates, props: ShapeProps) {
    this.grid = grid;
    this.coordinates = coordinates;
    this.props = props;
  }

  protected makeVertex() {
    // this registers a vertex with the grid,
    // and pushes a vertex to the array
  }

  protected registerVertex(position: Position): VertexPoint<T> {
    return this.grid.registerVertex(this, position);
  }

  // Points

  getCenter(): CenterPoint<T> {
    return this.center;
  }

  getCenterPosition(): Position {
    return this.center.getPosition();
  }

  getVertices(): VertexPoint<T>[] {
    return this.vertices;
  }

  areAllPointsOnGrid(): boolean {
    return this.vertices.every(v => this.grid.isPointWithinBounds(v));
  }

  areSomePointsOnGrid(): boolean {
    return this.vertices.some(v => this.grid.isPointWithinBounds(v));
  }

  getVertex(index: number): VertexPoint<T> {
    return this.vertices[index % this.vertices.length];
  }

  // getPointOppositeDirection()
  // getPointInDirection()

  // Edges

  // getEdges(): Edge {
  //   return [];
  // }

  // Value, stored in the center point

  setValue(value: T): void {
    this.center.setValue(value);
  }

  hasValue(): boolean {
    return this.center.hasValue();
  }

  getValue(): T {
    return this.center.getValue();
  }

  // Child Methods


  getNeighbors(): IShape<T>[] {
    throw 'Method needs to be implemented by child of Shape.';
  }
  getEdgeNeighbors(): IShape<T>[] {
    throw 'Method needs to be implemented by child of Shape.';
  }
  getPointNeighbors(): IShape<T>[] {
    throw 'Method needs to be implemented by child of Shape.';
  }
}
