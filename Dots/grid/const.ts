
import { ShapeType } from "./types"

export const SHAPE_TYPE_TO_SIDES_MAP = {
  [ShapeType.COLUMN_TRIANGLE]: 3,
  [ShapeType.ROW_TRIANGLE]: 3,
  [ShapeType.SQUARE]: 3,
  [ShapeType.FLAT_HEXAGON]: 6,
  [ShapeType.POINTY_HEXAGON]: 6,
}
