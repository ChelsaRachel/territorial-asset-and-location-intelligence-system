declare module "d3-axis" {
  interface AxisLike {
    tickValues(values: Date[]): AxisLike;
    tickFormat(format: (date: Date) => string): AxisLike;
    tickSizeOuter(size: number): AxisLike;
  }

  export function axisBottom<T>(scale: T): AxisLike;
}

declare module "d3-brush" {
  interface BrushLike {
    extent(extent: [[number, number], [number, number]]): BrushLike;
  }

  export function brushX(): BrushLike;
}
