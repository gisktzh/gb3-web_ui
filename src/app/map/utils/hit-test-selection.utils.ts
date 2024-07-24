import Point from '@arcgis/core/geometry/Point';
import Graphic from '@arcgis/core/Graphic';
import Polygon from '@arcgis/core/geometry/Polygon';
import GraphicHit = __esri.GraphicHit;

type HitDistance = {hit: Graphic; distance: number};

export class HitTestSelectionUtils {
  public static selectFeatureFromHitTestResult(hits: GraphicHit[], hitTestLocation: Point): Graphic {
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
      return this.selectPolygonFromHitTestResult(polygonHits, hitTestLocation);
    }
    return hits[0].graphic;
  }

  public static selectPolygonFromHitTestResult(polygonHits: GraphicHit[], hitTestLocation: Point): Graphic {
    const closestHit = polygonHits.reduce(
      (previous: HitDistance, current) => {
        const centroid = (current.graphic.geometry as Polygon).centroid;
        const distance = this.calculateDistance(centroid, hitTestLocation);
        if (distance < previous.distance) {
          return {hit: current.graphic, distance};
        }
        return previous;
      },
      {
        hit: polygonHits[0].graphic,
        distance: this.calculateDistance((polygonHits[0].graphic.geometry as Polygon).centroid, hitTestLocation),
      },
    );
    return closestHit.hit;
  }

  public static calculateDistance(centroid: Point, clickLocation: Point): number {
    return Math.sqrt(Math.pow(centroid.x - clickLocation.x, 2) + Math.pow(centroid.y - clickLocation.y, 2));
  }
}
