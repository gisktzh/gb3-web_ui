import Graphic from '@arcgis/core/Graphic';
import Polygon from '@arcgis/core/geometry/Polygon';
import * as geometryEngine from '@arcgis/core/geometry/geometryEngine';
import {UnsupportedGeometryType} from '../errors/esri.errors';
import {hasNonNullishProperty, isNullish} from '../type-guards/esri-nullish.type-guard';
import GraphicHit = __esri.GraphicHit;

type HitWithArea = {hit: Graphic; area: number};

export class HitTestSelectionUtils {
  public static selectFeatureFromHitTestResult(hits: GraphicHit[]): Graphic | undefined {
    if (hits.length === 0 || hits.every((hit) => isNullish(hit.graphic.geometry))) {
      return undefined;
    }

    const graphics = hits.map((hit) => hit.graphic).filter((graphic) => hasNonNullishProperty(graphic, 'geometry'));
    const pointGraphic = graphics.find((graphic) => graphic.geometry.type === 'point');
    if (pointGraphic) {
      return pointGraphic;
    }

    const lineGraphic = graphics.find((graphic) => graphic.geometry.type === 'polyline');
    if (lineGraphic) {
      return lineGraphic;
    }

    const polygonGraphics = graphics.filter((graphic) => graphic.geometry.type === 'polygon');
    if (polygonGraphics.length > 0) {
      return this.selectSmallestPolygonFromHitTestResult(polygonGraphics);
    }
    throw new UnsupportedGeometryType(graphics[0].geometry.type);
  }

  public static selectSmallestPolygonFromHitTestResult(polygonGraphics: Graphic[]): Graphic {
    const hitSelection = polygonGraphics.reduce(
      (hitWithSmallestArea: HitWithArea, currentHit) => {
        const area = geometryEngine.planarArea(currentHit.geometry as Polygon);
        if (area < hitWithSmallestArea.area) {
          return {hit: currentHit, area};
        }
        return hitWithSmallestArea;
      },
      {
        hit: polygonGraphics[0],
        area: geometryEngine.planarArea(polygonGraphics[0].geometry as Polygon),
      },
    );
    return hitSelection.hit;
  }
}
