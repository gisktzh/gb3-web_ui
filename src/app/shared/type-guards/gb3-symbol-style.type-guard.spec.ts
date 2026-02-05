import {
  Gb3LineStringStyle,
  Gb3PointStyle,
  Gb3PolygonStyle,
  Gb3SymbolStyle,
  Gb3TextStyle,
} from '../interfaces/internal-drawing-representation.interface';
import {isGb3SymbolStyle} from './gb3-symbol-style.type-guard';

describe('isGb3SymbolStyle', () => {
  it('should return true for a symbol style', () => {
    const style: Gb3SymbolStyle = {
      type: 'symbol',
      symbolSize: 12,
      symbolRotation: 90,
    };

    expect(isGb3SymbolStyle(style)).toBeTrue();
  });

  it('should return false for any other style', () => {
    // Convenience objects so we don't have to repeat the same key/value pairs over and over.
    const stroke = {
      strokeColor: '#ff6600',
      strokeWidth: -1,
      strokeOpacity: 1408,
    };
    const fill = {
      fillColor: '#ff6600',
      fillOpacity: 1408,
    };

    const lineStringStyle: Gb3LineStringStyle = {
      type: 'line',
      ...stroke,
    };
    const pointStyle: Gb3PointStyle = {
      type: 'point',
      ...stroke,
      ...fill,
      pointRadius: 9001,
    };
    const polygonStyle: Gb3PolygonStyle = {
      type: 'polygon',
      ...stroke,
      ...fill,
    };
    const textStyle: Gb3TextStyle = {
      type: 'text',
      label: 'yes',
      fontSize: '13',
      fontColor: '#ff6600',
      fontFamily: 'Comic Sans',
      labelYOffset: 'yes',
      labelAlign: 'yes',
      haloColor: '#ff6600',
      haloRadius: 'yes',
    };

    expect(isGb3SymbolStyle(lineStringStyle)).toBeFalse();
    expect(isGb3SymbolStyle(pointStyle)).toBeFalse();
    expect(isGb3SymbolStyle(polygonStyle)).toBeFalse();
    expect(isGb3SymbolStyle(textStyle)).toBeFalse();
  });
});
