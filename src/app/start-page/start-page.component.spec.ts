import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {MockStore, provideMockStore} from '@ngrx/store/testing';
import {selectScreenMode} from '../state/app/reducers/app-layout.reducer';
import {selectAdditionalInformationLinks} from '../state/support/reducers/support-content.reducer';
import {StartPageComponent} from './start-page.component';

describe('StartPageComponent', () => {
  it('composes every start-page section and switches the search layout on mobile', async () => {
    await TestBed.configureTestingModule({imports: [StartPageComponent], providers: [provideMockStore()]})
      .overrideComponent(StartPageComponent, {set: {imports: [], schemas: [CUSTOM_ELEMENTS_SCHEMA]}})
      .compileComponents();
    const store = TestBed.inject(MockStore);
    store.overrideSelector(selectScreenMode, 'regular');
    store.overrideSelector(selectAdditionalInformationLinks, []);
    store.refreshState();
    const fixture = TestBed.createComponent(StartPageComponent);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelector('start-page-search')).not.toBeNull();
    expect(element.querySelector('gis-browser-teaser')).not.toBeNull();
    expect(element.querySelector('frequently-used-items')).not.toBeNull();
    expect(element.querySelector('news-feed')).not.toBeNull();
    expect(element.querySelector('discover-maps')).not.toBeNull();

    store.overrideSelector(selectScreenMode, 'mobile');
    store.refreshState();
    fixture.detectChanges();
    expect(element.querySelector('.start-page__search')?.classList).toContain('start-page__search--mobile');
    expect(fixture.componentInstance.externalNewsFeedLink.url).toContain('zh.ch/de/news-uebersicht');
  });
});
