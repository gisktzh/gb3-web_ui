import {DrawingSymbolDescriptor} from 'src/app/shared/interfaces/drawing-symbol/drawing-symbol-descriptor.interface';
import 'vitest';

declare module 'vitest' {
  interface Assertion {
    toEqualSymbolDescriptor(expected: DrawingSymbolDescriptor): void;
  }
}
