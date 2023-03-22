import {Injectable} from '@angular/core';
import {Gb3ApiService} from './gb3-api.service';
import {FavoritesCreatePayload, FavoritesDetailData, FavoritesListData} from '../../../models/gb3-api-generated.interfaces';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {CreateFavourite, FavouriteLayerConfiguration, FavouritesResponse} from '../../../interfaces/favourite.interface';

@Injectable({
  providedIn: 'root'
})
export class Gb3FavouritesService extends Gb3ApiService {
  protected readonly endpoint = 'v3/favorites';

  public createFavourite(createFavourite: CreateFavourite) {
    return this.post<FavoritesCreatePayload, FavoritesDetailData>(this.getFullEndpointUrl(), createFavourite);
  }

  public loadFavourites(): Observable<FavouritesResponse> {
    const favouritesListData = this.get<FavoritesListData>(this.getFullEndpointUrl());
    return favouritesListData.pipe(
      map((data) => {
        data.sort((a, b) => {
          //todo: maybe this can be cast automatically if the backend is properly set?
          const current = new Date(a.updated_at);
          const next = new Date(b.updated_at);

          return next.getTime() - current.getTime();
        });
        return this.mapFavouritesListDataToFavouritesResponse(data);
      })
    );
  }

  private mapFavouritesListDataToFavouritesResponse(favouritesListData: FavoritesListData): FavouritesResponse {
    return favouritesListData.map((data) => {
      const id = data.id;
      const title = data.title;
      const content = data.content as FavouriteLayerConfiguration[]; // todo: remove type cast when backend is properly typed

      return {
        id,
        title,
        content
      };
    });
  }
}
