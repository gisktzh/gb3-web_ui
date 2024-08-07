import Graphic from '@arcgis/core/Graphic';
import Polygon from '@arcgis/core/geometry/Polygon';
import * as geometryEngine from '@arcgis/core/geometry/geometryEngine';
import {UnsupportedGeometryType} from '../errors/esri.errors';
import GraphicHit = __esri.GraphicHit;

type HitWithArea = {hit: Graphic; area: number};

export class HitTestSelectionUtils {
  public static selectFeatureFromHitTestResult(hits: GraphicHit[]): Graphic | undefined {
    if (hits.length === 0) {
      return undefined;
    }
    const pointHit = hits.find((hit) => hit.graphic.geometry.type === 'point');
    if (pointHit) {
      return pointHit.graphic;
    }
    const lineHit = hits.find((hit) => hit.graphic.geometry.type === 'polyline');
    if (lineHit) {
      return lineHit.graphic;
    }
    const polygonHits = hits.filter((hit) => hit.graphic.geometry.type === 'polygon');
    if (polygonHits.length > 0) {
      return this.selectSmallestPolygonFromHitTestResult(polygonHits);
    }
    throw new UnsupportedGeometryType(hits[0].graphic.geometry.type);
  }

  public static selectSmallestPolygonFromHitTestResult(polygonHits: GraphicHit[]): Graphic {
    const hitSelection = polygonHits.reduce(
      (hitWithSmallestArea: HitWithArea, currentHit) => {
        const area = geometryEngine.planarArea(currentHit.graphic.geometry as Polygon);
        if (area < hitWithSmallestArea.area) {
          return {hit: currentHit.graphic, area};
        }
        return hitWithSmallestArea;
      },
      {
        hit: polygonHits[0].graphic,
        area: geometryEngine.planarArea(polygonHits[0].graphic.geometry as Polygon),
      },
    );
    return hitSelection.hit;
  }
}
