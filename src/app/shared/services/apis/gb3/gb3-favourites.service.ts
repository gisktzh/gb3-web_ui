import {Injectable} from '@angular/core';
import {Gb3ApiService} from './gb3-api.service';
import {
  FavoritesDetailData,
  PersonalFavoriteNew,
  UserFavoritesDeleteData,
  UserFavoritesListData,
} from '../../../models/gb3-api-generated.interfaces';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {CreateFavourite, Favourite, FavouritesResponse} from '../../../interfaces/favourite.interface';
import {ApiGeojsonGeometryToGb3ConverterUtils} from '../../../utils/api-geojson-geometry-to-gb3-converter.utils';

@Injectable({
  providedIn: 'root',
})
export class Gb3FavouritesService extends Gb3ApiService {
  protected readonly endpoint = 'user/favorites';

  public createFavourite(createFavourite: CreateFavourite) {
    const createFavouritePayload = this.mapCreateFavouriteToCreatePersonalFavoritePayload(createFavourite);
    return this.post<PersonalFavoriteNew, FavoritesDetailData>(this.getFullEndpointUrl(), createFavouritePayload);
  }

  public loadFavourites(): Observable<FavouritesResponse> {
    const favouritesListData = this.get<UserFavoritesListData>(this.getFullEndpointUrl());
    return favouritesListData.pipe(
      map((data) => {
        data.sort((a, b) => {
          const current = new Date(a.updated_at);
          const next = new Date(b.updated_at);

          return next.getTime() - current.getTime();
        });
        return this.mapFavouritesListDataToFavouritesResponse(data);
      }),
    );
  }

  public deleteFavourite(favourite: Favourite): Observable<void> {
    const url = `${this.getFullEndpointUrl()}/${favourite.id}`;

    return this.delete<UserFavoritesDeleteData>(url);
  }

  private mapFavouritesListDataToFavouritesResponse(favouritesListData: UserFavoritesListData): FavouritesResponse {
    return favouritesListData.map((data) => ({
      id: data.id,
      title: data.title,
      baseConfig: {
        basemap: data.basemap,
        scale: data.scaledenom,
        center: {
          x: data.east,
          y: data.north,
        },
      },
      content: data.content.map((content) => {
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
      drawings: ApiGeojsonGeometryToGb3ConverterUtils.convertVectorLayerToGb3VectorLayer(data.drawings),
      measurements: ApiGeojsonGeometryToGb3ConverterUtils.convertVectorLayerToGb3VectorLayer(data.measurements),
    }));
  }

  private mapCreateFavouriteToCreatePersonalFavoritePayload({baseConfig, ...payload}: CreateFavourite): PersonalFavoriteNew {
    return {
      ...payload,
      east: baseConfig.center.x,
      north: baseConfig.center.y,
      scaledenom: baseConfig.scale,
      basemap: baseConfig.basemap,
      content: payload.content.map((content) => {
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
    };
  }
}
