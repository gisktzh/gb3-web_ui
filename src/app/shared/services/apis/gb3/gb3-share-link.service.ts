import {Injectable} from '@angular/core';
import {Gb3ApiService} from './gb3-api.service';
import {ShareLinkItem, ShareLinkResponse} from '../../../interfaces/share-link.interface';
import {delay, map} from 'rxjs/operators';
import {Observable, of} from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Gb3ShareLinkService extends Gb3ApiService {
  protected readonly endpoint = 'share'; // TODO: specify when the API interface is done

  public loadShareLink(shareLinkId: string): Observable<ShareLinkItem> {
    const shareLink = this.get<ShareLinkItem>(this.createLoadUrl(shareLinkId));
    return of({
      basemapId: 'arelkbackgroundzh',
      center: {x: 2675158, y: 1259964},
      scale: 320000,
      content: [
        {
          mapId: 'StatGebAlterZH',
          layers: [
            {
              id: 132494,
              layer: 'geb-alter_wohnen',
              visible: true,
            },
            {
              id: 132495,
              layer: 'geb-alter_grau',
              visible: false,
            },
            {
              id: 132496,
              layer: 'geb-alter_2',
              visible: true,
            },
          ],
          opacity: 1,
          visible: true,
          isSingleLayer: false,
        },
        {
          mapId: 'Lageklassen2003ZH',
          layers: [
            {
              id: 135765,
              layer: 'lageklassen-2003-flaechen',
              visible: true,
            },
            {
              id: 135775,
              layer: 'lageklassen-2003-einzelobjekte',
              visible: true,
            },
          ],
          opacity: 1,
          visible: true,
          isSingleLayer: false,
        },
      ],
      drawings: [],
      measurements: [],
    }).pipe(delay(2000));

    // TODO WES: FIX
    return shareLink.pipe(map((data) => this.mapShareLinkDataToShareLink(data)));
  }

  public createShareLink(shareLink: ShareLinkItem): Observable<string> {
    const shareLinkPayload = this.mapShareLinkToShareLinkPayload(shareLink);
    return of('abcd-efgh-ijkl-mnop').pipe(delay(2000));

    // TODO WES: FIX
    return this.post<ShareLinkItem, ShareLinkResponse>(this.createCreateUrl(), shareLinkPayload).pipe(
      map((shareLinkResponse) => shareLinkResponse.shareLinkId),
    );
  }

  private createLoadUrl(shareLinkId: string): string {
    const url = new URL(`${this.getFullEndpointUrl()}/get`); // TODO: specify when the API interface is done
    url.searchParams.append('id', shareLinkId); // TODO: specify when the API interface is done
    return url.toString();
  }

  private createCreateUrl(): string {
    return `${this.getFullEndpointUrl()}/create`; // TODO: specify when the API interface is done
  }

  private mapShareLinkDataToShareLink(shareLink: ShareLinkItem): ShareLinkItem {
    return {
      ...shareLink,
    };
  }

  private mapShareLinkToShareLinkPayload(shareLink: ShareLinkItem): ShareLinkItem {
    return {
      ...shareLink,
    };
  }
}
