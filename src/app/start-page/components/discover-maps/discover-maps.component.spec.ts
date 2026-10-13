import {TestBed} from '@angular/core/testing';
import {provideRouter} from '@angular/router';
import {of} from 'rxjs';
import {GRAV_CMS_SERVICE} from '../../../app.tokens';
import {DiscoverMapsItem} from '../../../shared/interfaces/discover-maps-item.interface';
import {GravCmsService} from '../../../shared/services/apis/grav-cms/grav-cms.service';
import {DiscoverMapsComponent} from './discover-maps.component';

describe('DiscoverMapsComponent', () => {
  it('limits recommendations to two and exposes their map links', async () => {
    const items = Array.from({length: 3}, (_, index) => ({
      id: `${index}`,
      title: `Map ${index}`,
      description: `Description ${index}`,
      mapId: `map-${index}`,
      fromDate: new Date(),
      toDate: new Date(),
      image: {url: `/map-${index}.png`},
    })) as DiscoverMapsItem[];
    const service = {loadDiscoverMapsData: () => of(items)} as GravCmsService;
    await TestBed.configureTestingModule({
      imports: [DiscoverMapsComponent],
      providers: [{provide: GRAV_CMS_SERVICE, useValue: service}, provideRouter([])],
    }).compileComponents();
    const fixture = TestBed.createComponent(DiscoverMapsComponent);
    fixture.detectChanges();

    expect(fixture.componentInstance.loadingState()).toBe('loaded');
    expect(fixture.componentInstance.discoverMapsItems()).toEqual(items.slice(0, 2));
    expect((fixture.nativeElement as HTMLElement).querySelectorAll('link-grid-list-item')).toHaveLength(2);
  });

  it('explains an empty successful response', async () => {
    await TestBed.configureTestingModule({
      imports: [DiscoverMapsComponent],
      providers: [{provide: GRAV_CMS_SERVICE, useValue: {loadDiscoverMapsData: () => of([])}}, provideRouter([])],
    }).compileComponents();
    const fixture = TestBed.createComponent(DiscoverMapsComponent);
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Aktuell gibt es keine Empfehlungen');
  });
});
