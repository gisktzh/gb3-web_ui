import {DrawingLayer} from '../enums/drawing-layer.enum';
import {LayerSymbolizations, SymbolizationStyle} from '../interfaces/symbolization.interface';

const defaultSymbolization: SymbolizationStyle = {
  point: {
    type: 'simple',
    size: 12,
    color: {
      r: 0,
      g: 0,
      b: 0,
      a: 1.0
    }
  },
  line: {
    width: 5,
    color: {
      r: 0,
      g: 0,
      b: 0,
      a: 1.0
    }
  },
  polygon: {
    fill: {
      color: {
        r: 0,
        g: 0,
        b: 0,
        a: 1.0
      }
    },
    outline: {
      width: 5,
      color: {
        r: 0,
        g: 0,
        b: 0,
        a: 1.0
      }
    }
  }
};

export const layerSymbolizations: LayerSymbolizations = {
  [DrawingLayer.REDLINING]: {
    point: defaultSymbolization.point,
    line: defaultSymbolization.line,
    polygon: defaultSymbolization.polygon
  },
  [DrawingLayer.LOCATE_POSITION]: {
    point: {
      type: 'svg',
      size: 24,
      color: {
        r: 0,
        g: 158,
        b: 224,
        a: 0.6
      },
      // taken from: https://commons.wikimedia.org/wiki/File:Maki-marker-15.svg; CC0 license
      path:
        'M7.5,0C5.0676,0,2.2297,1.4865,2.2297,5.2703' +
        '  C2.2297,7.8378,6.2838,13.5135,7.5,15c1.0811-1.4865,5.2703-7.027,5.2703-9.7297C12.7703,1.4865,9.9324,0,7.5,0z',
      yOffset: 12, // half of the image size to set needle at the actual point location
      xOffset: 0,
      angle: 0
    },
    line: defaultSymbolization.line,
    polygon: defaultSymbolization.polygon
  },
  [DrawingLayer.FEATURE_HIGHLIGHT]: {
    point: {
      type: 'simple',
      size: 12,
      color: {
        r: 255,
        g: 255,
        b: 0,
        a: 0.6
      }
    },
    line: {
      width: 5,
      color: {
        r: 255,
        g: 255,
        b: 0,
        a: 0.6
      }
    },
    polygon: {
      fill: {
        color: {
          r: 255,
          g: 255,
          b: 0,
          a: 0.6
        }
      },
      outline: {
        width: 5,
        color: {
          r: 255,
          g: 255,
          b: 0,
          a: 1.0
        }
      }
    }
  }
};
