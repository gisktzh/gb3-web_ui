import {TestBed} from '@angular/core/testing';
import {of} from 'rxjs';
import {NEWS_SERVICE} from '../../../app.tokens';
import {NewsService} from '../../../shared/interfaces/news-service.interface';
import {NewsFeedComponent} from './news-feed.component';

describe('NewsFeedComponent', () => {
  it('publishes at most the three newest supplied news entries', async () => {
    const news = Array.from({length: 4}, (_, index) => ({
      title: `News ${index}`,
      date: '2026-01-01',
      type: 'news',
      link: `https://example.com/${index}`,
      teaserText: `Teaser ${index}`,
    }));
    const service: NewsService = {loadNews: () => of(news)};
    await TestBed.configureTestingModule({
      imports: [NewsFeedComponent],
      providers: [{provide: NEWS_SERVICE, useValue: service}],
    }).compileComponents();
    const fixture = TestBed.createComponent(NewsFeedComponent);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;

    expect(fixture.componentInstance.loadingState()).toBe('loaded');
    expect(fixture.componentInstance.news()).toHaveLength(3);
    expect(element.querySelectorAll('link-grid-list-item')).toHaveLength(3);
    expect(element.textContent).not.toContain('Teaser 3');
  });
});
