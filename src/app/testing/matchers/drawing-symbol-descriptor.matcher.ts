import {expect} from 'vitest';
import {DrawingSymbolDescriptor} from '../../shared/interfaces/drawing-symbol/drawing-symbol-descriptor.interface';

expect.extend({
  toEqualSymbolDescriptor(actual: DrawingSymbolDescriptor, expected: DrawingSymbolDescriptor) {
    // clone to avoid mutating original objects
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- So we can add extra props.
    const actualClone: any = {...actual};
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- So we can add extra props.
    const expectedClone: any = {...expected};

    actualClone.id = 'generated';
    expectedClone.id = 'generated';

    const pass = this.equals(actualClone, expectedClone);

    return {
      pass,
      message: () => `Expected ${JSON.stringify(actual)} toEqualSymbolDescriptor ${JSON.stringify(expected)}`,
    };
  },
});
