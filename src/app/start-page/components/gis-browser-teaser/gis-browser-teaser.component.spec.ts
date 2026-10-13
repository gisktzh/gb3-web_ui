import {TestBed} from '@angular/core/testing';
import {provideRouter} from '@angular/router';
import {GisBrowserTeaserComponent} from './gis-browser-teaser.component';

describe('GisBrowserTeaserComponent', () => {
  it('links its call to action to the map page', async () => {
    await TestBed.configureTestingModule({imports: [GisBrowserTeaserComponent], providers: [provideRouter([])]}).compileComponents();
    const fixture = TestBed.createComponent(GisBrowserTeaserComponent);
    fixture.detectChanges();
    const link = (fixture.nativeElement as HTMLElement).querySelector<HTMLAnchorElement>('a');
    expect(link?.getAttribute('href')).toBe('/maps');
    expect(link?.textContent).toContain('GIS-Browser starten');
  });
});
