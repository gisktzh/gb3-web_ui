import {DrawingSymbolDescriptor} from '../../shared/interfaces/drawing-symbol/drawing-symbol-descriptor.interface';

export const DrawingSymbolDescriptorMatcher: jasmine.CustomMatcherFactories = {
  toEqualSymbolDescriptor(utils: jasmine.MatchersUtil): jasmine.CustomMatcher {
    return {
      compare(actual: DrawingSymbolDescriptor, expected: DrawingSymbolDescriptor) {
        // @ts-ignore -- `id` _does_ exist in the object instance, but isn't correctly typed in @arcgis/core.
        expected.id = 'generated';
        // @ts-ignore -- `id` _does_ exist in the object instance, but isn't correctly typed in @arcgis/core.
        actual.id = 'generated';

        const result: jasmine.CustomMatcherResult = {
          pass: utils.equals(actual, expected),
        };

        if (!result.pass) {
          result.message = `Expected ${JSON.stringify(actual)} toEqualSymbolDescriptor ${JSON.stringify(expected)}`;
        }
        return result;
      },
    };
  },
};
