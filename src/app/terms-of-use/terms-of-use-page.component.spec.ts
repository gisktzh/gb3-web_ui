import {TestBed} from '@angular/core/testing';
import {MockStore, provideMockStore} from '@ngrx/store/testing';
import {selectScreenMode} from '../state/app/reducers/app-layout.reducer';
import {TermsOfUsePageComponent} from './terms-of-use-page.component';

describe('TermsOfUsePageComponent', () => {
  it('organizes both terms sections and hides the hero summary on mobile', async () => {
    await TestBed.configureTestingModule({imports: [TermsOfUsePageComponent], providers: [provideMockStore()]}).compileComponents();
    const store = TestBed.inject(MockStore);
    store.overrideSelector(selectScreenMode, 'regular');
    store.refreshState();
    const fixture = TestBed.createComponent(TermsOfUsePageComponent);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    expect(element.textContent).toContain('Diese Nutzungshinweise gelten');
    expect(element.querySelector('usage-rules')).not.toBeNull();
    expect(element.querySelector('terms-of-use-geodata-and-maps')).not.toBeNull();

    store.overrideSelector(selectScreenMode, 'mobile');
    store.refreshState();
    fixture.detectChanges();
    expect(element.textContent).not.toContain('Diese Nutzungshinweise gelten');
  });
});
