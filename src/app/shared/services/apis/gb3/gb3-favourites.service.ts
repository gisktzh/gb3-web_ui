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
import {TimeExtentUtils} from '../../../utils/time-extent.utils';

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
      ...data,
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
          ...content,
          timeExtent: data.drawings.timeExtent
            ? {
                //TODO GB3-645: refactor once TimeExtent is sent in content.
                start: TimeExtentUtils.getUTCDate(data.drawings.timeExtent.find((timeExtent) => timeExtent.id === content.mapId)?.start),
                end: TimeExtentUtils.getUTCDate(data.drawings.timeExtent.find((timeExtent) => timeExtent.id === content.mapId)?.end),
              }
            : undefined,
          //TODO GB3-645: refactor once TimeExtent is sent in content.
          attributeFilters: data.drawings.filterConfigurations
            ? data.drawings.filterConfigurations.find((filterConfiguration) => filterConfiguration.id === content.mapId)?.attributeFilters
            : undefined,
        };
      }),
    })) as unknown as FavouritesResponse; // todo: typecasts once API is fixed
  }

  private mapCreateFavouriteToCreatePersonalFavoritePayload({baseConfig, ...payload}: CreateFavourite): PersonalFavoriteNew {
    return {
      ...payload,
      east: baseConfig.center.x,
      north: baseConfig.center.y,
      scaledenom: baseConfig.scale,
      basemap: baseConfig.basemap,
      drawings: {
        //TODO: Remove once timeExtent sent in content
        ...payload.drawings,
        timeExtent: payload.content.map((activeMapItemConfiguration) => {
          return activeMapItemConfiguration.timeExtent
            ? {
                start: activeMapItemConfiguration.timeExtent.start,
                end: activeMapItemConfiguration.timeExtent.end,
                id: activeMapItemConfiguration.mapId,
              }
            : undefined;
        }),
        filterConfigurations: payload.content.map((activeMapItemConfiguration) => {
          return activeMapItemConfiguration.attributeFilters
            ? {
                attributeFilters: activeMapItemConfiguration.attributeFilters,
                id: activeMapItemConfiguration.mapId,
              }
            : undefined;
        }),
      },
    } as unknown as PersonalFavoriteNew; // todo: typecasts once API is fixed
  }
}
