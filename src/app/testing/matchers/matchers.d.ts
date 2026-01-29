import {DrawingSymbolDescriptor} from './../../shared/interfaces/drawing-symbol/drawing-symbol-descriptor.interface';

declare global {
  namespace jasmine {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars -- Necessary from outer interface, but not needed in our case.
    interface Matchers<T> {
      toEqualSymbolDescriptor(actual: DrawingSymbolDescriptor): boolean;
    }
  }
}

export {};
