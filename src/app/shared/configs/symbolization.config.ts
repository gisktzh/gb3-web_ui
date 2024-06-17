import {InternalDrawingLayer, UserDrawingLayer} from '../enums/drawing-layer.enum';
import {LayerSymbolizations, SymbolizationStyle} from '../interfaces/symbolization.interface';
import {defaultFillColor, defaultLineColor, defaultLineWidth, defaultOutline} from './drawing.config';

const defaultSymbolization: SymbolizationStyle = {
  text: {
    color: {
      r: 0,
      g: 0,
      b: 0,
      a: 1.0,
    },
    outline: defaultOutline,
    size: 10,
    xOffset: 0,
    yOffset: 0,
  },

  point: {
    type: 'simple',
    size: 12,
    color: {
      r: 0,
      g: 0,
      b: 0,
      a: 1.0,
    },
    outline: defaultOutline,
  },
  line: {
    width: 5,
    color: {
      r: 0,
      g: 0,
      b: 0,
      a: 1.0,
    },
  },
  polygon: {
    fill: {
      color: {
        r: 0,
        g: 0,
        b: 0,
        a: 1.0,
      },
    },
    outline: {
      width: 5,
      color: {
        r: 0,
        g: 0,
        b: 0,
        a: 1.0,
      },
    },
  },
};

export const layerSymbolizations: LayerSymbolizations = {
  [InternalDrawingLayer.ElevationProfile]: {
    ...defaultSymbolization,
    point: {
      type: 'simple',
      size: 8,
      color: {
        r: 255,
        g: 0,
        b: 0,
        a: 1,
      },
      outline: {
        width: 2,
        color: {
          r: 255,
          g: 0,
          b: 0,
          a: 1.0,
        },
      },
    },
  },
  [InternalDrawingLayer.LocatePosition]: {
    text: defaultSymbolization.text,
    point: {
      type: 'picture',
      url: '/assets/images/map-icons/locate-me.svg',
      width: 26,
      height: 26,
      yOffset: 0,
      xOffset: 0,
      angle: 0,
    },
    line: defaultSymbolization.line,
    polygon: defaultSymbolization.polygon,
  },
  [InternalDrawingLayer.FeatureQueryLocation]: {
    text: defaultSymbolization.text,
    point: {
      type: 'picture',
      url: '/assets/images/map-icons/info-pin.svg',
      width: 32,
      height: 40,
      // so, the yOffset should be (height/2) to ensure the pin of the marker is exactly where we clicked. However, because the SVG uses
      // a filter which adds to its height, we need to take this into account. Empiricially tested (🤞), it seems to be 4px wide, so we
      // take 8px off the yOffset to ensure our tip is exactly where it should be.
      yOffset: 12,
      xOffset: 0,
      angle: 0,
    },
    line: defaultSymbolization.line,
    polygon: defaultSymbolization.polygon,
  },
  [InternalDrawingLayer.FeatureHighlight]: {
    text: defaultSymbolization.text,
    point: {
      type: 'simple',
      size: 12,
      color: {
        r: 255,
        g: 255,
        b: 0,
        a: 0.6,
      },
      outline: defaultOutline,
    },
    line: {
      width: 5,
      color: {
        r: 255,
        g: 255,
        b: 0,
        a: 0.6,
      },
    },
    polygon: {
      fill: {
        color: {
          r: 255,
          g: 255,
          b: 0,
          a: 0.6,
        },
      },
      outline: defaultOutline,
    },
  },
  [InternalDrawingLayer.PrintPreview]: {
    text: defaultSymbolization.text,
    point: defaultSymbolization.point,
    line: defaultSymbolization.line,
    polygon: {
      fill: {
        color: {
          r: 255,
          g: 255,
          b: 0,
          a: 0.6,
        },
      },
      outline: defaultOutline,
    },
  },
  [UserDrawingLayer.Measurements]: {
    text: {
      color: defaultLineColor,
      outline: {
        color: {
          r: 255,
          g: 255,
          b: 255,
          a: 1.0,
        },
        width: 1,
      },
      size: 12,
      xOffset: 0,
      yOffset: 6,
    },
    point: {
      type: 'simple',
      size: 5,
      color: defaultLineColor,
      outline: {
        width: 1,
        color: {
          r: 255,
          g: 255,
          b: 255,
          a: 1.0,
        },
      },
    },
    line: {
      width: defaultLineWidth,
      color: defaultLineColor,
    },
    polygon: {
      fill: {
        color: defaultFillColor,
      },
      outline: {
        width: defaultLineWidth,
        color: defaultLineColor,
      },
    },
  },
  [UserDrawingLayer.Drawings]: {
    text: {
      color: defaultLineColor,
      outline: {
        color: {
          r: 255,
          g: 255,
          b: 255,
          a: 1.0,
        },
        width: 1,
      },
      size: 12,
      xOffset: 0,
      yOffset: 6,
    },
    point: {
      type: 'simple', // note: if this is changed, adjust the typecast in EsriToolService!
      size: 5,
      color: defaultLineColor,
      outline: {
        width: 1,
        color: defaultLineColor,
      },
    },
    line: {
      width: defaultLineWidth,
      color: defaultLineColor,
    },
    polygon: {
      fill: {
        color: defaultFillColor,
      },
      outline: {
        width: defaultLineWidth,
        color: defaultLineColor,
      },
    },
  },
  [InternalDrawingLayer.Selection]: {
    text: defaultSymbolization.text,
    point: {
      type: 'simple',
      size: 12,
      color: {
        r: 255,
        g: 255,
        b: 0,
        a: 0.6,
      },
      outline: defaultOutline,
    },
    line: {
      width: 5,
      color: {
        r: 255,
        g: 255,
        b: 0,
        a: 0.6,
      },
    },
    polygon: {
      fill: {
        color: {
          r: 255,
          g: 255,
          b: 0,
          a: 0.6,
        },
      },
      outline: defaultOutline,
    },
  },
  [InternalDrawingLayer.SearchResultHighlight]: {
    text: defaultSymbolization.text,
    point: {
      type: 'simple',
      size: 22,
      color: {
        r: 255,
        g: 0,
        b: 0,
        a: 0.5,
      },
      outline: {
        width: 0,
        color: {
          r: 0,
          g: 0,
          b: 0,
          a: 0,
        },
      },
    },
    line: {
      width: 10,
      color: {
        r: 255,
        g: 0,
        b: 0,
        a: 0.5,
      },
    },
    polygon: {
      fill: {
        color: {
          r: 255,
          g: 0,
          b: 0,
          a: 0.5,
        },
      },
      outline: {
        width: 0,
        color: {
          r: 0,
          g: 0,
          b: 0,
          a: 0,
        },
      },
    },
  },
};
