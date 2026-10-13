import {TestBed} from '@angular/core/testing';
import {provideRouter} from '@angular/router';
import {ContactComponent} from './contact.component';

describe('ContactComponent', () => {
  it('provides safe support and newsletter links plus the data catalogue route', async () => {
    await TestBed.configureTestingModule({imports: [ContactComponent], providers: [provideRouter([])]}).compileComponents();
    const fixture = TestBed.createComponent(ContactComponent);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    const externalLinks = [...element.querySelectorAll<HTMLAnchorElement>('a[target="_blank"]')];
    expect(element.querySelector<HTMLAnchorElement>('a.internal-link')?.getAttribute('href')).toBe('/data');
    expect(externalLinks).toHaveLength(2);
    expect(externalLinks.every((link) => link.rel === 'noopener noreferrer')).toBe(true);
  });
});
