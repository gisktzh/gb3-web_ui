// Mocked utils because Jasmine has a hard time overwriting @arcgis/core stuff.
import {
  applyCIMSymbolRotation as esriApplyCIMSymbolRotation,
  scaleCIMSymbolTo as esriScaleCIMSymbolTo,
} from '@arcgis/core/symbols/support/cimSymbolUtils.js';

export const applyCIMSymbolRotation: typeof esriApplyCIMSymbolRotation = jasmine.createSpy();
export const scaleCIMSymbolTo: typeof esriScaleCIMSymbolTo = jasmine.createSpy();
