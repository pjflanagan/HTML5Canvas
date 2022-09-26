
import { Position, PointType, PointProps } from './types';
import { IShape } from './shape';
import { arePositionsEqual, serializePosition } from './position';

export class Point<T> {
  protected props: PointProps;
  protected value: any;

  constructor(props: PointProps) {
    this.props = props;
  }

  // Value

  setValue(value: T): void {
    this.value = value;
  }

  hasValue(): boolean {
    return !!this.value;
  }

  getValue(): T {
    return this.value;
  }

  clearValue(): void {
    this.value = null;
  }

  // Properties

  getPosition(): Position {
    return this.props.position;
  }

  getType(): PointType {
    return this.props.type;
  }
}

export class VertexPoint<T> extends Point<T> {
  private shapes: IShape<T>[];

  constructor(position: Position) {
    super({
      type: PointType.VERTEX,
      position
    });
    this.shapes = [];
  }

  addShape(shape: IShape<T>) {
    this.shapes.push(shape);
  }

  // Points

  isSame(point: Point<T>): boolean {
    return arePositionsEqual(this.props.position, point.getPosition());
  }

  // Neighbors

  getNeighboringShapes(): IShape<T>[] {
    return this.shapes;
  }

  getNeighboringPoints(): VertexPoint<T>[] {
    // get neighboring shapes and get vertices that are one away then remove duplicates
    return [];
  }

  getClockwisePoint(shape: IShape<T>): VertexPoint<T> | undefined {
    // find this point on the shape, then get the next index
    // return shape.getVertices().find();
    return undefined;
  }

  getCounterclockwisePoint(shape: IShape<T>): VertexPoint<T> | undefined {
    // find this point on the shape, then get the next index
    // if () // if this shape is not in shapes, then throw an error
    // return shape.getVertices().find();
    return undefined;
  }
}

export class CenterPoint<T> extends Point<T> {
  private shape: IShape<T>

  constructor(shape: IShape<T>, position: Position) {
    super({
      type: PointType.CENTER,
      position
    });
    this.shape = shape;
  }

  getShape(): IShape<T> {
    return this.shape;
  }
}
