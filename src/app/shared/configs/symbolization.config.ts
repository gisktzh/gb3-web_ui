import {DrawingLayer} from '../enums/drawing-layer.enum';
import {LayerSymbolizations, SymbolizationStyle} from '../interfaces/symbolization.interface';

const defaultOutline = {
  width: 1,
  color: {
    r: 0,
    g: 0,
    b: 0,
    a: 1.0
  }
};

const defaultSymbolization: SymbolizationStyle = {
  point: {
    type: 'simple',
    size: 12,
    color: {
      r: 0,
      g: 0,
      b: 0,
      a: 1.0
    },
    outline: defaultOutline
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
  [DrawingLayer.Redlining]: {
    point: defaultSymbolization.point,
    line: defaultSymbolization.line,
    polygon: defaultSymbolization.polygon
  },
  [DrawingLayer.LocatePosition]: {
    point: {
      type: 'picture',
      url: '/assets/images/map-icons/locate-me.svg',
      width: 26,
      height: 26,
      yOffset: 0,
      xOffset: 0,
      angle: 0
    },
    line: defaultSymbolization.line,
    polygon: defaultSymbolization.polygon
  },
  [DrawingLayer.FeatureHighlight]: {
    point: {
      type: 'simple',
      size: 12,
      color: {
        r: 255,
        g: 255,
        b: 0,
        a: 0.6
      },
      outline: defaultOutline
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
      outline: defaultOutline
    }
  }
};
