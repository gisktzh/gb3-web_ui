import {TestBed} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {MockStore, provideMockStore} from '@ngrx/store/testing';
import {selectScreenMode} from '../state/app/reducers/app-layout.reducer';
import {PrivacyPageComponent} from './privacy-page.component';
import {HeroHeaderComponent} from '../shared/components/hero-header/hero-header.component';

describe('PrivacyPageComponent', () => {
  it('shows the privacy summary on regular screens and hides it on mobile', async () => {
    await TestBed.configureTestingModule({imports: [PrivacyPageComponent], providers: [provideMockStore()]}).compileComponents();
    const store = TestBed.inject(MockStore);
    store.overrideSelector(selectScreenMode, 'regular');
    store.refreshState();
    const fixture = TestBed.createComponent(PrivacyPageComponent);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    const hero = fixture.debugElement.query(By.directive(HeroHeaderComponent)).componentInstance as HeroHeaderComponent;
    expect(hero.heroText()).toContain('Verarbeitung personenbezogener Daten');

    store.overrideSelector(selectScreenMode, 'mobile');
    store.refreshState();
    fixture.detectChanges();
    expect(hero.heroText()).toBe('');
    expect(element.querySelector('privacy-content')).not.toBeNull();
  });
});
