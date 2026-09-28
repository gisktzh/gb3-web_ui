import {TestBed} from '@angular/core/testing';
import {MockStore, provideMockStore} from '@ngrx/store/testing';
import {selectUsefulInformationLinksWithDynamicUrls} from '../../../state/support/selectors/useful-information-links.selector';
import {UsefulInformationComponent} from './useful-information.component';

describe('UsefulInformationComponent', () => {
  it('renders links selected for the current runtime configuration', async () => {
    await TestBed.configureTestingModule({imports: [UsefulInformationComponent], providers: [provideMockStore()]}).compileComponents();
    const store = TestBed.inject(MockStore);
    store.overrideSelector(selectUsefulInformationLinksWithDynamicUrls, [
      {label: 'Resources', links: [{title: 'Docs', href: 'https://example.com'}]},
    ]);
    store.refreshState();
    const fixture = TestBed.createComponent(UsefulInformationComponent);
    fixture.detectChanges();
    const link = (fixture.nativeElement as HTMLElement).querySelector<HTMLAnchorElement>('a');
    expect(link?.textContent).toContain('Docs');
    expect(link?.href).toBe('https://example.com/');
  });
});
