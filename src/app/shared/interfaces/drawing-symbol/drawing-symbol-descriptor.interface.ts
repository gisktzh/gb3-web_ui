export interface DrawingSymbolDescriptor {
  type: string;
  resize(size: number): void;
  rotate(angle: number): void;
  toJSON(): string;
  toSVG(): SVGElement | undefined;
}
