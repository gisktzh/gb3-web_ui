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
          timeExtent: content.timeExtent
            ? {
                start: TimeExtentUtils.getUTCDate(content.timeExtent[0].start.toString()),
                end: TimeExtentUtils.getUTCDate(content.timeExtent[0].end.toString()),
              }
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
      content: payload.content.map((c) => {
        return {...c, timeExtent: [c.timeExtent]};
      }),
    } as unknown as PersonalFavoriteNew; // todo: typecasts once API is fixed
  }
}
