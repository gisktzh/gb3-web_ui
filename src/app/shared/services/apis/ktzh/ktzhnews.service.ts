import {Injectable} from '@angular/core';
import {BaseApiService} from '../abstract-api.service';
import {RootObject as KTZHNewsRootObject} from '../../../models/ktzh-news-generated.interfaces';
import {News} from '../../../interfaces/news.interface';
import {map} from 'rxjs/operators';
import {Observable} from 'rxjs';
import {NewsService} from '../../../interfaces/news-service.interface';

@Injectable({
  providedIn: 'root'
})
export class KTZHNewsService extends BaseApiService implements NewsService {
  private readonly ktzhWebsiteBasePath = this.configService.apiConfig.ktzhWebsite.baseUrl;
  protected apiBaseUrl: string = `${this.ktzhWebsiteBasePath}/de/news-uebersicht/_jcr_content.zhweb-news.json`;
  private topicsFilter: string[] = ['planen-bauen', 'geoinformation'];
  private organisationFilter: string[] = ['kanton-zuerich', 'baudirektion', 'amt-fuer-raumentwicklung'];

  public loadNews(): Observable<News[]> {
    return this.get<KTZHNewsRootObject>(this.getNewsUrl()).pipe(map((result) => this.transformNewsResult(result)));
  }

  protected transformNewsResult(result: KTZHNewsRootObject) {
    return result.news.map((newsItem) => {
      return {
        ...newsItem,
        link: `${this.ktzhWebsiteBasePath}${newsItem.link}`
      };
    });
  }

  private getNewsUrl(): string {
    const url = new URL(this.apiBaseUrl);
    url.searchParams.set('topic', `themen:${this.topicsFilter.join('/')}`);
    url.searchParams.set('organisation', `organisationen:${this.organisationFilter.join('/')}`);
    url.searchParams.set('orderBy', 'new');
    return url.toString();
  }
}
