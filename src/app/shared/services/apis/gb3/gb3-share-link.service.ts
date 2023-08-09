import {Injectable} from '@angular/core';
import {Gb3ApiService} from './gb3-api.service';
import {ShareLinkItem} from '../../../interfaces/share-link.interface';
import {map} from 'rxjs/operators';
import {Observable} from 'rxjs';
import {SharedFavorite, SharedFavoriteNew} from '../../../models/gb3-api-generated.interfaces';

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

  private mapSharedFavoriteToShareLink(sharedFavorite: SharedFavorite): ShareLinkItem {
    return {
      basemapId: sharedFavorite.basemap,
      center: {x: sharedFavorite.east, y: sharedFavorite.north},
      scale: sharedFavorite.scaledenom,
      content: sharedFavorite.content,
      drawings: sharedFavorite.drawings,
      measurements: sharedFavorite.measurements,
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
