import {Injectable} from '@angular/core';
import {Gb3ApiService} from './gb3-api.service';
import {ShareLinkItem, ShareLinkResponse} from '../../../interfaces/share-link.interface';
import {map} from 'rxjs/operators';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class Gb3ShareLinkService extends Gb3ApiService {
  protected readonly endpoint = 'share'; // TODO: specify when the API interface is done

  public loadShareLink(shareLinkId: string): Observable<ShareLinkItem> {
    const shareLink = this.get<ShareLinkItem>(this.createLoadUrl(shareLinkId));
    return shareLink.pipe(map((data) => this.mapShareLinkDataToShareLink(data)));
  }

  public createShareLink(shareLink: ShareLinkItem): Observable<string> {
    const shareLinkPayload = this.mapShareLinkToShareLinkPayload(shareLink);
    return this.post<ShareLinkItem, ShareLinkResponse>(this.createCreateUrl(), shareLinkPayload).pipe(
      map((shareLinkResponse) => shareLinkResponse.shareLinkId)
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
      ...shareLink
    };
  }

  private mapShareLinkToShareLinkPayload(shareLink: ShareLinkItem): ShareLinkItem {
    return {
      ...shareLink
    };
  }
}
