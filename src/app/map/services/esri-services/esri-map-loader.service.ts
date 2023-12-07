import {Injectable} from '@angular/core';
import {MapServiceType} from '../../types/map-service.type';
import {from, Observable} from 'rxjs';
import {ExternalServiceActiveMapItem} from '../../models/external-service.model';
import {EsriKMLLayer, EsriWMSLayer} from './esri.module';
import {map} from 'rxjs/operators';
import {ActiveMapItemFactory} from '../../../shared/factories/active-map-item.factory';
import {MapLoaderService} from '../../interfaces/map-loader.service';
import {ExternalLayer} from '../../../shared/interfaces/external-layer.interface';
import {ExternalWmsActiveMapItem} from '../../models/implementations/external-wms.model';
import {ExternalKmlActiveMapItem} from '../../models/implementations/external-kml.model';

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
    return from(layer.load());
  }

  private loadExternalWmsService(url: string): Observable<ExternalWmsActiveMapItem> {
    return this.loadService(new EsriWMSLayer({url})).pipe(
      map((wmsLayer) => {
        const subLayers: ExternalLayer<number>[] = wmsLayer.sublayers
          .map(
            (wmsSubLayer): ExternalLayer<number> => ({
              id: wmsSubLayer.id,
              name: wmsSubLayer.name,
              title: wmsSubLayer.title,
              visible: wmsSubLayer.visible,
            }),
          )
          .toArray()
          .slice(0, 3); // TODO GB3-348: remove this hack - no slice needed
        return ActiveMapItemFactory.createExternalWmsMapItem(wmsLayer.url, wmsLayer.title, subLayers);
      }),
    );
  }

  private loadExternalKmlService(url: string): Observable<ExternalKmlActiveMapItem> {
    return this.loadService(new EsriKMLLayer({url})).pipe(
      map((kmlLayer) => {
        const subLayers: ExternalLayer<number>[] = kmlLayer.sublayers
          .map((kmlSubLayer): ExternalLayer<number> => ({id: kmlSubLayer.id, title: kmlSubLayer.title, visible: kmlSubLayer.visible}))
          .toArray();
        return ActiveMapItemFactory.createExternalKmlMapItem(kmlLayer.url, kmlLayer.title, subLayers);
      }),
    );
  }
}
