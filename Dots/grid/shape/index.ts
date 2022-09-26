import { Grid } from '../Grid';
import { Coordinates, GridProps, ShapeType } from '../types';
import { PointyHexagon, FlatHexagon } from './Hexagon';
import { IShape } from './Shape';
import { Diamond, Square } from './Square';
import { ColumnTriangle, RowTriangle } from './Triangle';

const SHAPE_MAKERS = {
  [ShapeType.ROW_TRIANGLE]: <T>(grid: Grid<T>, coordinates: Coordinates, props: GridProps) => new RowTriangle(grid, coordinates, props.size),
  [ShapeType.COLUMN_TRIANGLE]: <T>(grid: Grid<T>, coordinates: Coordinates, props: GridProps) => new ColumnTriangle(grid, coordinates, props.size),
  [ShapeType.DIAMOND]: <T>(grid: Grid<T>, coordinates: Coordinates, props: GridProps) => new Diamond(grid, coordinates, props.size),
  [ShapeType.SQUARE]: <T>(grid: Grid<T>, coordinates: Coordinates, props: GridProps) => new Square(grid, coordinates, props.size),
  [ShapeType.FLAT_HEXAGON]: <T>(grid: Grid<T>, coordinates: Coordinates, props: GridProps) => new FlatHexagon(grid, coordinates, props.size),
  [ShapeType.POINTY_HEXAGON]: <T>(grid: Grid<T>, coordinates: Coordinates, props: GridProps) => new PointyHexagon(grid, coordinates, props.size),
}

function shapeFactory<T>(grid: Grid<T>, coordinates: Coordinates, props: GridProps): IShape<T> {
  return SHAPE_MAKERS[props.type](grid, coordinates, props);
}

export { IShape, shapeFactory };
