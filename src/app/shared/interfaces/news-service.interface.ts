import {Observable} from 'rxjs';
import {News} from './news.interface';

export interface NewsService {
  loadNews: () => Observable<News[]>;
}
