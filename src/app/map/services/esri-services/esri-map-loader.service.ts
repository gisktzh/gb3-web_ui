import {Injectable} from '@angular/core';
import {MapServiceType} from '../../types/map-service.type';
import {catchError, filter, from, map, Observable, pipe, throwError} from 'rxjs';
import {ExternalServiceActiveMapItem} from '../../models/external-service.model';
import {EsriError, EsriKMLLayer, EsriWMSLayer} from './esri.module';
import {ActiveMapItemFactory} from '../../../shared/factories/active-map-item.factory';
import {MapLoaderService} from '../../interfaces/map-loader.service';
import {ExternalKmlLayer, ExternalWmsLayer} from '../../../shared/interfaces/external-layer.interface';
import {ExternalWmsActiveMapItem} from '../../models/implementations/external-wms.model';
import {ExternalKmlActiveMapItem} from '../../models/implementations/external-kml.model';
import {LayerCouldNotBeLoaded} from './errors/esri.errors';
import {ExternalServiceHasNoLayers, ExternalServiceHasNoUrl} from '../../../shared/errors/map-import.errors';
import {TypeUtils} from './utils/type.utils';

@Injectable({
  providedIn: 'root',
})
export class EsriMapLoaderService implements MapLoaderService {
  public loadExternalService(url: string, mapServiceType: MapServiceType): Observable<ExternalServiceActiveMapItem> {
    switch (mapServiceType) {
      case 'wms':
        return this.loadExternalWmsService(url);
      case 'kml':
        return this.loadExternalKmlService(url);
    }
  }

  private loadService<T extends __esri.Layer>(layer: T): Observable<T> {
    return from(layer.load()).pipe(
      catchError((error: unknown) => {
        let message;
        if (error instanceof EsriError) {
          message = error.message;
        }
        throw new LayerCouldNotBeLoaded(message);
      }),
    );
  }

  private loadExternalWmsService(url: string): Observable<ExternalWmsActiveMapItem> {
    let layer;
    try {
      layer = new EsriWMSLayer({url});
    } catch (error: unknown) {
      return throwError(() => new LayerCouldNotBeLoaded());
    }

    return this.loadService(layer).pipe(
      map((wmsLayer) => {
        const subLayers: ExternalWmsLayer[] = wmsLayer.sublayers
          .map(
            (wmsSubLayer): ExternalWmsLayer => ({
              type: 'wms',
              id: wmsSubLayer.id,
              name: wmsSubLayer.name,
              title: wmsSubLayer.title ?? '',
              visible: wmsSubLayer.visible,
            }),
          )
          .toArray();
        if (subLayers.length === 0) {
          throw new ExternalServiceHasNoLayers();
        }
        return ActiveMapItemFactory.createExternalWmsMapItem(
          wmsLayer.url,
          wmsLayer.title ?? '',
          subLayers,
          wmsLayer.imageFormat ?? undefined,
        );
      }),
    );
  }

  private loadExternalKmlService(url: string): Observable<ExternalKmlActiveMapItem> {
    let layer;
    try {
      layer = new EsriKMLLayer({url});
    } catch (error: unknown) {
      return throwError(() => new LayerCouldNotBeLoaded());
    }

    return this.loadService(layer).pipe(
      nonNullishFilter('sublayers'),
      map((kmlLayer) => {
        const subLayers: ExternalKmlLayer[] = kmlLayer.sublayers
          .map(
            (kmlSubLayer): ExternalKmlLayer => ({
              type: 'kml',
              id: kmlSubLayer.id,
              title: kmlSubLayer.title ?? '',
              visible: kmlSubLayer.visible,
            }),
          )
          .toArray();
        if (subLayers.length === 0) {
          throw new ExternalServiceHasNoLayers();
        }

        if (TypeUtils.isNullish(kmlLayer.url)) {
          throw new ExternalServiceHasNoUrl();
        }

        return ActiveMapItemFactory.createExternalKmlMapItem(kmlLayer.url, kmlLayer.title ?? '', subLayers);
      }),
    );
  }
}

export function nonNullishFilter<T, K extends keyof T>(key: K): (source: Observable<T>) => Observable<T & Record<K, NonNullable<T[K]>>> {
  return pipe(filter((obj): obj is T & Record<K, NonNullable<T[K]>> => obj[key] !== undefined && obj[key] !== null));
}
