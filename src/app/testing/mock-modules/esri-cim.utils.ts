// Mocked utils because Jasmine has a hard time overwriting @arcgis/core stuff.
export const applyCIMSymbolRotation: __esri.cimSymbolUtils['applyCIMSymbolRotation'] = jasmine.createSpy();
export const scaleCIMSymbolTo: __esri.cimSymbolUtils['scaleCIMSymbolTo'] = jasmine.createSpy();
