import { Coordinates, Edge, GridProps, Position } from './types';
import { IShape, shapeFactory } from './Shape';
import { Point, VertexPoint } from './Point';
import { serializePosition } from './position';
import { Registry } from './util';

export class Grid<T> {
  private props: GridProps
  private grid: IShape<T>[][];
  private vertexRegistry: Registry<Position, VertexPoint<T>>;

  constructor(props: GridProps) {
    if (props.height <= 0) {
      throw `Property 'height' [${props.height}] is too small, must be larger than 0`;
    }
    if (props.width <= 0) {
      throw `Property 'width' [${props.width}] is too small, must be larger than 0`;
    }
    this.vertexRegistry = new Registry<Position, VertexPoint<T>>(serializePosition);
    this.props = props;
    this.initShapes();
  }

  // Initialization

  private makeShape(coordinates: Coordinates): IShape<T> {
    return shapeFactory(this, coordinates, this.props)
  }

  private initShapes() {
    this.grid = [];

    let row: number = 0,
        col = 0,
        placingShape: IShape<T> = this.makeShape({ row, col });

    while (placingShape.areSomePointsOnGrid()) {
      // if this shape is visible on the grid, add a new row
      this.grid.push([]);
      while(placingShape.areSomePointsOnGrid()) {
        // while the shape is still on the grid, add a new column
        this.grid[row].push(placingShape);
        placingShape = this.makeShape({ row, col });
      }
      col = 0;
      row += 1;
      placingShape = this.makeShape({ row, col });
    }
  }

  registerVertex(shape: IShape<T>, position: Position): VertexPoint<T> {
    // if it doesn't exist, create a new vertex
    if (!this.vertexRegistry.contains(position)) {
      this.vertexRegistry.add(position, new VertexPoint<T>(position));
    }

    // add the requesting shape to the vertex's shape list and return the shape
    const vertex = this.vertexRegistry.get(position);
    vertex.addShape(shape);
    return vertex;
  }

  // Getters

  getShapes(): IShape<T>[] {
    return this.grid.flat();
  }

  getShapeAt({ row, col }: Coordinates): IShape<T> | undefined {
    if (this.grid[row] && this.grid[row][col]) {
      return this.grid[row][col];
    }
  }

  // Helpers

  isPointWithinBounds(point: Point<T>) {
    const { x, y } = point.getPosition();
    return x >= 0 && x <= this.props.width && y >= 0 && y < this.props.height;
  }

  // Math

  getEdgePathToPoint(toPoint: VertexPoint<T>): Edge<T>[] {
    return [];
  }
}
