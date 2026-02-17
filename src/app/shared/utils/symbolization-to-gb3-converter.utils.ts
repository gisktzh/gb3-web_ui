import {Gb3StyledInternalDrawingRepresentation} from '../interfaces/internal-drawing-representation.interface';
import {Gb3GeoJsonFeature, Gb3VectorLayer, Gb3VectorLayerStyle} from '../interfaces/gb3-vector-layer.interface';
import {UserDrawingLayer} from '../enums/drawing-layer.enum';
import {MapConstants} from '../constants/map.constants';
import {UuidUtils} from './uuid.utils';
import {inject, Injectable} from '@angular/core';
import {DrawingSymbolsService} from '../interfaces/drawing-symbols-service.interface';
import {DRAWING_SYMBOLS_SERVICE} from 'src/app/app.tokens';
import {DrawingSymbolDescriptor} from '../interfaces/drawing-symbol/drawing-symbol-descriptor.interface';
import {SupportedGeometry} from '../types/SupportedGeometry.type';
import {HasSrs} from '../interfaces/geojson-types-with-srs.interface';
import {isGb3SymbolStyle} from '../type-guards/gb3-symbol-style.type-guard';
import {ReportSizing} from '../interfaces/report-sizing.interface';

@Injectable({
  providedIn: 'root',
})
export class SymbolizationToGb3ConverterUtils {
  private readonly drawingSymbolsService = inject<DrawingSymbolsService>(DRAWING_SYMBOLS_SERVICE);

  /**
   * Converts a list of internal drawings to a GB3VectorLayer representation.
   */
  public convertInternalToExternalRepresentation(
    features: Gb3StyledInternalDrawingRepresentation[],
    mapScale?: number,
    printScale?: number,
    reportSizing?: ReportSizing,
  ): Gb3VectorLayer {
    const gb3GeoJsonFeatures: Gb3GeoJsonFeature[] = [];
    const allStyles: Gb3VectorLayerStyle = {};

    features.forEach((feature) => {
      const uuid = UuidUtils.createUuid();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Gb3VectorLayerStyle specifies this as `any`, so we work with `any` here, too.
      let style: any = {...feature.properties.style};

      if (
        feature.properties.style &&
        isGb3SymbolStyle(feature.properties.style) &&
        feature.mapDrawingSymbol?.drawingSymbolDescriptor !== undefined
      ) {
        style = {
          type: 'symbol',
          graphicName: 'symbol',
          graphicOpacity: 1,
          pointRadius: feature.properties.style.symbolSize / 2, // Radius, not circumference, so halved.
          drawingSymbolDefinition: feature.mapDrawingSymbol?.drawingSymbolDefinition?.toJSON(),
          symbolSize: feature.properties.style.symbolSize,
          symbolRotation: feature.properties.style.symbolRotation,
        };

        // Since print scale is given, the user wants to print. We, therefore, also need to set the external Graphic.
        if (printScale && mapScale && reportSizing) {
          const iconSize = this.getSvgSize(
            feature.properties.style.symbolSize,
            feature.properties.style.symbolRotation,
            mapScale,
            printScale,
            reportSizing,
          );

          style.externalGraphic = this.getSVGString(feature.mapDrawingSymbol.drawingSymbolDescriptor, iconSize);
          style.pointRadius = iconSize / 2;
        }
      }

      const gb3GeoJsonFeature: Gb3GeoJsonFeature = {
        type: feature.type,
        geometry: feature.geometry ? this.supportedGeometryWithSrsToSupportedGeometry(feature.geometry) : feature.geometry,
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

  public async convertExternalToInternalRepresentation(
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

        if (styleForFeature?.type === 'symbol') {
          featureData.mapDrawingSymbol = await this.drawingSymbolsService.mapDrawingSymbolFromJSON(styleForFeature.drawingSymbolDefinition);
        }

        return featureData;
      }),
    );
  }

  private getSvgSize(originalSize: number, desiredRotation: number, mapScale: number, printScale: number, reportSizing: ReportSizing) {
    const scale = printScale / mapScale;
    let size = (originalSize / (reportSizing.width * scale)) * reportSizing.width;

    let angle = Math.abs(desiredRotation) % 45;
    if (angle === 0 && desiredRotation !== 0) {
      // Was a multiple of 45, so we default to 45.
      angle = 45;
    }

    if (angle !== 0) {
      // In this case, the given size is technically the hypothenuse. Since the icon is rotated, we need to calculate the _actual_ width and height of the bounding box.
      // Otherwise, the size in the print is skewed.

      // Radians
      const alpha = 90 * (Math.PI / 180);
      const beta = angle * (Math.PI / 180);
      const gamma = (90 - beta) * (Math.PI / 180);

      // We know all angles and one side, so we can calculate the rest of the sides
      const c = originalSize;
      const a = (c * Math.sin(alpha)) / Math.sin(gamma);
      const b = (a * Math.sin(beta)) / Math.sin(alpha);

      // Since there's always two similar triangles next to each other, we add both sides to get the full width of the encasing square.
      size = a + b;
    }

    return size;
  }

  private getSVGString(symbol: DrawingSymbolDescriptor, iconSize: number) {
    return this.drawingSymbolsService.getSVGString(symbol, iconSize);
  }

  private supportedGeometryWithSrsToSupportedGeometry<T extends SupportedGeometry>(geometry: T & HasSrs): T {
    const newGeometry: T = {
      type: geometry.type,
      coordinates: geometry.coordinates,
    } as T;

    if (geometry.bbox) {
      newGeometry.bbox = geometry.bbox;
    }

    return newGeometry;
  }
}
