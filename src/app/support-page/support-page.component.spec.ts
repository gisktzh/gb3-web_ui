import {TestBed} from '@angular/core/testing';
import {provideRouter} from '@angular/router';
import {MockStore, provideMockStore} from '@ngrx/store/testing';
import {selectScreenMode} from '../state/app/reducers/app-layout.reducer';
import {selectAdditionalInformationLinks} from '../state/support/reducers/support-content.reducer';
import {SupportPageComponent} from './support-page.component';

describe('SupportPageComponent', () => {
  it('hosts routed support content and hides the long summary on mobile', async () => {
    await TestBed.configureTestingModule({
      imports: [SupportPageComponent],
      providers: [provideMockStore(), provideRouter([])],
    }).compileComponents();
    const store = TestBed.inject(MockStore);
    store.overrideSelector(selectScreenMode, 'regular');
    store.overrideSelector(selectAdditionalInformationLinks, []);
    store.refreshState();
    const fixture = TestBed.createComponent(SupportPageComponent);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    expect(element.textContent).toContain('Hier finden Sie Antworten');
    expect(element.querySelector('support-page-navigation')).not.toBeNull();
    expect(element.querySelector('router-outlet')).not.toBeNull();

    store.overrideSelector(selectScreenMode, 'mobile');
    store.refreshState();
    fixture.detectChanges();
    expect(element.textContent).not.toContain('Hier finden Sie Antworten');
  });
});
