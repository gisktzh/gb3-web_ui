import {inputBinding} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {provideRouter} from '@angular/router';
import {MockStore, provideMockStore} from '@ngrx/store/testing';
import {Map} from '../../../../shared/interfaces/topic.interface';
import {selectMapConfigState} from '../../../../state/map/reducers/map-config.reducer';
import {SearchResultEntryMapComponent} from './search-result-entry-map.component';

describe('SearchResultEntryMapComponent', () => {
  it('opens current maps internally with the selected map id', async () => {
    const map = {id: 'map-42', title: 'Flood map', icon: '/flood.png', gb2Url: null} as Map;
    await TestBed.configureTestingModule({
      imports: [SearchResultEntryMapComponent],
      providers: [provideMockStore(), provideRouter([])],
    }).compileComponents();
    const store = TestBed.inject(MockStore);
    store.overrideSelector(selectMapConfigState, {} as never);
    store.refreshState();
    const fixture = TestBed.createComponent(SearchResultEntryMapComponent, {bindings: [inputBinding('map', () => map)]});
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    const link = element.querySelector<HTMLAnchorElement>('a');
    expect(link?.getAttribute('href')).toBe('/maps?initialMapIds=map-42');
    expect(link?.getAttribute('aria-label')).toBe('Karte Flood map öffnen.');
    expect(element.querySelector<HTMLImageElement>('img')?.alt).toBe('Flood map');
  });
});
