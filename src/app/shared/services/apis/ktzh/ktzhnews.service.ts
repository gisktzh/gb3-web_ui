import {Injectable} from '@angular/core';
import {BaseApiService} from '../abstract-api.service';
import {RootObject as KTZHNewsRootObject} from '../../../models/ktzh-news-generated.interfaces';
import {KTZHNews} from '../../../interfaces/ktzh-news.interface';
import {map} from 'rxjs/operators';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class KTZHNewsService extends BaseApiService {
  protected apiBaseUrl: string = 'https://www.zh.ch/de/news-uebersicht/_jcr_content.zhweb-news.zhweb-cache.json';
  private topicsFilter: string[] = ['planen-bauen', 'geoinformation'];
  private organisationFilter: string[] = ['kanton-zuerich', 'baudirektion', 'amt-fuer-raumentwicklung'];

  public loadNews(): Observable<KTZHNews[]> {
    return this.get<KTZHNewsRootObject>(this.getNewsUrl()).pipe(map((result) => result.news));
  }

  private getNewsUrl(): string {
    const url = new URL(this.apiBaseUrl);
    url.searchParams.set('topic', `themen:${this.topicsFilter.join('/')}`);
    url.searchParams.set('organisation', `organisationen:${this.organisationFilter.join('/')}`);
    url.searchParams.set('orderBy', 'new');
    return url.toString();
  }
}
