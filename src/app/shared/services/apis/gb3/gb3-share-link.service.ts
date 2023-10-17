import {Injectable} from '@angular/core';
import {Gb3ApiService} from './gb3-api.service';
import {ShareLinkItem} from '../../../interfaces/share-link.interface';
import {map} from 'rxjs/operators';
import {Observable} from 'rxjs';
import {GeojsonFeature, SharedFavorite, SharedFavoriteNew, VectorLayer} from '../../../models/gb3-api-generated.interfaces';
import {Gb3GeoJsonFeature, Gb3VectorLayer} from '../../../interfaces/gb3-vector-layer.interface';
import {SupportedGeometry} from '../../../types/SupportedGeometry.type';
import {LineString, MultiPolygon, Point, Polygon} from 'geojson';

@Injectable({
  providedIn: 'root',
})
export class Gb3ShareLinkService extends Gb3ApiService {
  protected readonly endpoint = 'favorites';

  public loadShareLink(shareLinkId: string): Observable<ShareLinkItem> {
    const sharedFavorite = this.get<SharedFavorite>(this.createLoadUrl(shareLinkId));
    return sharedFavorite.pipe(map((data) => this.mapSharedFavoriteToShareLink(data)));
  }

  public createShareLink(shareLink: ShareLinkItem): Observable<string> {
    const shareLinkPayload = this.mapShareLinkToSharedFavoriteNew(shareLink);
    return this.post<SharedFavoriteNew, SharedFavorite>(this.getFullEndpointUrl(), shareLinkPayload).pipe(
      map((shareLinkResponse) => shareLinkResponse.id),
    );
  }

  private createLoadUrl(shareLinkId: string): string {
    return `${this.getFullEndpointUrl()}/${shareLinkId}`;
  }

  /**
   * This mapper casts the generic geometry from the GB3 API to a narrowly typed, internal feature which has the correct GeoJSON typing.
   * This is necessary because the API (in its current state) does not use the GeoJSON interface, but allows for type and coordinate
   * combinations that do not exist.
   * @param inFeature The feature to be transformed
   */
  private castGeojsonFeatureToGb3GeoJsonFeature(inFeature: GeojsonFeature): Gb3GeoJsonFeature {
    let castedGeometry: SupportedGeometry;
    switch (inFeature.geometry.type) {
      case 'Polygon': {
        castedGeometry = inFeature.geometry as Polygon;
        break;
      }
      case 'Point': {
        castedGeometry = inFeature.geometry as Point;
        break;
      }
      case 'LineString': {
        castedGeometry = inFeature.geometry as LineString;
        break;
      }
      case 'MultiPoint': {
        castedGeometry = inFeature.geometry as Polygon;
        break;
      }
      case 'MultiPolygon': {
        castedGeometry = inFeature.geometry as MultiPolygon;
        break;
      }
    }

    return {...inFeature, geometry: castedGeometry};
  }

  private mapVectorLayerToGb3VectorLayer(drawings: VectorLayer): Gb3VectorLayer {
    const castFeatures = drawings.geojson.features.map((feature) => this.castGeojsonFeatureToGb3GeoJsonFeature(feature));

    return {
      ...drawings,
      geojson: {
        ...drawings.geojson,
        features: castFeatures,
      },
    };
  }

  private mapSharedFavoriteToShareLink(sharedFavorite: SharedFavorite): ShareLinkItem {
    return {
      basemapId: sharedFavorite.basemap,
      center: {x: sharedFavorite.east, y: sharedFavorite.north},
      scale: sharedFavorite.scaledenom,
      content: sharedFavorite.content,
      drawings: this.mapVectorLayerToGb3VectorLayer(sharedFavorite.drawings),
      measurements: this.mapVectorLayerToGb3VectorLayer(sharedFavorite.measurements),
    };
  }

  private mapShareLinkToSharedFavoriteNew(shareLink: ShareLinkItem): SharedFavoriteNew {
    return {
      basemap: shareLink.basemapId,
      east: shareLink.center.x,
      north: shareLink.center.y,
      scaledenom: shareLink.scale,
      content: shareLink.content,
      drawings: shareLink.drawings,
      measurements: shareLink.measurements,
    };
  }
}
