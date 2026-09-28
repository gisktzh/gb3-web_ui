import {TestBed} from '@angular/core/testing';
import {MockStore, provideMockStore} from '@ngrx/store/testing';
import {BehaviorSubject} from 'rxjs';
import {TourService} from 'ngx-ui-tour-md-menu';
import {selectScreenMode} from '../../../state/app/reducers/app-layout.reducer';
import {OnboardingGuideComponent} from './onboarding-guide.component';

describe('OnboardingGuideComponent', () => {
  it('derives navigation availability and progress from the shown tour step', async () => {
    const first = {title: 'First'};
    const second = {title: 'Second'};
    const stepShow$ = new BehaviorSubject<unknown>(undefined);
    const tourService = {
      stepShow$,
      steps: [first, second],
      hasNext: vi.fn((step: unknown) => step === first),
      hasPrev: vi.fn((step: unknown) => step === second),
    };
    await TestBed.configureTestingModule({
      imports: [OnboardingGuideComponent],
      providers: [provideMockStore(), {provide: TourService, useValue: tourService}],
    })
      .overrideComponent(OnboardingGuideComponent, {set: {template: '', imports: []}})
      .compileComponents();
    const store = TestBed.inject(MockStore);
    store.overrideSelector(selectScreenMode, 'regular');
    store.refreshState();
    const fixture = TestBed.createComponent(OnboardingGuideComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance.hasNextStep()).toBe(false);
    expect(fixture.componentInstance.hasPreviousStep()).toBe(false);

    stepShow$.next({step: first});
    fixture.detectChanges();
    expect(fixture.componentInstance.hasNextStep()).toBe(true);
    expect(fixture.componentInstance.hasPreviousStep()).toBe(false);
    expect(fixture.componentInstance.progress()).toBe(2);

    stepShow$.next({step: second});
    fixture.detectChanges();
    expect(fixture.componentInstance.hasNextStep()).toBe(false);
    expect(fixture.componentInstance.hasPreviousStep()).toBe(true);
    expect(fixture.componentInstance.progress()).toBe(3);
  });
});
