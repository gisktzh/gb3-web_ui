import Graphic from '@arcgis/core/Graphic';
import Polygon from '@arcgis/core/geometry/Polygon';
import * as geometryEngine from '@arcgis/core/geometry/geometryEngine';
import GraphicHit = __esri.GraphicHit;

type HitWithArea = {hit: Graphic; area: number};

export class HitTestSelectionUtils {
  public static selectFeatureFromHitTestResult(hits: GraphicHit[]): Graphic {
    let pointHit: Graphic | null = null;
    let lineHit: Graphic | null = null;
    const polygonHits: GraphicHit[] = [];

    for (const hit of hits) {
      switch (hit.graphic.geometry.type) {
        case 'point':
          if (!pointHit) {
            pointHit = hit.graphic;
          }
          break;
        case 'polyline':
          if (!lineHit) {
            lineHit = hit.graphic;
          }
          break;
        case 'polygon':
          polygonHits.push(hit);
          break;
        case 'extent':
        case 'mesh':
        case 'multipoint':
          break;
      }
    }

    if (pointHit) {
      return pointHit;
    }
    if (lineHit) {
      return lineHit;
    }
    if (polygonHits.length > 0) {
      return this.selectSmallestPolygonFromHitTestResult(polygonHits);
    }
    return hits[0].graphic;
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
