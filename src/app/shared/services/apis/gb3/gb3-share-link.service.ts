import {Inject, Injectable} from '@angular/core';
import {Gb3ApiService} from './gb3-api.service';
import {ShareLinkItem} from '../../../interfaces/share-link.interface';
import {map} from 'rxjs/operators';
import {Observable} from 'rxjs';
import {SharedFavorite, SharedFavoriteNew} from '../../../models/gb3-api-generated.interfaces';
import {ApiGeojsonGeometryToGb3ConverterUtils} from '../../../utils/api-geojson-geometry-to-gb3-converter.utils';
import {ShareLinkPropertyCouldNotBeValidated} from '../../../errors/share-link.errors';
import {ConfigService} from '../../config.service';
import {HttpClient} from '@angular/common/http';
import {BasemapConfigService} from '../../../../map/services/basemap-config.service';
import {FavouritesService} from '../../../../map/services/favourites.service';
import {MapRestoreItem} from '../../../interfaces/map-restore-item.interface';
import {TimeService} from '../../../interfaces/time-service.interface';
import {TIME_SERVICE} from '../../../../app.module';

@Injectable({
  providedIn: 'root',
})
export class Gb3ShareLinkService extends Gb3ApiService {
  protected readonly endpoint = 'favorites';

  constructor(
    @Inject(HttpClient) http: HttpClient,
    @Inject(ConfigService) configService: ConfigService,
    @Inject(TIME_SERVICE) timeService: TimeService,
    private readonly basemapConfigService: BasemapConfigService,
    private readonly favouritesService: FavouritesService,
  ) {
    super(http, configService, timeService);
  }

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

  public createMapRestoreItem(shareLinkItem: ShareLinkItem, ignoreErrors: boolean = false): MapRestoreItem {
    const {content, drawings, basemapId, scale, center, measurements} = shareLinkItem;

    // validate basemap
    const basemapIdOrDefault = this.basemapConfigService.checkBasemapIdOrGetDefault(basemapId);
    if (!ignoreErrors && basemapIdOrDefault !== basemapId) {
      throw new ShareLinkPropertyCouldNotBeValidated(`Basemap ist ungültig: '${basemapId}'`);
    }

    // validate scale
    const maxScale = this.configService.mapConfig.mapScaleConfig.maxScale;
    const minScale = this.configService.mapConfig.mapScaleConfig.minScale;
    if (!ignoreErrors && (scale > minScale || scale < maxScale)) {
      throw new ShareLinkPropertyCouldNotBeValidated(`Massstab ist ungültig: '${scale}'`);
    }

    // validate active map items => validated within the favourite service
    const activeMapItems = this.favouritesService.getActiveMapItemsForFavourite(content, ignoreErrors);

    // extract drawing layers that are needed for the given favourite (i.e. they contain features)
    const {drawingsToAdd, drawingActiveMapItems} = this.favouritesService.getDrawingsForFavourite(drawings, measurements);

    // complete validation
    return {
      activeMapItems: [...drawingActiveMapItems, ...activeMapItems], // make sure drawings layers are added at the top
      scale,
      basemapId: basemapIdOrDefault,
      drawings: drawingsToAdd,
      x: center.x,
      y: center.y,
    };
  }

  private createLoadUrl(shareLinkId: string): string {
    return `${this.getFullEndpointUrl()}/${shareLinkId}`;
  }

  private mapSharedFavoriteToShareLink(sharedFavorite: SharedFavorite): ShareLinkItem {
    return {
      basemapId: sharedFavorite.basemap,
      center: {x: sharedFavorite.east, y: sharedFavorite.north},
      scale: sharedFavorite.scaledenom,
      content: sharedFavorite.content.map((content) => {
        return {
          id: content.id,
          visible: content.visible,
          opacity: content.opacity,
          isSingleLayer: content.isSingleLayer,
          layers: content.layers,
          mapId: content.mapId,
          attributeFilters: content.attributeFilters,
          timeExtent: content.timeExtent
            ? {
                start: this.timeService.createUTCDateFromString(content.timeExtent.start),
                end: this.timeService.createUTCDateFromString(content.timeExtent.end),
              }
            : undefined,
        };
      }),
      drawings: ApiGeojsonGeometryToGb3ConverterUtils.convertVectorLayerToGb3VectorLayer(sharedFavorite.drawings),
      measurements: ApiGeojsonGeometryToGb3ConverterUtils.convertVectorLayerToGb3VectorLayer(sharedFavorite.measurements),
    };
  }

  private mapShareLinkToSharedFavoriteNew(shareLink: ShareLinkItem): SharedFavoriteNew {
    return {
      basemap: shareLink.basemapId,
      east: shareLink.center.x,
      north: shareLink.center.y,
      scaledenom: shareLink.scale,
      content: shareLink.content.map((content) => {
        return {
          id: content.id,
          mapId: content.mapId,
          visible: content.visible,
          opacity: content.opacity,
          isSingleLayer: content.isSingleLayer,
          layers: content.layers,
          attributeFilters: content.attributeFilters,
          timeExtent: content.timeExtent
            ? {
                start: content.timeExtent.start.toUTCString(),
                end: content.timeExtent.end.toUTCString(),
              }
            : undefined,
        };
      }),
      drawings: shareLink.drawings,
      measurements: shareLink.measurements,
    };
  }
}
