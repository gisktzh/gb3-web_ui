import CIMSymbol from '@arcgis/core/symbols/CIMSymbol';

const cimSymbolToSVG: (cimSymbol: CIMSymbol) => SVGSVGElement | undefined = jasmine.createSpy();

export default cimSymbolToSVG;
