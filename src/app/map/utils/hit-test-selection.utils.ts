import Point from '@arcgis/core/geometry/Point';
import Graphic from '@arcgis/core/Graphic';
import Polygon from '@arcgis/core/geometry/Polygon';
import * as geometryEngine from '@arcgis/core/geometry/geometryEngine';
import GraphicHit = __esri.GraphicHit;

type HitWithArea = {hit: Graphic; area: number};

export class HitTestSelectionUtils {
  public static selectFeatureFromHitTestResult(hits: GraphicHit[]): Graphic {
    const pointHits = hits.filter((hit) => hit.graphic.geometry.type === 'point');
    if (pointHits.length > 0) {
      return pointHits[0].graphic;
    }
    const lineHits = hits.filter((hit) => hit.graphic.geometry.type === 'polyline');
    if (lineHits.length > 0) {
      return lineHits[0].graphic;
    }
    const polygonHits = hits.filter((hit) => hit.graphic.geometry.type === 'polygon');
    if (polygonHits.length > 0) {
      return this.selectSmallestPolygonFromHitTestResult(polygonHits);
    }
    return hits[0].graphic;
  }

  public static selectSmallestPolygonFromHitTestResult(polygonHits: GraphicHit[]): Graphic {
    const hitWithSmallestArea = polygonHits.reduce(
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
    return hitWithSmallestArea.hit;
  }

  public static calculateDistance(centroid: Point, clickLocation: Point): number {
    return Math.sqrt(Math.pow(centroid.x - clickLocation.x, 2) + Math.pow(centroid.y - clickLocation.y, 2));
  }
}
