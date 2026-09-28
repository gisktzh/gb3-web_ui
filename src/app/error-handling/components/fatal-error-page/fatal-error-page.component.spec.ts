import {TestBed} from '@angular/core/testing';
import {ActivatedRoute, convertToParamMap} from '@angular/router';
import {BehaviorSubject} from 'rxjs';
import {FatalErrorPageComponent} from './fatal-error-page.component';

describe('FatalErrorPageComponent', () => {
  it('shows route-provided diagnostics without replacing the recovery guidance', async () => {
    const queryParamMap = new BehaviorSubject(convertToParamMap({error: 'Backend unavailable'}));
    await TestBed.configureTestingModule({
      imports: [FatalErrorPageComponent],
      providers: [{provide: ActivatedRoute, useValue: {queryParamMap}}],
    }).compileComponents();
    const fixture = TestBed.createComponent(FatalErrorPageComponent);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    expect(element.textContent).toContain('Backend unavailable');
    expect(element.textContent).toContain('Laden Sie die Seite erneut');

    queryParamMap.next(convertToParamMap({}));
    fixture.detectChanges();
    expect(element.querySelector('.fatal-error-page__content__text__error-message')).toBeNull();
  });
});
