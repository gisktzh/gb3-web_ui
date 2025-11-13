import {
  Gb3StyledInternalDrawingRepresentation,
  Gb3StyleRepresentation,
  Gb3SymbolStyle,
} from '../interfaces/internal-drawing-representation.interface';
import {Gb3GeoJsonFeature, Gb3VectorLayer, Gb3VectorLayerStyle} from '../interfaces/gb3-vector-layer.interface';
import {UserDrawingLayer} from '../enums/drawing-layer.enum';
import {MapConstants} from '../constants/map.constants';
import {UuidUtils} from './uuid.utils';
import cimSymbolToSVG from '@gisktzh/cim-symbol-to-svg';
import WebStyleSymbol from '@arcgis/core/symbols/WebStyleSymbol';
import CIMSymbol from '@arcgis/core/symbols/CIMSymbol';
import {Gb2Constants} from '../constants/gb2.constants';

function isGb3SymbolStyle(style: Gb3StyleRepresentation): style is Gb3SymbolStyle {
  return style.type === 'symbol';
}

export class SymbolizationToGb3ConverterUtils {
  /**
   * Converts a list of internal drawings to a GB3VectorLayer representation.
   */
  public static convertInternalToExternalRepresentation(
    features: Gb3StyledInternalDrawingRepresentation[],
    mapScale: number,
    printScale: number,
  ): Gb3VectorLayer {
    const gb3GeoJsonFeatures: Gb3GeoJsonFeature[] = [];
    const allStyles: Gb3VectorLayerStyle = {};

    features.forEach((feature) => {
      const uuid = UuidUtils.createUuid();

      // Gb3VectorLayerStyle specifies this as `any`, so we work with `any` here, too.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let style: any = {...feature.properties.style};

      if (feature.properties.style && isGb3SymbolStyle(feature.properties.style) && feature.mapDrawingSymbol !== undefined) {
        if (!feature.mapDrawingSymbol?.cimSymbol) {
          return;
        }

        const iconSize = this.getSvgSize(
          feature.properties.style.symbolSize,
          feature.properties.style.symbolRotation,
          mapScale,
          printScale,
        );

        style = {
          type: 'symbol',
          externalGraphic: this.getSVGString(feature.mapDrawingSymbol.cimSymbol, iconSize),
          graphicName: 'symbol',
          graphicOpacity: 1,
          pointRadius: iconSize, // Map units
          webStyleSymbol: feature.mapDrawingSymbol?.webStyleSymbol?.toJSON(),
          symbolSize: feature.properties.style.symbolSize,
          symbolRotation: feature.properties.style.symbolRotation,
        };
      }

      const gb3GeoJsonFeature = {
        type: feature.type,
        geometry: feature.geometry,
        properties: {
          id: feature.properties[MapConstants.DRAWING_IDENTIFIER],
          belongsTo: feature.properties[MapConstants.BELONGS_TO_IDENTIFIER],
          tool: feature.properties[MapConstants.TOOL_IDENTIFIER],
          style: uuid,
          text: feature.labelText,
        },
      };

      gb3GeoJsonFeatures.push(gb3GeoJsonFeature);
      allStyles[uuid] = style;
    });

    return {
      type: 'Vector',
      geojson: {
        type: 'FeatureCollection',
        features: gb3GeoJsonFeatures,
      },
      styles: allStyles,
    };
  }

  public static async convertExternalToInternalRepresentation(
    gb3VectorLayer: Gb3VectorLayer,
    source: UserDrawingLayer,
  ): Promise<Gb3StyledInternalDrawingRepresentation[]> {
    return await Promise.all(
      gb3VectorLayer.geojson.features.map(async (feature) => {
        // @ts-ignore The OpenLayer 2 type is using `a` here instead of a typed key, even though the actual implementation uses a UUID, so we need to ts-ignore it.
        const styleForFeature: VectorLayer.a.style = gb3VectorLayer.styles[feature.properties.style];

        const featureData: Gb3StyledInternalDrawingRepresentation = {
          type: 'Feature' as const,
          properties: {
            [MapConstants.DRAWING_IDENTIFIER]: feature.properties.id,
            [MapConstants.BELONGS_TO_IDENTIFIER]: feature.properties.belongsTo,
            [MapConstants.TOOL_IDENTIFIER]: feature.properties.tool,
            style: styleForFeature,
          },
          geometry: {
            ...feature.geometry,
            srs: 2056 as const,
          },
          source: source,
          labelText: feature.properties.text,
        };

        if (styleForFeature && styleForFeature.type === 'symbol') {
          const webStyleSymbol = WebStyleSymbol.fromJSON(styleForFeature.webStyleSymbol);
          featureData.mapDrawingSymbol = {
            webStyleSymbol: webStyleSymbol,
            cimSymbol: (await webStyleSymbol.fetchSymbol({acceptedFormats: ['cim']})) as CIMSymbol,
          };
        }

        return featureData;
      }),
    );
  }

  private static getSvgSize(originalSize: number, rotation: number, printScale: number, mapScale: number) {
    let size = ((originalSize * (printScale / mapScale)) / Gb2Constants.PRINT_DPI) * MapConstants.DPI;
    if (rotation !== 0) {
      // In this case, the given size is technically the hypothenuse. Since the icon is rotate, we need to calculate the _actual_ width and height.
      // Otherwise, the size in thee print is skewed.

      // Radians
      const alpha = 90 * (Math.PI / 180);
      const beta = Math.abs(rotation) * (Math.PI / 180);
      const gamma = (90 - beta) * (Math.PI / 180);

      // We know all angles and one side, so we can caluclate the rest of the sides
      const c = originalSize;
      const a = (c * Math.sin(alpha)) / Math.sin(gamma);
      const b = (a * Math.sin(beta)) / Math.sin(alpha);

      // Since there's always two similar triangles next to each other, we add both sides to get the full width of the encasing square.
      size = a + b;
    }

    return size;
  }

  private static getSVGString(symbol: CIMSymbol, iconSize: number) {
    const svg = cimSymbolToSVG(symbol);

    if (!svg) {
      return '';
    }

    svg.setAttribute('width', iconSize.toString());
    svg.setAttribute('height', iconSize.toString());

    const container = document.createElement('div');
    container.appendChild(svg);

    const svgString = container.innerHTML;
    const decoded = decodeURI(encodeURIComponent(svgString));
    const base64 = btoa(decoded);

    return `data:image/svg+xml;base64,${base64}`;
  }
}
