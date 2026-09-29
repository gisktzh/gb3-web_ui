import {TestBed} from '@angular/core/testing';
import {provideRouter} from '@angular/router';
import {SupportPageNavigationComponent} from './support-page-navigation.component';

describe('SupportPageNavigationComponent', () => {
  it('provides a labelled navigation link for every support section', async () => {
    await TestBed.configureTestingModule({imports: [SupportPageNavigationComponent], providers: [provideRouter([])]}).compileComponents();
    const fixture = TestBed.createComponent(SupportPageNavigationComponent);
    fixture.detectChanges();
    const nav = (fixture.nativeElement as HTMLElement).querySelector('nav');
    const links = [...nav!.querySelectorAll<HTMLAnchorElement>('a')];
    expect(nav?.getAttribute('aria-label')).toBe('Unternavigation Hilfe & Support');
    expect(links.map((link) => link.getAttribute('href'))).toEqual(['/faq', '/contact', '/useful-information']);
  });
});
