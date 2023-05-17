import {DrawingLayer} from '../enums/drawing-layer.enum';
import {LayerSymbolizations, SymbolizationStyle} from '../interfaces/symbolization.interface';

const defaultSymbolization: SymbolizationStyle = {
  point: {
    type: 'point',
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
      type: 'point',
      color: {
        r: 0,
        g: 255,
        b: 0,
        a: 0.6
      }
    },
    line: defaultSymbolization.line,
    polygon: defaultSymbolization.polygon
  },
  [DrawingLayer.FEATURE_HIGHLIGHT]: {
    point: {
      type: 'point',
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
